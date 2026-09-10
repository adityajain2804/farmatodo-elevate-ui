import React from 'react';
import { useKpiData } from '../../hooks/api/use-kpi-api';
import { Split, Info, BarChart2 } from 'lucide-react';

export const CateDecomposition: React.FC = () => {
  const { cateData } = useKpiData();

  const exposurePct = Math.round((cateData.exposureCate / cateData.netCate) * 100);
  const dosePct = Math.round((cateData.doseCate / cateData.netCate) * 100);

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-lg p-4 shadow-card flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              Exposure CATE vs Dose CATE (Req 6)
            </h3>
            <span className="text-[10px] text-slate-400">
              Uplift Proxy Decomposition (backend/models/cate/uplift_proxy.py)
            </span>
          </div>
        </div>
        <BarChart2 className="w-4 h-4 text-slate-400" />
      </div>

      <div className="text-xs text-slate-300 leading-relaxed">
        Total Net CATE: <strong className="text-emerald-400 text-sm">+{cateData.netCate.toFixed(2)} units</strong>{' '}
        <span className="text-[11px] text-slate-400">
          (95% CI: +{cateData.confidenceIntervalLow.toFixed(2)} to +{cateData.confidenceIntervalHigh.toFixed(2)})
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        {/* Exposure CATE */}
        <div className="bg-[#182234] p-3 rounded border border-[#25334d] flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Exposure CATE (Nudge)</span>
            <span className="text-blue-400 font-bold">{exposurePct}%</span>
          </div>
          <div className="text-lg font-bold text-blue-400">
            +{cateData.exposureCate.toFixed(2)} units
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Incremental demand generated purely by the communication trigger (SMS/CRM push), independent of discount depth.
          </p>
        </div>

        {/* Dose CATE */}
        <div className="bg-[#182234] p-3 rounded border border-[#25334d] flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Dose CATE (Price Cut)</span>
            <span className="text-emerald-400 font-bold">{dosePct}%</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            +{cateData.doseCate.toFixed(2)} units
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Incremental price elasticity uplift driven by the specific discount depth (15% regular / 20% Prime).
          </p>
        </div>
      </div>
    </div>
  );
};
