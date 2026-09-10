import React from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { KpiRibbonData } from '../../types';
import { Info } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/formatters';

interface Props {
  kpis: KpiRibbonData;
}

export const KpiRibbon: React.FC<Props> = ({ kpis }) => {
  const { filters } = useGlobalFilters();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
      {/* 1. Incremental Revenue */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Incremental Revenue</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {formatCurrency(kpis.incrementalRevenue, filters.country)}
        </div>
        <div className="text-[11px] text-emerald-600 font-medium mt-1">
          +14.7% incremental revenue uplift
        </div>
      </div>

      {/* 2. Incremental Units */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Incremental Units</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {formatNumber(kpis.incrementalUnits)} units
        </div>
        <div className="text-[11px] text-emerald-600 font-medium mt-1">
          +14.4% net units above organic baseline
        </div>
      </div>

      {/* 3. True Promo ROI */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>True Promo ROI</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {kpis.promoRoi}%
        </div>
        <div className="text-[11px] text-emerald-600 font-medium mt-1">
          +13.7% Net / Total Promo Investment
        </div>
      </div>

      {/* 4. Customer Targeted Count */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Customer Targeted Count</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {kpis.customerTargetedCount.toLocaleString()}
        </div>
        <div className="text-[11px] text-emerald-600 font-medium mt-1">
          +8.2% Eligible campaign cohort size
        </div>
      </div>

      {/* 5. Audience Reached */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Audience Reached</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {kpis.audienceReached.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-500 font-medium mt-1">
          92% of targeted Digital CRM audience
        </div>
      </div>

      {/* 6. Redemption Rate */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Redemption Rate</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {kpis.redemptionRate.toFixed(1)}%
        </div>
        <div className="text-[11px] text-emerald-600 font-medium mt-1">
          +4.1% Coupon / offer redemptions
        </div>
      </div>

      {/* 7. Discount Efficiency Ratio / Redeemed Cost (Req 5) */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Discount Efficiency (DER)</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">
          {kpis.discountEfficiencyRatio.toFixed(2)}x
        </div>
        <div className="text-[11px] text-slate-500 font-medium mt-1">
          {formatCurrency(kpis.discountCost, filters.country)} redeemed-only discount cost · DER target &gt; 3.5x
        </div>
      </div>
    </div>
  );
};
