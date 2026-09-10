import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { useGlobalFilters } from '../../hooks/use-global-filters';
import { CheckCircle, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck } from 'lucide-react';

interface PriceQualityKpi {
  label: string;
  value: string;
  sub: string;
  tone: 'pass' | 'warn' | 'fail' | 'info' | 'neutral';
}

interface PriceQualityRow {
  product_code: string;
  store_id: string;
  price_type: string;
  unit_price: number;
  currency: string;
  valid_from: string;
  valid_to: string;
  reconstruction_method: string;
  quality_flag: string;
  clearance_excluded_flag: boolean;
  needs_review: boolean;
}

interface PriceQualityResponse {
  kpis: PriceQualityKpi[];
  rows: PriceQualityRow[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const toneClasses: Record<PriceQualityKpi['tone'], string> = {
  pass: 'text-emerald-600',
  warn: 'text-amber-600',
  fail: 'text-red-600',
  info: 'text-slate-900',
  neutral: 'text-slate-700'
};

const flagLabels: Record<string, string> = {
  high_confidence: 'High confidence',
  medium: 'Medium',
  low: 'Low',
  manual_review_required: 'Manual review'
};

const formatPrice = (value: number, currency: string) =>
  `${currency} ${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string) => value ? value.slice(0, 10) : '-';

export const PriceReviewTab: React.FC = () => {
  const { filters } = useGlobalFilters();
  const [data, setData] = useState<PriceQualityResponse | null>(null);
  const [search, setSearch] = useState('');
  const [qualityFlag, setQualityFlag] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadPriceReview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<PriceQualityResponse>('/prices/quality-review', {
        product_code: search || undefined,
        quality_flag: qualityFlag,
        page,
        page_size: 50,
        country: filters.country
      });
      setData(response);
    } catch (error) {
      console.warn('Price review fetch failed:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.country, page, qualityFlag, search]);

  useEffect(() => {
    loadPriceReview();
  }, [loadPriceReview]);

  const applySearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const applyQualityFlag = (value: string) => {
    setQualityFlag(value);
    setPage(1);
  };

  const overrideFlag = async (row: PriceQualityRow) => {
    const nextFlag = row.quality_flag === 'manual_review_required' ? 'medium' : 'manual_review_required';
    try {
      await apiClient.post('/prices/quality-review/override', {
        product_code: row.product_code,
        store_id: row.store_id,
        new_quality_flag: nextFlag,
        analyst_note: 'Updated from Price & Quality Review'
      });
      await loadPriceReview();
    } catch (error) {
      console.warn('Quality flag override failed:', error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {(data?.kpis || []).map(kpi => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
            <div className={`text-lg font-bold mt-1 ${toneClasses[kpi.tone]}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-tight">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Price Quality Records</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">silver_regular_price_reconstructed.csv · {data?.total_count?.toLocaleString() || 0} matching records</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={event => applySearch(event.target.value)}
              placeholder="Search product code..."
              className="h-8 w-44 pl-7 pr-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </label>
          <select
            value={qualityFlag}
            onChange={event => applyQualityFlag(event.target.value)}
            className="h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Quality Flags</option>
            <option value="high_confidence">High confidence</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="manual_review_required">Manual review</option>
          </select>
          <button type="button" onClick={loadPriceReview} disabled={loading} className="h-8 px-2.5 border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 whitespace-nowrap">Product Code</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Store</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Price Type</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Unit Price (COP)</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Valid From</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Valid To</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Reconstruction Method</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Quality Flag</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Clearance Excluded</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {(data?.rows || []).map(row => (
              <tr key={`${row.product_code}-${row.store_id}-${row.valid_from}`} className="hover:bg-slate-50/60">
                <td className="py-2 px-3 font-mono font-bold text-slate-900">{row.product_code}</td>
                <td className="py-2 px-3">{row.store_id}</td>
                <td className="py-2 px-3 capitalize">{row.price_type}</td>
                <td className="py-2 px-3 font-mono font-semibold">{formatPrice(row.unit_price, row.currency)}</td>
                <td className="py-2 px-3 whitespace-nowrap">{formatDate(row.valid_from)}</td>
                <td className="py-2 px-3 whitespace-nowrap">{formatDate(row.valid_to)}</td>
                <td className="py-2 px-3">{row.reconstruction_method}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.needs_review ? 'bg-red-50 text-red-700 border-red-200' : row.quality_flag === 'low' ? 'bg-orange-50 text-orange-700 border-orange-200' : row.quality_flag === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {flagLabels[row.quality_flag] || row.quality_flag}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.clearance_excluded_flag ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {row.clearance_excluded_flag ? 'Excluded' : 'OK'}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <button type="button" onClick={() => overrideFlag(row)} className="px-2 py-1 rounded border border-slate-200 bg-white text-[10px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                    Override Flag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-6 text-center text-xs text-slate-400">Loading price quality records...</div>}
        {!loading && !data?.rows.length && <div className="p-6 text-center text-xs text-slate-400">No price quality records match the current filters.</div>}
      </div>
      <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>{data?.total_count?.toLocaleString() || 0} records · Page {data?.page || 1} of {data?.total_pages || 1}</span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(current => current - 1)} className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button type="button" disabled={!data || page >= data.total_pages || loading} onClick={() => setPage(current => current + 1)} className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      </div>
    </div>
  );
};
