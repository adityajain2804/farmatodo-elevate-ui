import React from 'react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { OfferMechanic, PrimeTier } from '../../types';
import { Play } from 'lucide-react';

interface Props {
  regularDiscount: number;
  setRegularDiscount: (val: number) => void;
  primeDiscount: number;
  setPrimeDiscount: (val: number) => void;
  onRunSimulation: () => void;
  embedded?: boolean;
  compact?: boolean;
}

export const CohortSelector: React.FC<Props> = ({
  regularDiscount,
  setRegularDiscount,
  primeDiscount,
  setPrimeDiscount,
  onRunSimulation,
  embedded = false,
  compact = false
}) => {
  const { filters, setFilter } = useGlobalFilters();

  const clusters = [
    'Cluster 1',
    'Cluster 2',
    'Cluster 3',
    'Cluster 4',
    'Cluster 5',
    'Cluster 6',
    'Cluster 7'
  ];

  return (
    <div className={`${embedded ? 'p-0' : 'bg-white border border-slate-200 rounded-lg p-4 shadow-xs'} flex flex-col ${compact ? 'gap-2' : 'gap-3.5'}`}>
      <div>
        <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
          Cohort &amp; Offer Selection
        </h2>
        <p className="text-[11px] text-slate-400 font-medium">Vertical 1 - Inputs</p>
      </div>

      {/* Campaign Type */}
      <div className="flex flex-col gap-1 min-w-0">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Campaign Type
        </label>
        <select
          value={filters.campaign.split('-')[0] || 'Awareness'}
          onChange={e => setFilter('campaign', `${e.target.value}-2025-VIT`)}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded focus:outline-none focus:border-blue-500"
        >
          <option value="Awareness">Awareness</option>
          <option value="Reactivation">Reactivation</option>
          <option value="Retention">Retention</option>
          <option value="Cross-Sell">Cross-Sell</option>
          <option value="Flash Sale">Flash Sale</option>
        </select>
      </div>

      {/* Channel */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Channel
        </label>
        <select className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded focus:outline-none focus:border-blue-500">
          <option value="Digital CRM">Digital CRM</option>
          <option value="In-Store POS">In-Store POS</option>
          <option value="App Push">App Push</option>
          <option value="WhatsApp Commerce">WhatsApp Commerce</option>
        </select>
      </div>

      {/* Requirement 2: Mechanic Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Offer Mechanic (Req 2)
        </label>
        <select
          value={filters.mechanic}
          onChange={e => setFilter('mechanic', e.target.value as OfferMechanic)}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded focus:outline-none focus:border-blue-500"
        >
          <option value="pct_discount">Percentage Discount (% Off)</option>
          <option value="coupon">Coupon Voucher (Cash Off)</option>
          <option value="multibuy">Multi-Buy (2x1, 3x2)</option>
          <option value="bundle">Cross-Category Bundle</option>
          <option value="special_price">Special Price (Fixed Unit Price)</option>
          <option value="prime_differential">Prime Differential Add-On</option>
        </select>
      </div>

      {/* Audience Cohort Builder */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Audience Cohort Builder
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Audience Type</label>
          <select className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded">
            <option value="Personalized Segment">Personalized Segment</option>
            <option value="Mass General">Mass / General</option>
            <option value="Reactivation">Reactivation</option>
          </select>
          <span className="text-[10px] text-slate-400">Targeted by affinity rank &amp; Prime tier</span>
        </div>

        {/* Behavioral Segment Badges */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Behavioral Segment</div>
          <div className="flex flex-wrap gap-1.5">
            {clusters.map(c => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200/60"
              >
                {c}
                <button type="button" className="text-blue-500 hover:text-blue-800 font-bold ml-0.5">×</button>
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <select className="h-7 px-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-700">
              <option>Select clusters (0/7)</option>
            </select>
            <button type="button" className="text-[10px] font-semibold text-slate-500 hover:text-slate-800">
              Deselect All
            </button>
          </div>
        </div>

        {/* Prime Tier Segmented Buttons */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Prime Tier</div>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded border border-slate-200">
            {(['All', 'Prime Only', 'Non-Prime'] as PrimeTier[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter('primeTier', t)}
                className={`py-1 text-xs font-medium rounded transition-colors ${
                  filters.primeTier === t
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Proposed offer controls */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {filters.mechanic === 'coupon' ? 'Voucher Amount' : filters.mechanic === 'multibuy' || filters.mechanic === 'bundle' ? 'Offer Tier' : filters.mechanic === 'special_price' ? 'Target Unit Price' : 'Proposed Discount'}
        </div>

        {filters.mechanic === 'multibuy' || filters.mechanic === 'bundle' ? (
          <select className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded focus:outline-none focus:border-blue-500">
            <option>2x1 Multi-Buy</option>
            <option>3x2 Multi-Buy</option>
            <option>Bundle -$10k COP</option>
          </select>
        ) : (
          <>
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>{filters.mechanic === 'coupon' ? 'Regular Voucher' : filters.mechanic === 'special_price' ? 'Regular Unit Price' : 'Regular Discount'}</span>
            <span className="font-bold text-slate-900">{filters.mechanic === 'coupon' ? `$${(regularDiscount * 1000).toLocaleString()} COP` : filters.mechanic === 'special_price' ? `$${(regularDiscount * 1000).toLocaleString()} COP` : `${regularDiscount}%`}</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={regularDiscount}
            onChange={e => setRegularDiscount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded accent-blue-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>{filters.mechanic === 'coupon' ? 'Prime Voucher' : filters.mechanic === 'special_price' ? 'Prime Unit Price' : 'Prime Discount'}</span>
            <span className="font-bold text-blue-600">{filters.mechanic === 'coupon' ? `$${(primeDiscount * 1000).toLocaleString()} COP` : filters.mechanic === 'special_price' ? `$${(primeDiscount * 1000).toLocaleString()} COP` : `${primeDiscount}%`}</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={primeDiscount}
            onChange={e => setPrimeDiscount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded accent-blue-600 cursor-pointer"
          />
        </div>
          </>
        )}

        <p className="text-[10px] text-slate-400 italic">
          {filters.mechanic === 'pct_discount' || filters.mechanic === 'prime_differential' ? 'Rule enforced: Prime >= Regular. Regulatory cap for Colombia: 30%.' : 'Offer formatting is applied without percentage notation for this mechanic.'}
        </p>
      </div>

      {/* Solid Run Promo Engine button matching Image 1 */}
      <button
        onClick={onRunSimulation}
        className="w-full h-9 mt-1 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run Promo Engine</span>
      </button>
    </div>
  );
};
