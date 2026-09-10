import React, { useState } from 'react';
import { CustomerRow, OfferMechanic } from '../../types';
import { formatDiscountOffer } from '../../lib/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGlobalFilters } from '../../hooks/use-global-filters';

interface Props {
  customers: CustomerRow[];
  page: number;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const CustomerTable: React.FC<Props> = ({ customers = [], page, hasNext, onPrevious, onNext }) => {
  const { filters } = useGlobalFilters();
  const [clusterFilter, setClusterFilter] = useState('All');

  const rows: CustomerRow[] = customers.length > 0 ? customers : [
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-000721',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Champions (1)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00089 - Nivea Personal Care 089',
      productName: 'Nivea Personal Care 089',
      recDiscount: 15,
      recMechanic: 'pct_discount' as OfferMechanic,
      estIncUnits: 1.2,
      estDiscountCost: 1650,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-001024',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Reactivation (5)',
      primeStatus: 'Prime',
      productCode: 'SKU-00012 - Rexona Personal Care 012',
      productName: 'Rexona Personal Care 012',
      recDiscount: 20,
      recMechanic: 'coupon' as OfferMechanic, // Req 3: Coupon cash off
      estIncUnits: 5.3,
      estDiscountCost: 11191,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-001577',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Champions (1)',
      primeStatus: 'Prime',
      productCode: 'SKU-00363 - Garnier Beauty 363',
      productName: 'Garnier Beauty 363',
      recDiscount: 20,
      recMechanic: 'coupon' as OfferMechanic,
      estIncUnits: 2.5,
      estDiscountCost: 10257,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-001930',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Champions (1)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00362 - Generic Beauty Beauty 362',
      productName: 'Generic Beauty Beauty 362',
      recDiscount: 20,
      recMechanic: 'pct_discount' as OfferMechanic,
      estIncUnits: 2.5,
      estDiscountCost: 10257,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-005125',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Champions (1)',
      primeStatus: 'Prime',
      productCode: 'SKU-00209 - GenericVE OTC 209',
      productName: 'GenericVE OTC 209',
      recDiscount: 15,
      recMechanic: 'pct_discount' as OfferMechanic,
      estIncUnits: 1.7,
      estDiscountCost: 13027,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-006698',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Low-Eng (7)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00012 - Rexona Personal Care 012',
      productName: 'Rexona Personal Care 012',
      recDiscount: 10,
      recMechanic: 'multibuy' as OfferMechanic, // Req 3: Multibuy Buy 2 Get 1
      estIncUnits: 3.6,
      estDiscountCost: 27401,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-008681',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Low-Eng (7)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00206 - MK OTC 206',
      productName: 'MK OTC 206',
      recDiscount: 15,
      recMechanic: 'multibuy' as OfferMechanic,
      estIncUnits: 2.8,
      estDiscountCost: 7141,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-001246',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Low-Eng (7)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00225 - Pfizer OTC 225',
      productName: 'Pfizer OTC 225',
      recDiscount: 15,
      recMechanic: 'multibuy' as OfferMechanic,
      estIncUnits: 2.5,
      estDiscountCost: 10500,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-006211',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Low-Eng (7)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00261 - GenericCO OTC 261',
      productName: 'GenericCO OTC 261',
      recDiscount: 15,
      recMechanic: 'multibuy' as OfferMechanic,
      estIncUnits: 2.5,
      estDiscountCost: 8654,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-000363',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Low-Eng (7)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00343 - Maybelline Beauty 343',
      productName: 'Maybelline Beauty 343',
      recDiscount: 15,
      recMechanic: 'multibuy' as OfferMechanic,
      estIncUnits: 2.5,
      estDiscountCost: 17501,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-000193',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Low-Eng (7)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00324 - Vichy Dermocosmetics 324',
      productName: 'Vichy Dermocosmetics 324',
      recDiscount: 15,
      recMechanic: 'multibuy' as OfferMechanic,
      estIncUnits: 2.5,
      estDiscountCost: 62065,
      constraintFlags: '-',
      decision: 'YES',
      action: 'Override'
    },
    {
      campaignName: 'Awareness - AWARE-2025-VIT',
      customerId: 'C-003103',
      audienceSegment: 'personalized segment',
      behavioralCluster: 'Replenishment (6)',
      primeStatus: 'Non-Prime',
      productCode: 'SKU-00194 - Pfizer OTC 194',
      productName: 'Pfizer OTC 194',
      recDiscount: 0,
      recMechanic: 'multibuy' as OfferMechanic,
      estIncUnits: 0.0,
      estDiscountCost: 0,
      constraintFlags: '-',
      decision: 'NO OFFER',
      action: 'Override'
    }
  ];

