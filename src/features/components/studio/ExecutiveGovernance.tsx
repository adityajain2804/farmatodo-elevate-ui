import React from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { Upload } from 'lucide-react';
import { EconomicsCard } from './EconomicsCard';

interface Props {
  clusterDist: any[];
}

export const ExecutiveGovernance: React.FC<Props> = ({ clusterDist = [] }) => {
  const { filters } = useGlobalFilters();

  const segments = clusterDist.length > 0 ? clusterDist : [
    { id: 'A', name: 'Champions (1)', percentage: 32.9, color: '#10b981', count: 2215 },
    { id: 'B', name: 'Loyalists (2)', percentage: 11.0, color: '#06b6d4', count: 740 },
    { id: 'C', name: 'Promising (3)', percentage: 17.0, color: '#6366f1', count: 1144 },
    { id: 'D', name: 'At Risk (4)', percentage: 2.2, color: '#f59e0b', count: 148 },
    { id: 'E', name: 'Reactivation (5)', percentage: 6.2, color: '#ef4444', count: 417 },
    { id: 'F', name: 'Replenishment (6)', percentage: 18.5, color: '#8b5cf6', count: 1245 },
    { id: 'G', name: 'Low-Eng (7)', percentage: 25.1, color: '#94a3b8', count: 1690 }
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Executive Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Executive Summary &amp; Governance
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Vertical 3 - Approval</p>
        </div>

        <div className="text-xs space-y-1.5 text-slate-600 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-400">Active Campaign</span>
            <span className="font-semibold text-slate-800">Awareness</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Campaign ID</span>
            <span className="font-semibold text-slate-800">AWARE-2025-VIT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Audience Type</span>
            <span className="font-semibold text-slate-800">Personalized Segment</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Clusters in scope</span>
            <span className="font-semibold text-slate-800">7 of 7</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Channel - Tier</span>
            <span className="font-semibold text-slate-800">Digital CRM - All</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Customers scored</span>
            <span className="font-semibold text-slate-800">200</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          Override Recommendation
        </button>

        <button
          type="button"
          className="w-full h-8 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Export to RMS / Approve Campaign</span>
        </button>
      </div>

      {/* Cluster Distribution Donut Chart matching Image 1 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-900">Cluster Distribution</h4>
          <span className="text-[10px] text-slate-400">6,731 total</span>
        </div>

        {/* Donut Visual */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Donut */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="16" />
              {/* Champions */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="78 160" strokeDashoffset="0" />
              {/* Loyalists */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="26 212" strokeDashoffset="-78" />
              {/* Promising */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="16" strokeDasharray="40 198" strokeDashoffset="-104" />
              {/* Replenishment */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="44 194" strokeDashoffset="-144" />
              {/* Low Eng */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#94a3b8" strokeWidth="16" strokeDasharray="50 188" strokeDashoffset="-188" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-slate-800">6.7k</span>
              <span className="text-[8px] text-slate-400 uppercase">Targeted</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600 font-medium">
          {segments.map(seg => (
            <div key={seg.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="truncate">{seg.name}</span>
              </div>
              <span className="font-bold text-slate-800">{seg.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <EconomicsCard />

    </div>
  );
};
