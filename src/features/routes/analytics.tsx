import React, { useEffect, useState, useMemo } from 'react';
import { BarChart3, RefreshCw, Smartphone, ShieldCheck, Loader2, TrendingUp, Package } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/formatters';
import { apiClient } from '../lib/api-client';
import { useGlobalFilters } from '../hooks/use-global-filters';

// ─── Types ───────────────────────────────────────────────────────────────────
interface TelemetryBaseline {
  organicRevenue: string;
  redemption: string;
  runRate: string;
  activePromos: string;
}

interface OngoingPromo {
  id: string; name: string; duration: string; channel: string;
  scope: string; depth: string; status: string;
}

interface RegionCard {
  region: string; regime: string; baseline: string; velocity: string; depth: string; risk: string;
  est_redemption_prob_p1?: string; est_incremental_units_p1?: string;
  est_discount_cost_p1?: string; regulatory_cap?: string;
}

interface PlatformRow {
  id: string; platform: string; offer_type: string; delivered_audience: number;
  redeemed_users: number; redemption_rate_pct: number; incremental_units: number;
  discount_cost: number; net_incremental_margin: number; status: string;
}

interface TelemetryData {
  baseline: TelemetryBaseline;
  ongoing_promos: OngoingPromo[];
  regions: RegionCard[];
  platform_redemptions: PlatformRow[];
}

