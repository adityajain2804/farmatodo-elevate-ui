import React from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { Filter, RotateCcw } from 'lucide-react';

interface Props {
  skuList?: any[];
  embedded?: boolean;
  compact?: boolean;
}

export const FilterBar: React.FC<Props> = ({ skuList = [], embedded = false, compact = false }) => {
  const { filters, setFilter, resetFilters } = useGlobalFilters();

  const skus = skuList.length > 0 ? skuList : [
    { sku: 'SKU-00001', name: "Johnson's Personal Care 001", category: 'Personal Care' },
    { sku: 'SKU-00002', name: 'Rexona Personal Care 012', category: 'Personal Care' },
    { sku: 'SKU-00003', name: 'Pfizer OTC 225', category: 'OTC' },
    { sku: 'SKU-00004', name: 'Vichy Dermocosmetics 324', category: 'Dermocosmetics' },
    { sku: 'SKU-00005', name: 'Garnier Beauty 363', category: 'Beauty' }
  ];

  return (
    <div className={`${embedded ? 'p-0' : 'bg-white border border-slate-200 p-3 rounded-lg shadow-xs mb-4'} flex flex-wrap items-center justify-between gap-3`}>
      <div className={`flex flex-wrap items-end ${compact ? 'gap-2' : 'gap-4'}`}>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wide self-center">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Global Filter (Req 1)</span>
        </div>

        {/* Global SKU Filter */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Target SKU
          </label>
          <select
            value={filters.sku}
            onChange={e => setFilter('sku', e.target.value)}
            className={`${compact ? 'w-44' : ''} h-8 px-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded focus:outline-none focus:border-blue-500 font-medium`}
          >
            <option value="All">All SKUs (450 Products Portfolio)</option>
            {skus.map(s => (
              <option key={s.sku} value={s.sku}>
                {s.sku} — {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Category
          </label>
          <select
            value={filters.category}
            onChange={e => setFilter('category', e.target.value)}
            className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Personal Care">Personal Care</option>
            <option value="OTC">OTC Medicines</option>
            <option value="Dermocosmetics">Dermocosmetics</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Region
          </label>
          <select
            value={filters.region}
            onChange={e => setFilter('region', e.target.value)}
            className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Regions</option>
            <option value="Bogota">Bogotá D.C.</option>
            <option value="Medellin">Medellín</option>
            <option value="Cali">Cali</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Caracas">Caracas</option>
          </select>
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="h-8 px-3 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
};
