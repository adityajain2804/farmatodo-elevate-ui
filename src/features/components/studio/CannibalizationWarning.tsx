import React from 'react';
import { useKpiData } from '../../hooks/api/use-kpi-api';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { formatCurrency } from '../../lib/formatters';
import { AlertTriangle, ArrowDownRight, TrendingUp } from 'lucide-react';

export const CannibalizationWarning: React.FC = () => {
  const { cannibalization } = useKpiData();
  const { filters } = useGlobalFilters();

  return (
    <div className="bg-[#111827] border border-amber-500/30 rounded-lg p-3.5 shadow-card flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
            Cannibalization Audit (Req 9)
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">Intertemporal &amp; Cross-SKU</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#182234] p-2 rounded border border-[#25334d]">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Cross-Product Loss</span>
            <ArrowDownRight className="w-3 h-3 text-red-400" />
          </div>
          <div className="font-bold text-red-400 mt-1">
            -{formatCurrency(cannibalization.crossProductLossMargin, filters.country)}
          </div>
          <div className="text-[10px] text-slate-400">
            -{cannibalization.crossProductLossUnits} units on adjacent SKUs
          </div>
        </div>

        <div className="bg-[#182234] p-2 rounded border border-[#25334d]">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Pull-Forward Demand</span>
            <ArrowDownRight className="w-3 h-3 text-amber-400" />
          </div>
          <div className="font-bold text-amber-400 mt-1">
            -{formatCurrency(cannibalization.pullForwardLossMargin, filters.country)}
          </div>
          <div className="text-[10px] text-slate-400">
            -{cannibalization.pullForwardLossUnits} units in weeks +1 to +3
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1f293d] text-xs">
        <span className="text-slate-400 font-medium">True Net Incremental Gain:</span>
        <span className="font-bold text-emerald-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {formatCurrency(cannibalization.netIncrementalGain, filters.country)}
        </span>
      </div>
    </div>
  );
};