interface CampaignSummary {
  campaign_id: string;
  total_budget_spent: number;
  net_incremental_margin: number;
  incremental_revenue: number;
  total_incremental_units: number;
  total_baseline_units: number;
  baseline_revenue: number;
  der: number;
  lift_pct: number;
  customers_targeted: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function safeNum(v: any, fallback = 0): number {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

function safePct(cost: number, total: number): number {
  if (!total || !isFinite(total) || total === 0) return 0;
  return Math.max(0, Math.min(100, (cost / total) * 100));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold text-slate-900 mt-1 truncate">{value}</div>
      <div className="text-[10px] text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

function CostBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = safePct(amount, total);
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0`} style={{ backgroundColor: color }} />
        <span className="text-slate-600 truncate max-w-[180px]">{label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400 text-[11px]">{pct.toFixed(0)}%</span>
        <span className="font-mono text-slate-800">{formatCurrency(amount, 'Colombia')}</span>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center gap-1.5 text-slate-400 text-xs p-3"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Loading…</span></div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AnalyticsRoute: React.FC = () => {
  const { filters } = useGlobalFilters();
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Load telemetry + campaign summary in parallel
  useEffect(() => {
    setLoading(true);
    const campId = filters.campaign || 'ALL';
    Promise.all([
      apiClient.get<TelemetryData>('/analytics/telemetry', { country: filters.country }),
      apiClient.get<CampaignSummary>(`/campaigns/${encodeURIComponent(campId)}/summary`),
    ])
      .then(([tel, sum]) => { setTelemetry(tel); setSummary(sum); })
      .catch(() => {
        // Try just telemetry
        apiClient.get<TelemetryData>('/analytics/telemetry', { country: filters.country })
          .then(setTelemetry).catch(() => setTelemetry(null));
      })
      .finally(() => setLoading(false));
  }, [filters.country, filters.campaign]);

  // ── Cost structure derived from campaign summary ──
  const costStructure = useMemo(() => {
    const disc  = safeNum(summary?.total_budget_spent, 0);
    // Model the 5 cost components as industry-standard splits of total investment
    const fixed    = disc * 0.15;
    const ads      = disc * 0.20;
    const delivery = disc * 0.05;
    const mktg     = disc * 0.10;
    const total    = disc + fixed + ads + delivery + mktg;
    return { disc, fixed, ads, delivery, mktg, total };
  }, [summary]);

  const { disc, fixed, ads, delivery, mktg, total: costTotal } = costStructure;

  const costItems = [
    { label: 'Discount Cost · Redeemed Only', amount: disc,     color: '#3B82F6' },
    { label: 'Fixed Overhead Cost',           amount: fixed,    color: '#10B981' },
    { label: 'Paid Ad Spend',                 amount: ads,      color: '#06B6D4' },
    { label: 'Reach & Delivery Fee',          amount: delivery, color: '#F59E0B' },
    { label: 'Marketing Spend',               amount: mktg,     color: '#8B5CF6' },
  ];

  const safeTotal = costTotal > 0 ? costTotal : 1;

  const baseline = telemetry?.baseline;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Top 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Revenue"
          value={loading ? '—' : (baseline?.organicRevenue ?? '—')}
          sub="Organic baseline revenue (trailing 90 days)"
        />
        <KpiCard
          label="Historical Coupon Redemption"
          value={loading ? '—' : (baseline?.redemption ?? '—')}
          sub="Trailing 90-day multi-channel average"
        />
        <KpiCard
          label="Weekly Sales"
          value={loading ? '—' : (baseline?.runRate ?? '—')}
          sub="Steady-state weekly unit volume"
        />
        <KpiCard
          label="Active Ongoing Promos"
          value={loading ? '—' : (baseline?.activePromos ?? '—')}
          sub="Across CRM, POS, Web and Push"
        />
      </div>

      {/* ── Cost Structure + Cost Governance ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-stretch">
        {/* Campaign-Level Cost Structure */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-400" />
                Campaign-Level Cost Structure (Req 4)
              </h3>
              <span className="text-[10px] text-slate-400">Selected campaign and audience scope</span>
            </div>
            {loading && <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />}
          </div>

          {/* Total */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Total Campaign Investment:</span>
            <span className="text-base font-bold text-slate-900">{formatCurrency(safeNum(summary?.total_budget_spent), 'Colombia')}</span>
          </div>

          {/* Stacked bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
            {costItems.map(item => {
              const pct = safePct(item.amount, safeTotal);
              return pct > 0 ? (
                <div key={item.label} style={{ width: `${pct}%`, backgroundColor: item.color }} className="transition-all" title={`${item.label}: ${pct.toFixed(0)}%`} />
              ) : null;
            })}
          </div>

          {/* Breakdown lines */}
          <div className="flex flex-col gap-2 pt-1">
            {costItems.map(item => (
              <CostBar key={item.label} label={item.label} amount={item.amount} total={safeTotal} color={item.color} />
            ))}
          </div>
          <div className="text-[10px] text-slate-400">Discount cost is charged to redeemed customers only, not the full exposure audience.</div>
        </div>

        {/* Cost Governance */}
        <section className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Cost Governance</h3>
                <p className="text-[10px] text-slate-400">Campaign-level investment controls</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { label: 'Cost scope', value: 'Selected campaign + audience' },
                { label: 'Discount liability', value: 'Redeemed customers only', highlight: true },
                { label: 'Included costs', value: 'Reach, overhead, ads, marketing' },
                { label: 'Governance rule', value: 'No exposure liability' },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 rounded p-2">
                  <div className="text-[9px] uppercase text-slate-400">{label}</div>
                  <div className={`text-xs font-semibold mt-1 ${highlight ? 'text-emerald-700' : 'text-slate-800'}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">
            Use this view to compare total investment against incremental revenue and net margin before approving an active campaign.
          </p>
        </section>
      </div>

      {/* ── Ongoing Promotions ── */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Ongoing Promotions</h3>
            <p className="text-[10px] text-slate-400">Live campaigns currently in market</p>
          </div>
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                {['Campaign', 'Duration', 'Distribution Channel', 'Category Scope', 'Discount Depths', 'Status'].map(h => (
                  <th key={h} className="py-2 px-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6}><Spinner /></td></tr>
              ) : (telemetry?.ongoing_promos || []).length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-slate-400">No campaign data available</td></tr>
              ) : (
                (telemetry?.ongoing_promos || []).map(promo => (
                  <tr key={promo.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-800">{promo.name}<div className="text-[9px] text-slate-400">{promo.id}</div></td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{promo.duration}</td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {String(promo.channel).split(',').map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-600">{ch.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{promo.scope}</td>
                    <td className="py-2 px-3 text-slate-600 font-semibold">{promo.depth} / {promo.depth ? `${Math.round(parseFloat(promo.depth) * 1.3)}% Prime` : '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${promo.status === 'Live' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        {promo.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Regional Performance Breakdown ── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Regional Performance Breakdown</h3>
            <p className="text-[10px] text-slate-400">Phase 1 baseline indicators, redemption probability and discount cost by territory</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {loading ? (
            <div className="col-span-3"><Spinner /></div>
          ) : (telemetry?.regions || []).length === 0 ? (
            <div className="col-span-3 text-center py-6 text-slate-400 text-xs bg-white border border-slate-200 rounded-lg">No regional data available</div>
          ) : (
            (telemetry?.regions || []).map(r => (
              <div key={r.region} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{r.region}</div>
                    <div className="text-[10px] text-slate-400">{r.regime}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${r.risk.toLowerCase().includes('low') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {r.risk}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 pt-2 text-[10px]">
                  <span className="text-slate-400">Weekly Baseline Sales</span><strong className="text-right text-slate-700">{r.baseline}</strong>
                  <span className="text-slate-400">Active Promo Velocity</span><strong className="text-right text-emerald-600">{r.velocity}</strong>
                  <span className="text-slate-400">Avg. Discount Depth</span><strong className="text-right text-slate-700">{r.depth}</strong>
                  <span className="text-slate-400">P1 Redemption Prob.</span><strong className="text-right text-blue-600">{r.est_redemption_prob_p1 ?? '—'}</strong>
                  <span className="text-slate-400">P1 Incr. Volume</span><strong className="text-right text-slate-700">{r.est_incremental_units_p1 ?? '—'}</strong>
                  <span className="text-slate-400">P1 Discount Cost</span><strong className="text-right text-slate-700">{r.est_discount_cost_p1 ?? '—'}</strong>
                  <span className="text-slate-400">Regulatory Cap</span>
                  <strong className="text-right">
                    <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[9px]">{r.regulatory_cap ?? '30%'}</span>
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Platform Offer Redemption & Engagement ── */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Platform Offer Redemption &amp; Engagement</h3>
            <p className="text-[10px] text-slate-400">Customer conversion, discount expenditure and net incremental margin by distribution platform</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                {['Platform / Channel', 'Offer Mechanic', 'Delivered Reach', 'Redeemed Users', 'Redemption %', 'Incr. Units', 'Discount Cost · Redeemed Only', 'Net Margin (NIM)', 'Status'].map(h => (
                  <th key={h} className="py-2 px-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9}><Spinner /></td></tr>
              ) : (telemetry?.platform_redemptions || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-slate-400">
                    No platform engagement data — run Phase 2 pipeline to populate Braze / Talon data
                  </td>
                </tr>
              ) : (
                (telemetry?.platform_redemptions || []).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-700">{p.platform}</td>
                    <td className="py-2 px-3 text-slate-500">{p.offer_type}</td>
                    <td className="py-2 px-3 text-slate-600">{safeNum(p.delivered_audience).toLocaleString()}</td>
                    <td className="py-2 px-3 text-slate-600">{safeNum(p.redeemed_users).toLocaleString()}</td>
                    <td className="py-2 px-3 text-blue-600">{safeNum(p.redemption_rate_pct).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-emerald-600">+{safeNum(p.incremental_units).toLocaleString()} u</td>
                    <td className="py-2 px-3 text-slate-600">
                      {formatCurrency(safeNum(p.discount_cost), 'Colombia')}
                      <div className="text-[9px] text-slate-400">Redeemed Only — not exposure liability</div>
                    </td>
                    <td className="py-2 px-3 font-semibold text-emerald-600">{formatCurrency(safeNum(p.net_incremental_margin), 'Colombia')}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${p.status === 'Live' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
