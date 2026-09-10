import React from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { Country } from '../../types';
import { Calendar, Bell, ChevronDown } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ activeTab, setActiveTab, children }) => {
  const { filters, setFilter } = useGlobalFilters();

  const tabs = [
    { id: 'studio', label: 'Campaign Studio' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'causal', label: 'Causal Deep-Dive' },
    { id: 'campaign', label: 'Post-Campaign Measurement & Audit' },
    { id: 'graph', label: 'Knowledge Graph' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Top Header matching Image 1 */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1e3a8a] flex items-center justify-center font-bold text-white text-sm tracking-tight shadow-xs">
            FT
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
              FarmaTodo Promotion Intelligence Studio
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              CRO STRATEGY &amp; CAMPAIGN PLANNING WORKSPACE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Engine Mode */}
          <span className="hidden xl:inline text-xs text-slate-500 font-medium">
            Engine Mode: <strong className="text-slate-700 font-semibold">Phase 1 Rules + Phase 2 Causal ML</strong>
          </span>

          {/* Country Selector */}
          <div className="relative">
            <select
              value={filters.country}
              onChange={e => setFilter('country', e.target.value as Country)}
              className="h-8 pl-3 pr-7 bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded shadow-xs focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
            >
              <option value="Colombia">Colombia (COP - INVIMA Rules)</option>
              <option value="Venezuela">Venezuela (Bs. - SUNDDE Rules)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Notifications */}
          <div className="relative cursor-pointer p-1 text-slate-500 hover:text-slate-800">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
              MR
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">M. Rodríguez</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Calendar Cutoff Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Planning Cutoff: 15 Jan - Campaign Start: 30 Jan (Locked)</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-4">
        {children}
      </main>

      {/* Bottom Status Bar matching Image 1 */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2 text-[11px] text-slate-500 flex items-center justify-between">
        <div>
          Data: <strong className="text-emerald-600 font-semibold">Healthy</strong> | Model: <strong>Phase 2 Causal</strong> | Optimizer: <strong>Ready</strong> | Last Refresh: <strong>2026-06-01</strong> | Country: <strong>{filters.country}</strong>
        </div>
        <div>
          Environment: <strong className="text-blue-600 font-semibold">LIVE</strong>
        </div>
      </footer>
    </div>
  );
};
