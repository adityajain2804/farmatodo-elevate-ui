import React, { useEffect, useState, useMemo } from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { useResponseCurveData } from '../../hooks/api/use-kpi-api';
import { CurvePointData, CandidateDot } from '../../types';
import { Filter, Sparkles, TrendingUp, AlertTriangle, Info, Zap } from 'lucide-react';

// ─── Dimension constants ──────────────────────────────────────────────────────
const CATEGORY_GROUPS = ['Personal Care', 'OTC', 'Beauty', 'Baby', 'Dermocosmetics', 'Convenience', 'RX'];
const CLUSTER_OPTIONS = [
  { id: 1, label: 'Champions (1)' }, { id: 2, label: 'Loyalists (2)' },
  { id: 3, label: 'Promising (3)' }, { id: 4, label: 'At Risk (4)' },
  { id: 5, label: 'Reactivation (5)' }, { id: 6, label: 'Replenishment (6)' },
  { id: 7, label: 'Low-Engagement (7)' },
];
const DOSE_PILLS = [0, 5, 10, 15, 20, 25, 30];
const RECOMMENDED_DEPTH = 15;

const W = 560, H = 200;
const PAD = { top: 16, right: 24, bottom: 40, left: 48 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const MAX_D = 35;

function sx(d: number) { return PAD.left + (d / MAX_D) * INNER_W; }
function sy(v: number, maxV: number) {
  if (maxV <= 0) return PAD.top + INNER_H;
  return PAD.top + INNER_H - (v / maxV) * INNER_H;
}

function linePath(pts: CurvePointData[], maxV: number): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.depth_pct).toFixed(1)} ${sy(p.expected_lift, maxV).toFixed(1)}`).join(' ');
}

function areaPath(pts: CurvePointData[], maxV: number): string {
  const top = pts.map(p => ({ x: sx(p.depth_pct), y: sy(p.ci_upper, maxV) }));
  const bot = [...pts].reverse().map(p => ({ x: sx(p.depth_pct), y: sy(p.ci_lower, maxV) }));
  return [...top, ...bot].map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';
}

function zoneLabel(d: number, thresh: number, plat: number): { text: string; color: string } {
  if (d < thresh)  return { text: 'Dead Zone – discount too shallow', color: '#6b7280' };
  if (d <= plat)   return { text: 'Sweet Spot – peak conversion velocity', color: '#059669' };
  return { text: 'Margin Burn – diminishing returns', color: '#d97706' };
}

interface Tip { visible: boolean; x: number; y: number; d: number; lift: number; lo: number; hi: number; }

// ─── Component ────────────────────────────────────────────────────────────────
export const ResponseCurve: React.FC = () => {
  const { filters } = useGlobalFilters();
  const [selCat, setSelCat] = useState<string>(filters.category !== 'All' ? filters.category : 'Personal Care');
  const [selCluster, setSelCluster] = useState<number>(1);
  const [activeDose, setActiveDose] = useState<number>(RECOMMENDED_DEPTH);
  const [tip, setTip] = useState<Tip>({ visible: false, x: 0, y: 0, d: 0, lift: 0, lo: 0, hi: 0 });

  const { data, loading, error } = useResponseCurveData(selCat, selCluster);

  useEffect(() => {
    if (filters.category && filters.category !== 'All') setSelCat(filters.category);
  }, [filters.category]);

  const maxLift = useMemo(() => {
    if (!data?.curve?.length) return 2.0;
    return Math.max(...data.curve.map(p => p.ci_upper), 0.1) * 1.1;
  }, [data]);

  const threshPct = data?.d_threshold_pct ?? 10;
  const platPct   = data?.d_plateau_pct   ?? 25;

  const lp = useMemo(() => data ? linePath(data.curve, maxLift) : '', [data, maxLift]);
  const ap = useMemo(() => data ? areaPath(data.curve, maxLift) : '', [data, maxLift]);

  // Candidate dots synthesised at DOSE_PILLS positions
  const dots: CandidateDot[] = useMemo(() => {
    if (!data) return [];
    return DOSE_PILLS.map(dpct => {
      const pt = data.curve.find(p => Math.abs(p.depth_pct - dpct) < 1) ?? { expected_lift: 0, ci_lower: 0, ci_upper: 0, depth_pct: dpct };
      return { depth_pct: dpct, actual_avg_lift: pt.expected_lift, ci_lower: pt.ci_lower, ci_upper: pt.ci_upper };
    });
  }, [data]);

  // Active dose info
  const activeDot = useMemo(() => dots.find(d => d.depth_pct === activeDose), [dots, activeDose]);

  const onMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (!data?.curve?.length) return;
    const rect = e.currentTarget.closest('svg')!.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (W / rect.width);
    const rawD = ((svgX - PAD.left) / INNER_W) * MAX_D;
    const clamped = Math.max(0, Math.min(MAX_D, rawD));
    const nearest = data.curve.reduce((b, p) => Math.abs(p.depth_pct - clamped) < Math.abs(b.depth_pct - clamped) ? p : b);
    setTip({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, d: nearest.depth_pct, lift: nearest.expected_lift, lo: nearest.ci_lower, hi: nearest.ci_upper });
  };

  const yTicks = useMemo(() => {
    const step = maxLift / 4;
    return [0, 1, 2, 3, 4].map(i => parseFloat((i * step).toFixed(2)));
  }, [maxLift]);
  const xTicks = [0, 5, 10, 15, 20, 25, 30, 35];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            Dose-Response Elasticity Curve
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Non-linear Hill GAM · 90% confidence band · {selCat} × Cluster {selCluster}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Filter className="w-3 h-3 text-blue-400" />
            <span>Category:</span>
          </div>
          <select value={selCat} onChange={e => setSelCat(e.target.value)}
            className="h-7 px-2 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded focus:outline-none focus:border-blue-400">
            {CATEGORY_GROUPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selCluster} onChange={e => setSelCluster(Number(e.target.value))}
            className="h-7 px-2 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded focus:outline-none focus:border-blue-400">
            {CLUSTER_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Metric Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-semibold text-blue-700">
          Threshold: {data ? `${threshPct}%` : '—'}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-[10px] font-semibold text-amber-700">
          Plateau: {data ? `${platPct}%` : '—'}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700">
          <Sparkles className="w-3 h-3" />
          Elasticity @15%: {data ? `${data.elasticity_at_15pct}×` : '—'}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600">
          R²: {data ? data.r2_score : '—'}
        </span>
        {activeDot && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-semibold text-indigo-700">
            <Zap className="w-3 h-3" />
            @{activeDose}%: +{activeDot.actual_avg_lift.toFixed(3)} u
          </span>
        )}
        {loading && <span className="text-[10px] text-slate-400 animate-pulse">Loading curve…</span>}
        {error && !loading && (
          <span className="text-[10px] text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />Showing illustrative curve
          </span>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
          {/* Zone fills */}
          <rect x={sx(0)} y={PAD.top} width={Math.max(0, sx(threshPct) - sx(0))} height={INNER_H} fill="#f8fafc" opacity={0.85} />
          <rect x={sx(threshPct)} y={PAD.top} width={Math.max(0, sx(platPct) - sx(threshPct))} height={INNER_H} fill="#ecfdf5" opacity={0.6} />
          <rect x={sx(platPct)} y={PAD.top} width={Math.max(0, sx(MAX_D) - sx(platPct))} height={INNER_H} fill="#fffbeb" opacity={0.7} />

          {/* Grid lines */}
          {yTicks.map(tick => {
            const y = sy(tick, maxLift);
            return (
              <g key={tick}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e2e8f0" strokeWidth={0.8} strokeDasharray="3 3" />
                <text x={PAD.left - 4} y={y + 3.5} textAnchor="end" fontSize={8} fill="#94a3b8">{tick}</text>
              </g>
            );
          })}

          {/* CI Ribbon */}
          {ap && <path d={ap} fill="#3b82f6" fillOpacity={0.10} stroke="none" />}

          {/* Threshold line */}
          {data && (
            <g>
              <line x1={sx(threshPct)} y1={PAD.top} x2={sx(threshPct)} y2={PAD.top + INNER_H} stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="4 3" />
              <text x={sx(threshPct) + 3} y={PAD.top + 10} fontSize={7.5} fill="#3b82f6" fontWeight="600">{threshPct}% min</text>
            </g>
          )}

          {/* Plateau line */}
          {data && (
            <g>
              <line x1={sx(platPct)} y1={PAD.top} x2={sx(platPct)} y2={PAD.top + INNER_H} stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="4 3" />
              <text x={sx(platPct) + 3} y={PAD.top + 10} fontSize={7.5} fill="#d97706" fontWeight="600">{platPct}% plateau</text>
            </g>
          )}

          {/* Recommended depth vertical dashed green line */}
          <g>
            <line x1={sx(RECOMMENDED_DEPTH)} y1={PAD.top} x2={sx(RECOMMENDED_DEPTH)} y2={PAD.top + INNER_H} stroke="#10b981" strokeWidth={1.8} strokeDasharray="5 3" />
            <text x={sx(RECOMMENDED_DEPTH) + 3} y={PAD.top + 22} fontSize={7.5} fill="#059669" fontWeight="700">Rec. {RECOMMENDED_DEPTH}%</text>
          </g>

          {/* Main curve */}
          {lp && <path d={lp} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}

          {/* Illustrative dashed fallback */}
          {!data && !loading && (
            <path
              d={[{ d: 0, u: 0 }, { d: 5, u: 0.05 }, { d: 10, u: 0.28 }, { d: 15, u: 0.62 }, { d: 20, u: 0.84 }, { d: 25, u: 0.93 }, { d: 35, u: 0.97 }]
                .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${sx(pt.d).toFixed(1)} ${sy(pt.u, 1.1).toFixed(1)}`).join(' ')}
              fill="none" stroke="#2563eb" strokeWidth={2.2} strokeDasharray="5 3" strokeLinecap="round"
            />
          )}

          {/* Candidate dots at pill depths */}
          {dots.map(dot => {
            const cx = sx(dot.depth_pct);
            const cy = sy(dot.actual_avg_lift, maxLift);
            const isActive = dot.depth_pct === activeDose;
            const isRec    = dot.depth_pct === RECOMMENDED_DEPTH;
            return (
              <g key={dot.depth_pct}>
                <circle cx={cx} cy={cy} r={isActive || isRec ? 6 : 4.5}
                  fill={isRec ? '#10b981' : isActive ? '#6366f1' : 'white'}
                  stroke={isRec ? '#059669' : isActive ? '#4f46e5' : '#2563eb'} strokeWidth={2} />
                {(isActive || isRec) && (
                  <text x={cx} y={cy - 9} textAnchor="middle" fontSize={7.5} fill={isRec ? '#059669' : '#4f46e5'} fontWeight="700">
                    +{dot.actual_avg_lift.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}

          {/* X-axis */}
          <line x1={PAD.left} y1={PAD.top + INNER_H} x2={W - PAD.right} y2={PAD.top + INNER_H} stroke="#cbd5e1" strokeWidth={1} />
          {xTicks.map(t => (
            <g key={t}>
              <line x1={sx(t)} y1={PAD.top + INNER_H} x2={sx(t)} y2={PAD.top + INNER_H + 4} stroke="#cbd5e1" strokeWidth={0.8} />
              <text x={sx(t)} y={PAD.top + INNER_H + 13} textAnchor="middle" fontSize={8} fill="#94a3b8">{t}%</text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={PAD.left - 32} y={PAD.top + INNER_H / 2} textAnchor="middle" fontSize={8} fill="#64748b"
            transform={`rotate(-90, ${PAD.left - 32}, ${PAD.top + INNER_H / 2})`}>
            Incr. Units (CATE)
          </text>
          <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="#64748b">
            Promotional Discount Depth
          </text>

          {/* Hover overlay */}
          <rect x={PAD.left} y={PAD.top} width={INNER_W} height={INNER_H} fill="transparent"
            onMouseMove={onMouseMove} onMouseLeave={() => setTip(t => ({ ...t, visible: false }))} />
        </svg>

        {/* Tooltip */}
        {tip.visible && (
          <div className="absolute z-10 pointer-events-none bg-gray-900 text-white rounded-lg shadow-lg px-3 py-2 text-[10px] space-y-0.5"
            style={{ left: tip.x + 12, top: tip.y - 10 }}>
            <p className="font-semibold text-gray-200">Depth: {tip.d}%</p>
            <p className="text-blue-300">Expected Lift: +{tip.lift.toFixed(3)} u</p>
            <p className="text-gray-400">90% CI: [{tip.lo.toFixed(3)} – {tip.hi.toFixed(3)}]</p>
            <p style={{ color: zoneLabel(tip.d, threshPct, platPct).color }} className="italic">
              {zoneLabel(tip.d, threshPct, platPct).text}
            </p>
          </div>
        )}
      </div>

      {/* ── Interactive Dose Pills ── */}
      <div className="flex items-center gap-1.5 flex-wrap border-t border-slate-100 pt-2">
        <span className="text-[9px] font-bold uppercase text-slate-400 mr-1">Select Dose:</span>
        {DOSE_PILLS.map(d => {
          const isActive = d === activeDose;
          const isRec    = d === RECOMMENDED_DEPTH;
          return (
            <button
              key={d}
              onClick={() => setActiveDose(d)}
              className={`h-7 px-2.5 rounded-full text-[10px] font-semibold border transition-all ${
                isRec && isActive
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : isRec
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {d === RECOMMENDED_DEPTH ? `${d}% ★ Rec` : `${d}%`}
            </button>
          );
        })}
      </div>

      {/* Commercial Zone Footer */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1 mb-0.5">
            <Info className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">
              Dead Zone (0% – {data ? threshPct : '~10'}%)
            </span>
          </div>
          <p className="text-[9px] text-slate-500">Discount too shallow to motivate additional baskets. Budget wasted.</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wide">
              Sweet Spot ({data ? threshPct : '~10'}% – {data ? platPct : '~25'}%)
            </span>
          </div>
          <p className="text-[9px] text-blue-600">Maximum conversion velocity per margin dollar. Target this window.</p>
        </div>
        <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center gap-1 mb-0.5">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wide">
              Margin Plateau (&gt;{data ? platPct : '~25'}%)
            </span>
          </div>
          <p className="text-[9px] text-amber-600">Volume saturates. Deeper discounts erode margin with no extra unit lift.</p>
        </div>
      </div>
    </div>
  );
};
