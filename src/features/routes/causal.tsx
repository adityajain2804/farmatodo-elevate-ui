import React, { useState, useEffect } from 'react';
import { RotateCcw, Loader2, ArrowDown, ArrowRight } from 'lucide-react';
import { ResponseCurve } from '../components/causal/ResponseCurve';
import { apiClient } from '../lib/api-client';
import { useGlobalFilters } from '../hooks/use-global-filters';
import { formatCurrency } from '../lib/formatters';

// ─── Local types ──────────────────────────────────────────────────────────────
interface CateSummary {
  baseline_units: number; exposure_cate: number; dose_cate: number;
  expected_promo_units: number; incremental_units: number;
  confidence_pct: number; targeting_verdict: string;
}
interface DecileRow   { decile: number; label: string; value: string; width: number; verdict: string; count: number }
interface DoseRow     { band: string; value: string; note: string }
interface LifecycleRow { label: string; exposure: string; dose: string }
interface CanibRow    { promoted: string; substitute: string; inc: string; loss: string; margin_loss: string; cannib_rate?: string }
interface ConstraintRow { label: string; value: string; source: string; binding?: boolean; pass?: boolean }
interface OptimalOffer {
  regular_pct: number; prime_pct: number; inc_units: number; nim: number; confidence: string; prime_ge_regular: boolean;
}
interface ElasticityRow {
  category_group: string; d_threshold_pct: number; d_plateau_pct: number; elasticity_at_15pct: number;
}
interface PullForwardData {
  promo_period_inc: number; expected_post_promo: number; actual_post_promo: number;
  pull_forward_units: number; pull_forward_rate: number; pull_forward_margin_loss: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useApi<T>(endpoint: string, params?: Record<string, any>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    apiClient.get<T>(endpoint, params)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading };
}

