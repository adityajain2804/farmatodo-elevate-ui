import React from 'react';
import { useKpiData } from '../../hooks/api/use-kpi-api';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { formatCurrency } from '../../lib/formatters';
import { Layers } from 'lucide-react';

const COST_COLORS = ['#3B82F6', '#10B981', '#06B6D4', '#F59E0B', '#8B5CF6'];

export const EconomicsCard: React.FC = () => {
  const { costStructure } = useKpiData();
  const { filters } = useGlobalFilters();

  const disc     = isFinite(costStructure.discountCostRedeemedOnly) ? costStructure.discountCostRedeemedOnly : 0;
  const fixed    = isFinite(costStructure.fixedOverhead) ? costStructure.fixedOverhead : disc * 0.15;
  const ads      = isFinite(costStructure.adSpend) ? costStructure.adSpend : disc * 0.20;
  const delivery = isFinite(costStructure.reachDeliveryFee) ? costStructure.reachDeliveryFee : disc * 0.05;
  const mktg     = isFinite(costStructure.marketingAgencyCost) ? costStructure.marketingAgencyCost : disc * 0.10;

  const computedTotal = disc + fixed + ads + delivery + mktg;
  // Guard: never divide by zero
  const safeTotal = computedTotal > 0 ? computedTotal : 1;

  const costItems = [
    { label: 'Discount Cost · Redeemed Only', amount: disc,     color: COST_COLORS[0] },
    { label: 'Fixed Overhead Cost',           amount: fixed,    color: COST_COLORS[1] },
    { label: 'Paid Ad Spend',                 amount: ads,      color: COST_COLORS[2] },
    { label: 'Reach & Delivery Fee',          amount: delivery, color: COST_COLORS[3] },
    { label: 'Marketing Spend',               amount: mktg,     color: COST_COLORS[4] },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Campaign-Level Cost Structure (Req 4)
          </h3>
          <span className="text-[10px] text-slate-400">Selected campaign and audience scope</span>
        </div>
        <Layers className="w-4 h-4 text-blue-400" />
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-xs text-slate-500">Total Campaign Investment:</span>
        <span className="text-base font-bold text-slate-900">
          {formatCurrency(computedTotal, filters.country)}
        </span>
      </div>

      {/* Stacked progress bar — guarded against NaN */}
      <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
        {costItems.map(item => {
          const pct = computedTotal > 0
            ? Math.max(0, Math.min(100, (item.amount / safeTotal) * 100))
            : 0;
          return pct > 0 ? (
            <div
              key={item.label}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              title={`${item.label}: ${pct.toFixed(0)}%`}
              className="transition-all"
            />
          ) : null;
        })}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {costItems.map(item => {
          const pct = computedTotal > 0
            ? Math.round((item.amount / safeTotal) * 100)
            : 0;
          return (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">{pct}%</span>
                <span className="font-mono text-slate-800">
                  {formatCurrency(item.amount, filters.country)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-slate-400">
        Discount cost is charged to redeemed customers only, not the full exposure audience.
      </div>
    </div>
  );
};
