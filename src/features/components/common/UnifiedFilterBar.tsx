import React, { useEffect, useState } from 'react';
import { Filter, RotateCcw, Play, Download, Loader2 } from 'lucide-react';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { useFilterMeta } from '../../hooks/api/use-kpi-api';
import { OfferMechanic, PrimeTier } from '../../types';

interface Props {
  skuList?: any[];
  filterOptions?: any;   // legacy prop – kept for compat
  regularDiscount: number;
  setRegularDiscount: (value: number) => void;
  primeDiscount: number;
  setPrimeDiscount: (value: number) => void;
  onApplyScope: () => void;
}

const fieldClass =
  'h-7 w-full min-w-0 px-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium text-slate-700 focus:outline-none focus:border-blue-500';
const labelClass =
  'text-[9px] font-bold uppercase tracking-wider text-slate-400';

export const UnifiedFilterBar: React.FC<Props> = ({
  skuList = [],
  filterOptions: legacyFilterOptions,
  regularDiscount,
  setRegularDiscount,
  primeDiscount,
  setPrimeDiscount,
  onApplyScope,
}) => {
  const { filters, setFilter, resetFilters } = useGlobalFilters();
  const [selectedClusters, setSelectedClusters] = useState<string[]>(filters.selectedClusters);
  const [skuSearch, setSkuSearch] = useState('');

  // Fetch dynamic meta from Phase 2 backend
  const { meta, loading: metaLoading } = useFilterMeta();

  // Merge: prefer live backend data, fallback to legacy prop, then hardcoded defaults
  const campaignRecords = meta?.campaigns        ?? legacyFilterOptions?.campaigns        ?? [];
  const campaignTypes   = meta?.campaign_types   ?? legacyFilterOptions?.campaign_types   ?? ['awareness', 'reactivation', 'retention'];
  const categories      = meta?.category_groups  ?? legacyFilterOptions?.categories       ?? ['Personal Care', 'OTC', 'Beauty', 'Baby', 'Dermocosmetics', 'Convenience', 'RX'];
  const channels        = meta?.channels         ?? legacyFilterOptions?.channels         ?? ['store', 'web', 'app', 'delivery'];
  const regions         = meta?.regions          ?? legacyFilterOptions?.regions          ?? ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];
  const audiences       = meta?.audiences        ?? legacyFilterOptions?.audiences        ?? [{ id: 'personalized_segment', label: 'Personalized Segment' }];
  const mechanics       = meta?.mechanics        ?? legacyFilterOptions?.mechanics        ?? [{ id: 'pct_discount', label: '% Discount' }];
  const clusterDefs     = meta?.clusters         ?? legacyFilterOptions?.cluster_definitions ?? [
    { id: 1, short: 'Champions (1)',    name: 'Champions' },
    { id: 2, short: 'Loyalists (2)',    name: 'Loyalists' },
    { id: 3, short: 'Promising (3)',    name: 'Promising' },
    { id: 4, short: 'At Risk (4)',      name: 'At Risk' },
    { id: 5, short: 'Reactivation (5)', name: 'Reactivation' },
    { id: 6, short: 'Replenishment (6)', name: 'Replenishment' },
    { id: 7, short: 'Low-Eng (7)',      name: 'Low-Engagement' },
  ];
  const allSkus = skuList.length > 0 ? skuList : (meta?.skus ?? [{ sku: 'SKU-00001', name: 'All SKUs', category_group: '' }]);

  // ── CASCADING: filter SKUs by selected category ──
  const skus = allSkus.filter((s: any) => {
    const catMatch = filters.category === 'All' || !s.category_group || s.category_group === filters.category;
    const searchMatch = !skuSearch || s.sku?.toLowerCase().includes(skuSearch.toLowerCase()) || s.name?.toLowerCase().includes(skuSearch.toLowerCase());
    return catMatch && searchMatch;
  });

  // ── CASCADING: when campaign selected, pre-select its category ──
  useEffect(() => {
    if (!filters.campaign || filters.campaign === 'ALL') return;
    const camp = campaignRecords.find((c: any) => c.campaign_id === filters.campaign);
    if (camp?.category_scope && camp.category_scope !== filters.category) {
      setFilter('category', camp.category_scope);
    }
    if (camp?.country && camp.country !== filters.country) {
      setFilter('country', camp.country as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.campaign]);

  // Keep local cluster selection in sync with global filter state
  useEffect(() => {
    setSelectedClusters(filters.selectedClusters);
  }, [filters.selectedClusters]);

  // All cluster IDs (as strings for legacy compat)
  const allClusterIds = clusterDefs.map((c: any) => String(c.id ?? c.short));
  const allClustersSelected =
    selectedClusters.length === allClusterIds.length &&
    allClusterIds.every((id: string) => selectedClusters.includes(id));

  const toggleCluster = (id: string) => {
    const next = selectedClusters.includes(id)
      ? selectedClusters.filter((x) => x !== id)
      : [...selectedClusters, id];
    setSelectedClusters(next);
    setFilter('selectedClusters', next);
  };

  const handleClusterSelect = (value: string) => {
    const next = value === 'ALL' ? allClusterIds : [value];
    setSelectedClusters(next);
    setFilter('selectedClusters', next);
  };

  const activeCount = [
    filters.sku !== 'All',
    filters.category !== 'All',
    filters.region !== 'All',
    filters.primeTier !== 'All',
    filters.mechanic !== 'All',
    filters.lifecycle !== 'all',
    filters.audienceType !== 'personalized_segment',
    filters.channel !== 'All',
  ].filter(Boolean).length;

  const campaignType = filters.campaignType || campaignTypes[0] || 'awareness';

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-xs p-3">
      {/* ---- Header row ---- */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <div>
            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
              Global Scope &amp; Cohort
            </h2>
            <p className="text-[9px] text-slate-400">
              Phase 2 pipeline · SKU filter + cohort builder unified
              {metaLoading && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-blue-400">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> syncing…
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-1 rounded bg-blue-50 border border-blue-100 text-[9px] font-semibold text-blue-700">
            {activeCount} filter{activeCount !== 1 ? 's' : ''} active
          </span>
          <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[9px] text-slate-600">
            Cohort {selectedClusters.length}/{allClusterIds.length}
          </span>
          <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[9px] text-slate-600">
            SKU {filters.sku === 'All' ? 'All' : '1'}
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="h-7 px-2 rounded border border-slate-200 bg-white text-[9px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onApplyScope}
            className="h-7 px-2.5 rounded bg-blue-600 text-white text-[9px] font-semibold hover:bg-blue-700"
          >
            Apply Scope
          </button>
        </div>
      </header>

      {/* ---- Filter grid ---- */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {/* Campaign */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Campaign</span>
          <select
            value={filters.campaign}
            onChange={(e) => setFilter('campaign', e.target.value)}
            className={fieldClass}
          >
            <option value="ALL">All Campaigns</option>
            {campaignRecords.map((c: any) => (
              <option key={c.campaign_id} value={c.campaign_id}>
                {c.campaign_id}{c.campaign_name ? ` · ${c.campaign_name}` : ''}
              </option>
            ))}
          </select>
        </label>

        {/* SKU – with quick search + cascade from category */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>
            Target SKU / Portfolio
            {filters.category !== 'All' && (
              <span className="ml-1 text-[8px] text-blue-500 font-normal">({skus.length} in {filters.category})</span>
            )}
          </span>
          <div className="flex flex-col gap-0.5">
            <input
              type="text"
              value={skuSearch}
              onChange={e => setSkuSearch(e.target.value)}
              placeholder="Search SKU…"
              className="h-6 w-full px-2 bg-slate-50 border border-slate-200 rounded text-[9px] text-slate-600 focus:outline-none focus:border-blue-400"
            />
            <select
              value={filters.sku}
              onChange={(e) => setFilter('sku', e.target.value)}
              className={fieldClass}
              size={1}
            >
              <option value="All">All SKUs</option>
              {skus.slice(0, 100).map((s: any) => (
                <option key={s.sku} value={s.sku}>{s.sku}{s.name && s.name !== s.sku ? ` · ${String(s.name).slice(0, 22)}` : ''}</option>
              ))}
              {skus.length > 100 && <option disabled>…{skus.length - 100} more</option>}
            </select>
          </div>
        </label>

        {/* Category */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Category Group</span>
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className={fieldClass}
          >
            <option value="All">All Categories</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        {/* Campaign Type */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Campaign Type</span>
          <select
            value={campaignType}
            onChange={(e) => setFilter('campaignType', e.target.value)}
            className={fieldClass}
          >
            {campaignTypes.map((t: string) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>

        {/* Mechanic */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Mechanic</span>
          <select
            value={filters.mechanic}
            onChange={(e) => setFilter('mechanic', e.target.value as OfferMechanic | 'All')}
            className={fieldClass}
          >
            <option value="All">All Mechanics</option>
            {mechanics.map((m: any) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>

        {/* Audience */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Audience Type</span>
          <select
            value={filters.audienceType}
            onChange={(e) => setFilter('audienceType', e.target.value)}
            className={fieldClass}
          >
            {audiences.map((a: any) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>

        {/* Prime Tier toggle */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Prime Tier</span>
          <div className="grid grid-cols-3 bg-slate-100 border border-slate-200 rounded p-0.5 h-7">
            {(['All', 'Prime Only', 'Non-Prime'] as PrimeTier[]).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setFilter('primeTier', tier)}
                className={`rounded text-[9px] transition-colors ${
                  filters.primeTier === tier
                    ? 'bg-white text-blue-700 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tier === 'Prime Only' ? 'Prime' : tier === 'Non-Prime' ? 'Non' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Behavioral Cluster */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Behavioral Cluster</span>
          <select
            value={allClustersSelected ? 'ALL' : (selectedClusters[0] || '')}
            onChange={(e) => handleClusterSelect(e.target.value)}
            className={fieldClass}
          >
            <option value="ALL">All clusters</option>
            {clusterDefs.map((c: any) => (
              <option key={c.id ?? c.short} value={String(c.id ?? c.short)}>
                {c.short ?? c.name ?? `Cluster ${c.id}`}
              </option>
            ))}
          </select>
        </label>

        {/* Region */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Region</span>
          <select
            value={filters.region}
            onChange={(e) => setFilter('region', e.target.value)}
            className={fieldClass}
          >
            <option value="All">All Regions</option>
            {regions.map((r: string) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        {/* Channel */}
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Channel</span>
          <select
            value={filters.channel}
            onChange={(e) => setFilter('channel', e.target.value)}
            className={fieldClass}
          >
            <option value="All">All Channels</option>
            {channels.map((ch: string) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </label>
      </div>

      {/* ---- Selected cluster pills ---- */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 mt-2 pt-2">
        <span className={labelClass}>Selected Clusters</span>
        {allClustersSelected ? (
          <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[9px] text-blue-700">
            All clusters
          </span>
        ) : (
          selectedClusters.map((id) => {
            const def = clusterDefs.find((c: any) => String(c.id ?? c.short) === id);
            const label = def ? (def.short ?? def.name ?? id) : id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleCluster(id)}
                className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[9px] text-blue-700 hover:bg-blue-100"
              >
                {label} ×
              </button>
            );
          })
        )}
        <button
          type="button"
          onClick={() => { setSelectedClusters([]); setFilter('selectedClusters', []); }}
          className="ml-auto text-[9px] font-semibold text-slate-500 hover:text-slate-800"
        >
          Deselect All
        </button>
      </div>

      {/* ---- Discount sliders ---- */}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 mt-2 pt-2">
        <span className={labelClass}>Offer &amp; Discount Design</span>
        <div className="flex-1 min-w-52">
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Regular {filters.mechanic === 'coupon' ? 'Voucher' : 'Discount'}</span>
            <b className="text-slate-800">
              {filters.mechanic === 'coupon' ? `$${(regularDiscount * 1000).toLocaleString()} COP` : `${regularDiscount}%`}
            </b>
          </div>
          <input
            type="range" min="5" max="30" value={regularDiscount}
            onChange={(e) => setRegularDiscount(Number(e.target.value))}
            className="w-full h-1 accent-blue-600"
          />
        </div>
        <div className="flex-1 min-w-52">
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Prime {filters.mechanic === 'coupon' ? 'Voucher' : 'Discount'}</span>
            <b className="text-blue-700">
              {filters.mechanic === 'coupon' ? `$${(primeDiscount * 1000).toLocaleString()} COP` : `${primeDiscount}%`}
            </b>
          </div>
          <input
            type="range" min="5" max="35" value={primeDiscount}
            onChange={(e) => setPrimeDiscount(Number(e.target.value))}
            className="w-full h-1 accent-blue-600"
          />
        </div>
        <span className="text-[9px] text-slate-400">Targeting rule: exclude CATE ≤ 0</span>
        <button
          type="button"
          className="h-7 px-2 border border-slate-200 rounded text-[9px] font-semibold text-slate-600 flex items-center gap-1 hover:bg-slate-50"
        >
          <Download className="w-3 h-3" />Export CSV
        </button>
        <button
          type="button"
          onClick={onApplyScope}
          className="h-7 px-3 bg-slate-900 text-white rounded text-[9px] font-semibold flex items-center gap-1 hover:bg-slate-800"
        >
          <Play className="w-3 h-3" />Run Promo Engine
        </button>
      </div>
    </section>
  );
};