  const filtered = rows.filter(r => {
    if (filters.sku !== 'All' && !r.productCode.includes(filters.sku)) return false;
    if (filters.primeTier === 'Prime Only' && r.primeStatus !== 'Prime') return false;
    if (filters.primeTier === 'Non-Prime' && r.primeStatus !== 'Non-Prime') return false;
    if (clusterFilter !== 'All' && !r.behavioralCluster.includes(clusterFilter)) return false;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col">
      <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Phase 1 Customer Output
          </h3>
          <span className="text-[10px] text-slate-400">
            Showing {filtered.length} customers · page {page}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">Cluster:</span>
          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value)}
            className="h-7 px-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded focus:outline-none"
          >
            <option value="All">All Clusters (In Scope)</option>
            <option value="Champions">Champions (1)</option>
            <option value="Loyalists">Loyalists (2)</option>
            <option value="Promising">Promising (3)</option>
            <option value="At Risk">At Risk (4)</option>
            <option value="Reactivation">Reactivation (5)</option>
            <option value="Replenishment">Replenishment (6)</option>
            <option value="Low-Eng">Low-Eng (7)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[620px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 whitespace-nowrap">Campaign</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Customer</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Product / Category</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Purchase Context</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Audience</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Prime</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Recommended Offer</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-right">Inc. Units</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Constraints</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
            {filtered.map(row => (
              <tr key={row.customerId} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2 px-3 whitespace-nowrap"><div className="text-[11px] font-semibold text-slate-800">{row.campaignName.split(' - ')[0]}</div><div className="text-[9px] text-slate-400">{row.campaignName.split(' - ')[1] || 'Active campaign'}</div></td>
                <td className="py-2 px-3 whitespace-nowrap"><div className="font-mono text-[11px] font-semibold text-slate-800">{row.customerId}</div></td>
                <td className="py-2 px-3 whitespace-nowrap"><div className="text-[11px] font-semibold text-slate-800">{row.productName}</div><div className="text-[9px] text-slate-500">{row.productCode} · {row.category || 'Unknown'}</div></td>
                <td className="py-2 px-3 whitespace-nowrap"><div className="text-[11px] text-slate-700">{row.purchaseRegion || 'Unknown'}</div><div className="text-[9px] text-slate-400">{row.purchaseChannel || 'Unknown'} channel</div></td>
                <td className="py-2 px-3 whitespace-nowrap"><div className="text-[11px] text-slate-700">{row.audienceSegment}</div><div className="text-[9px] text-slate-400">{row.behavioralCluster}</div></td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                      row.primeStatus === 'Prime'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {row.primeStatus === 'Prime' ? '⭐ Prime' : 'Non-Prime'}
                  </span>
                </td>
                {/* Requirement 3: Conditional Offer Formatting */}
                <td className="py-2 px-3 whitespace-nowrap"><div className="font-bold text-[11px] text-slate-900">{formatDiscountOffer(row.recMechanic, row.recDiscount, filters.country)}</div><div className="text-[9px] text-slate-400">{row.recMechanic.replace('_', ' ')}</div></td>
                <td className="py-2 px-3 font-mono text-right text-[11px] text-slate-700 whitespace-nowrap">+{row.estIncUnits}</td>

                <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                  {row.constraintFlags}
                </td>

                <td className="py-2 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {row.decision === 'YES' ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        YES
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold">
                        NO OFFER
                      </span>
                    )}
                    <button
                      type="button"
                      className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-medium"
                    >
                      Override
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
        <span>Page {page} · {filtered.length} visible customers</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onPrevious} disabled={page <= 1} className="h-7 px-2 rounded border border-slate-200 bg-white disabled:opacity-40 flex items-center gap-1"><ChevronLeft className="w-3 h-3" />Previous</button>
          <button type="button" onClick={onNext} disabled={!hasNext} className="h-7 px-2 rounded border border-slate-200 bg-white disabled:opacity-40 flex items-center gap-1">Next<ChevronRight className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
};
