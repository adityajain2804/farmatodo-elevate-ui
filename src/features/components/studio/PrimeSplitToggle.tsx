import React from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { PrimeTier } from '../../types';
import { Crown, Users } from 'lucide-react';

interface Props {
  className?: string;
}

export const PrimeSplitToggle: React.FC<Props> = ({ className = '' }) => {
  const { filters, setFilter } = useGlobalFilters();

  return (
    <div className={`flex items-center gap-1 bg-[#182234] border border-[#25334d] p-1 rounded-lg ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
        <Crown className="w-3 h-3 text-amber-400" />
        <span>Prime Split (Req 10):</span>
      </span>

      {(['All', 'Prime Only', 'Non-Prime'] as PrimeTier[]).map(tier => (
        <button
          key={tier}
          type="button"
          onClick={() => setFilter('primeTier', tier)}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            filters.primeTier === tier
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-[#202d44]'
          }`}
        >
          {tier}
        </button>
      ))}
    </div>
  );
};