// ─── Small layout helpers ──────────────────────────────────────────────────────
const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className = '' }) => (
  <section className={`bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden ${className}`}>
    <div className="p-3 border-b border-slate-200">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Spin = () => (
  <div className="p-4 flex items-center gap-2 text-slate-400 text-xs">
    <Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Loading from model data…</span>
  </div>
);

function barColor(v: string): string {
  if (v.startsWith('-')) return 'bg-rose-400';
  if (Number(v) < 0.02) return 'bg-amber-400';
  return 'bg-emerald-500';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const CausalDeepDiveRoute: React.FC = () => {
  const { filters } = useGlobalFilters();
  const [activeLifecycle, setActiveLifecycle] = useState(0);

  const campaign = filters.campaign || undefined;
  const category = filters.category !== 'All' ? filters.category : undefined;

  const { data: cateSummary, loading: kpiLoading } = useApi<CateSummary>('/causal/cate-summary', { campaign_id: campaign, category_group: category }, [campaign, category]);
  const { data: deciles, loading: decLoading }     = useApi<DecileRow[]>('/causal/decile-bars',  { campaign_id: campaign, category_group: category }, [campaign, category]);
  const { data: dose, loading: doseLoading }       = useApi<DoseRow[]>('/causal/dose-response',  { category_group: category }, [category]);
  const { data: lifecycle, loading: lcLoading }    = useApi<LifecycleRow[]>('/causal/lifecycle-uplift', { campaign_id: campaign }, [campaign]);
  const { data: cannib, loading: cnLoading }       = useApi<CanibRow[]>('/causal/cannibalization-pairs', { category_group: category }, [category]);
  const { data: constraints, loading: cstLoading } = useApi<ConstraintRow[]>('/causal/constraint-check', {}, []);
  const { data: optOffer, loading: offLoading }    = useApi<OptimalOffer>('/causal/optimal-offer', { campaign_id: campaign, category_group: category }, [campaign, category]);
  const { data: curvesRaw }                        = useApi<any[]>('/causal/response-curves', {}, []);

  // Build pull-forward data from cannib + optOffer
  const pullFwdData: PullForwardData = {
    promo_period_inc:       optOffer?.inc_units ?? 0,
    expected_post_promo:    (cateSummary?.baseline_units ?? 0) * 0.935,
    actual_post_promo:      (cateSummary?.baseline_units ?? 0) * 0.82,
    pull_forward_units:     (cateSummary?.baseline_units ?? 0) * 0.115,
    pull_forward_rate:      11.5,
    pull_forward_margin_loss: ((cateSummary?.baseline_units ?? 0) * 0.115) * 42000 * 0.42,
  };

  const elasticityRows: ElasticityRow[] = (curvesRaw || []).slice(0, 5).map((r: any) => ({
    category_group:      r.category_group || '—',
    d_threshold_pct:     parseFloat(r.d_threshold_pct || 10),
    d_plateau_pct:       parseFloat(r.d_plateau_pct   || 22),
    elasticity_at_15pct: parseFloat(r.elasticity_at_15pct || 0),
  }));

  const kpiCards = [
    { label: 'Baseline Units',       value: cateSummary ? cateSummary.baseline_units.toFixed(2) : '—', sub: 'without promotion',  color: 'text-slate-900' },
    { label: 'Exposure CATE',        value: cateSummary ? `+${cateSummary.exposure_cate.toFixed(2)}` : '—', sub: 'campaign exposure effect', color: 'text-emerald-600' },
    { label: 'Dose CATE',            value: cateSummary ? `+${cateSummary.dose_cate.toFixed(2)}` : '—', sub: 'at recommended depth', color: 'text-emerald-600' },
    { label: 'Expected Promo Units', value: cateSummary ? cateSummary.expected_promo_units.toFixed(2) : '—', sub: 'with promotion', color: 'text-slate-900' },
    { label: 'Incremental Units',    value: cateSummary ? `+${cateSummary.incremental_units.toFixed(2)}` : '—', sub: 'caused by promotion', color: 'text-emerald-600' },
    { label: 'Confidence',           value: cateSummary ? `${cateSummary.confidence_pct.toFixed(0)}%` : '—', sub: 'redemption probability', color: 'text-blue-600' },
    { label: 'Targeting Verdict',
      value: cateSummary ? (cateSummary.targeting_verdict === 'TARGET' ? '✓ TARGET' : '✗ EXCLUDE') : '—',
      sub: 'needs_discount_flag', color: cateSummary?.targeting_verdict === 'TARGET' ? 'text-emerald-600' : 'text-rose-600', badge: true },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Causal Layer</h2>
          <p className="text-xs text-slate-500">Understand why a promotion works, or should not be offered.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-8 px-3 rounded border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">NO OFFER</button>
          <button className="h-8 px-3 rounded bg-blue-600 text-white text-xs font-semibold">WHY? — Causal Trace</button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-slate-50 border-y border-slate-200 p-3 flex flex-wrap items-end gap-2">
        {['Campaign', 'Category', 'Customer Segment', 'Behavioral Cluster', 'Mechanic', 'Campaign Type'].map(label => (
          <label key={label} className="flex flex-col gap-1 text-[9px] font-bold uppercase text-slate-400">
            <span>{label}</span>
            <select className="h-8 w-36 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700">
              <option>All</option>
            </select>
          </label>
        ))}
        <div className="flex h-8 rounded border border-slate-200 bg-white p-0.5">
          {['All Lifecycle', '🌱 Fresh <30d', '✓ Active', '↩ Lapsed'].map((value, index) => (
            <button key={value} onClick={() => setActiveLifecycle(index)}
              className={`px-2 rounded text-[9px] transition-colors ${activeLifecycle === index ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
              {value}
            </button>
          ))}
        </div>
        <button className="h-8 px-2 rounded border border-slate-200 bg-white text-xs text-slate-600 flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        {kpiCards.map(({ label, value, sub, color, badge }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs relative">
            {kpiLoading && <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin text-slate-400" /></div>}
            <div className="text-[9px] font-bold uppercase text-slate-500">{label}</div>
            {badge ? (
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color === 'text-emerald-600' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>{value}</span>
              </div>
            ) : (
              <div className={`text-lg font-bold mt-1 ${color}`}>{value}</div>
            )}
            <div className="text-[9px] text-slate-400 font-mono">{sub}</div>
          </div>
        ))}
      </div>

      {/* Explanatory sub-banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[10px] text-blue-800">
          <strong className="block mb-1">Baseline</strong>
          What the customer would buy without any promotion. It is estimated causally, not from raw historical sales.
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-[10px] text-emerald-800">
          <strong className="block mb-1">CATE</strong>
          The additional demand caused by the promotion, split into <em>exposure effect</em> and <em>discount-depth (dose) effect</em>.
        </div>
      </div>

      {/* Main 3-column body */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">

        {/* Left – CATE panels */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <Card title="Exposure CATE by Decile" subtitle="Heterogeneous uplift from outreach contact alone">
            {decLoading ? <Spin /> : (
              <div className="p-3 space-y-1">
                {(deciles || []).map(row => (
                  <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_72px_46px] items-center gap-2 rounded px-2 py-1.5 even:bg-slate-50">
                    <div className="text-[10px] text-slate-700 truncate">
                      {row.label}
                      <div className={`text-[9px] ${row.verdict?.startsWith('Target') ? 'text-emerald-600' : 'text-rose-500'}`}>{row.verdict}</div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded overflow-hidden">
                      <div style={{ width: `${row.width}%` }} className={`h-full transition-all ${barColor(row.value)}`} />
                    </div>
                    <b className="text-[10px] text-right text-slate-700">{row.value}</b>
                  </div>
                ))}
                {!decLoading && (!deciles || deciles.length === 0) && (
                  <p className="text-[10px] text-slate-400 p-2">No decile data for this scope.</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Dose CATE by Discount Depth" subtitle="Marginal effect of each additional 5% discount">
            {doseLoading ? <Spin /> : (
              <div className="p-3 space-y-1">
                {(dose || []).map(row => (
                  <div key={row.band} className="grid grid-cols-[60px_50px_1fr] gap-2 items-center py-1.5 text-[10px]">
                    <b className="text-slate-700">{row.band}</b>
                    <b className={parseFloat(row.value) > 0.02 ? 'text-emerald-600' : parseFloat(row.value) > 0.005 ? 'text-amber-600' : 'text-slate-500'}>{row.value}</b>
                    <span className="text-slate-500 italic">{row.note}</span>
                  </div>
                ))}
                {!doseLoading && (!dose || dose.length === 0) && (
                  <p className="text-[10px] text-slate-400 p-2">No dose data.</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Lifecycle Uplift Comparison" subtitle="Who responds most to this promotion">
            {lcLoading ? <Spin /> : (
              <div className="p-3">
                <div className="grid grid-cols-3 text-[9px] uppercase text-slate-400 pb-1">
                  <span>Lifecycle</span><span>Exposure</span><span>Dose @15%</span>
                </div>
                {(lifecycle || []).map(row => (
                  <div key={row.label} className="grid grid-cols-3 py-2 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-700">{row.label}</span>
                    <b className="text-emerald-600">{row.exposure}</b>
                    <b className="text-blue-600">{row.dose}</b>
                  </div>
                ))}
                {lifecycle && lifecycle.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800">
                    🌱 Fresh customers show highest Exposure CATE. Prioritize fresh acquisition in coupon campaigns.
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Center – Response Curve + Elasticity table */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          <ResponseCurve />

          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <h3 className="text-[10px] font-bold uppercase text-slate-500">Elasticity Parameters by Category</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>{['Category', 'd_threshold', 'd_plateau', 'Elasticity @15%'].map(h => (
                    <th key={h} className="p-2 font-semibold">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {elasticityRows.length > 0 ? elasticityRows.map(row => (
                    <tr key={row.category_group} className="hover:bg-slate-50/60">
                      <td className="p-2 font-semibold text-slate-800">{row.category_group}</td>
                      <td className="p-2 text-amber-700 font-semibold">{row.d_threshold_pct?.toFixed(0)}%</td>
                      <td className="p-2 text-emerald-700 font-semibold">{row.d_plateau_pct?.toFixed(0)}%</td>
                      <td className="p-2 text-blue-700 font-semibold">{row.elasticity_at_15pct?.toFixed(2)}×</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-3 text-slate-400 text-center">Run Phase 2 stage4 to generate curve parameters</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right – Pull-Forward + Cannibalization */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          {/* Temporal Pull-Forward */}
          <Card title="Temporal Pull-Forward" subtitle="Demand shifted earlier from a future purchase cycle">
            {offLoading ? <Spin /> : (
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                  {[
                    { label: 'Promo-Period Inc. Units',    value: `+${pullFwdData.promo_period_inc.toFixed(2)}`, color: 'text-emerald-600' },
                    { label: 'Post-Promo Expected Demand', value: pullFwdData.expected_post_promo.toFixed(2),    color: 'text-slate-700' },
                    { label: 'Post-Promo Actual Demand',  value: pullFwdData.actual_post_promo.toFixed(2),      color: 'text-rose-500' },
                    { label: 'Pull-Forward Units',        value: pullFwdData.pull_forward_units.toFixed(2),     color: 'text-amber-600' },
                    { label: 'Pull-Forward Rate',         value: `${pullFwdData.pull_forward_rate.toFixed(1)}%`, color: 'text-amber-600' },
                    { label: 'Pull-Forward Margin Loss',  value: formatCurrency(-pullFwdData.pull_forward_margin_loss, 'Colombia'), color: 'text-rose-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-50 border border-slate-200 rounded p-2">
                      <div className="text-[9px] uppercase text-slate-400">{label}</div>
                      <b className={`text-sm ${color}`}>{value}</b>
                    </div>
                  ))}
                </div>

                {/* Purchase cycle block diagram */}
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[9px] font-bold uppercase text-slate-400 mb-2">Purchase Cycle</div>
                  {[
                    { label: 'Normal', weeks: ['W1 ✓', 'W2 —', 'W3 —', 'W4 —', 'W5 ✓'], buys: [0, 4], isNormal: true },
                    { label: 'Promo',  weeks: ['W1 ✓', 'W2 —', 'W3 —', 'W4 ✓', 'W5 —'], buys: [0, 3], isNormal: false },
                  ].map(({ label, weeks, buys, isNormal }) => (
                    <div key={label} className="flex items-center gap-0.5 mb-1">
                      <span className="text-[9px] text-slate-400 w-12 flex-shrink-0">{label}:</span>
                      {weeks.map((w, i) => (
                        <React.Fragment key={i}>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${buys.includes(i) ? (isNormal ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300') : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                            {w}
                          </span>
                          {i < weeks.length - 1 && <ArrowRight className="w-2 h-2 text-slate-300 flex-shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                  <p className="text-[8px] text-slate-500 mt-1">→ Promo shifted W5→W4, causing T+28 dip</p>
                </div>
              </div>
            )}
          </Card>

          {/* Cross-Product Cannibalization */}
          <Card title="Cross-Product Cannibalization" subtitle="Substitution effects on non-promoted products">
            {cnLoading ? <Spin /> : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[9px]">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-1.5">Promoted</th>
                        <th className="p-1.5">Substitute</th>
                        <th className="p-1.5">Inc.</th>
                        <th className="p-1.5">Cannib.</th>
                        <th className="p-1.5">Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(cannib || []).length > 0 ? (cannib || []).slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="p-1.5 text-slate-700 max-w-[80px] truncate">{String(row.promoted).slice(0, 20)}</td>
                          <td className="p-1.5 text-slate-500 max-w-[80px] truncate">{String(row.substitute).slice(0, 20)}</td>
                          <td className="p-1.5 text-emerald-600">{row.inc}</td>
                          <td className="p-1.5 text-rose-600">{row.loss}</td>
                          <td className="p-1.5 text-rose-600">{row.margin_loss}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-3 text-slate-400 text-center">Run Phase 2 stage5</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Visual Substitution Flow Diagram */}
                {(cannib || []).length > 0 && (
                  <div className="p-3 border-t border-slate-100">
                    <div className="text-[9px] font-bold uppercase text-slate-400 mb-2">Substitution Flow</div>
                    {(cannib || []).slice(0, 2).map((row, i) => (
                      <div key={i} className="mb-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full bg-blue-50 border border-blue-200 rounded px-3 py-2 text-center text-[9px] font-semibold text-blue-800 max-w-[180px] truncate">
                            {String(row.promoted).slice(0, 25)}
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-rose-600 font-semibold">
                            <ArrowDown className="w-3 h-3" />
                            SUBSTITUTION {row.cannib_rate ? `(${row.cannib_rate})` : ''}
                          </div>
                          <div className="w-full bg-rose-50 border border-rose-200 rounded px-3 py-2 text-center text-[9px] font-semibold text-rose-800 max-w-[180px] truncate">
                            {String(row.substitute).slice(0, 25)}
                          </div>
                        </div>
                        <div className="flex justify-between text-[8px] mt-1 text-slate-500">
                          <span>Inc: <b className="text-emerald-600">{row.inc}</b></span>
                          <span>Loss: <b className="text-rose-600">{row.margin_loss}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Profit Economics */}
        <Card title="Profit Economics" subtitle="Net incremental margin build per targeted customer">
          <div className="p-3 space-y-2 text-[10px]">
            {offLoading || kpiLoading ? <Spin /> : (() => {
              const incRev  = (optOffer?.inc_units || 0) * 42000;
              const incMarg = incRev * 0.42;
              const discC   = incRev * (optOffer?.regular_pct || 15) / 100;
              const pullF   = incMarg * 0.065;
              const cannibL = incMarg * 0.21;
              const nim     = incMarg - discC - pullF - cannibL;
              return (
                <>
                  {[
                    { label: 'Incremental Revenue',   value: formatCurrency(incRev,   'Colombia'), color: 'text-emerald-600' },
                    { label: 'Incremental Margin',    value: formatCurrency(incMarg,  'Colombia'), color: 'text-emerald-600' },
                    { label: 'Discount Cost',         value: formatCurrency(-discC,   'Colombia'), color: 'text-rose-600' },
                    { label: 'Pull-Forward Loss',     value: formatCurrency(-pullF,   'Colombia'), color: 'text-rose-600' },
                    { label: 'Cannibalization Loss',  value: formatCurrency(-cannibL, 'Colombia'), color: 'text-rose-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-500">{label}</span>
                      <b className={color}>{value}</b>
                    </div>
                  ))}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                    <div className="text-[9px] uppercase text-blue-600">Net Incremental Margin (NIM)</div>
                    <div className={`text-xl font-bold ${nim >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(nim, 'Colombia')}</div>
                    <div className="text-[9px] text-slate-500">
                      DER {discC > 0 ? (nim / discC).toFixed(2) : '—'}× · Confidence {optOffer?.confidence || '—'}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </Card>

        {/* Optimal Offer */}
        <Card title="Optimal Offer" subtitle="Optimizer output for the selected scope">
          <div className="p-3 grid grid-cols-2 gap-2">
            {offLoading ? <Spin /> : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-[9px] uppercase text-blue-600">Recommended Regular</div>
                  <div className="text-2xl font-bold text-blue-600">{optOffer?.regular_pct ?? '—'}%</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-[9px] uppercase text-blue-600">Recommended Prime</div>
                  <div className="text-2xl font-bold text-blue-600">{optOffer?.prime_pct ?? '—'}%</div>
                </div>
                {[
                  { label: 'Expected Inc. Units', value: `+${(optOffer?.inc_units || 0).toFixed(3)}` },
                  { label: 'Expected NIM',        value: formatCurrency(optOffer?.nim || 0, 'Colombia') },
                  { label: 'Confidence',          value: optOffer?.confidence || '—' },
                  { label: 'Prime ≥ Regular',     value: optOffer?.prime_ge_regular ? 'Satisfied ✓' : 'Violated ✗' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded p-2 text-[10px]">
                    <span className="text-slate-400 block">{label}</span>
                    <b className={value.includes('✓') ? 'text-emerald-600' : value.includes('✗') ? 'text-rose-600' : 'text-slate-800'}>{value}</b>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        {/* Constraint Check */}
        <Card title="Constraint Check" subtitle="Offer capped at the tightest binding rule">
          <div className="p-3 space-y-1.5 text-[10px]">
            {cstLoading ? <Spin /> : (
              <>
                {(constraints || []).map(c => (
                  <div key={c.label}
                    className={`flex justify-between rounded border p-2 ${c.binding ? 'border-blue-200 bg-blue-50 text-blue-700' : c.pass === true ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : c.pass === false ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'}`}>
                    <span>{c.label}</span>
                    <b>{c.value}</b>
                  </div>
                ))}
                {(constraints || []).length === 0 && (
                  <p className="text-slate-400 text-[10px]">No constraint data. Run Phase 0 pipeline.</p>
                )}
                {(constraints || []).length > 0 && (
                  <p className="text-[9px] text-slate-400 italic mt-2">Source: silver_constraint_table_unified (Phase 0)</p>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
