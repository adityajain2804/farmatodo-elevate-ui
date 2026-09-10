import React from 'react';
import { useKpiData } from '../../hooks/api/use-kpi-api';
import { UserPlus, RefreshCw, BarChart } from 'lucide-react';

export const FreshCustomerUplift: React.FC = () => {
  const { freshCustomerData } = useKpiData();

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-lg p-4 shadow-card flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
            Fresh Customers Uplift vs Replenishment (Req 8)
          </h3>
          <span className="text-[10px] text-slate-400">
            Counterfactual Baseline Decomposition (counterfactual_baseline.py)
          </span>
        </div>
        <BarChart className="w-4 h-4 text-blue-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Fresh Customers Card */}
        <div className="bg-[#182234] p-3.5 rounded border border-[#25334d] flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Fresh / New Acquisition</span>
            <UserPlus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            +{freshCustomerData.freshCustomerLift}%
          </div>
          <div className="text-xs text-slate-200">
            {freshCustomerData.freshCustomerVolume.toLocaleString()} converted buyers
          </div>
          <p className="text-[10px] text-slate-400">
            Net incremental customer additions with zero prior 90-day organic purchase history.
          </p>
        </div>

        {/* Replenishment Customers Card */}
        <div className="bg-[#182234] p-3.5 rounded border border-[#25334d] flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Replenishment Acceleration</span>
            <RefreshCw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400">
            +{freshCustomerData.replenishmentLift}%
          </div>
          <div className="text-xs text-slate-200">
            {freshCustomerData.replenishmentVolume.toLocaleString()} accelerated repurchases
          </div>
          <p className="text-[10px] text-slate-400">
            Existing organic customers repurchasing earlier than the counterfactual expectation ({freshCustomerData.counterfactualBaseline.toLocaleString()} units).
          </p>
        </div>
      </div>
    </div>
  );
};
