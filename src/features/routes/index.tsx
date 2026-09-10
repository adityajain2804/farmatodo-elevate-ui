import React, { useState } from 'react';
import { useKpiData } from '../hooks/api/use-kpi-api';
import { UnifiedFilterBar } from '../components/common/UnifiedFilterBar';
import { KpiRibbon } from '../components/studio/KpiRibbon';
import { CustomerTable } from '../components/studio/CustomerTable';
import { ExecutiveGovernance } from '../components/studio/ExecutiveGovernance';
import { PriceReviewTab } from '../components/studio/PriceReviewTab';
import { Sparkles, Tag } from 'lucide-react';

export const CampaignStudioRoute: React.FC = () => {
  const [subTab, setSubTab] = useState<'studio' | 'price_review'>('studio');
  const [regularDiscount, setRegularDiscount] = useState<number>(15);
  const [primeDiscount, setPrimeDiscount] = useState<number>(20);

  const {
    kpis,
    clusterDist,
    customers,
    filterOptions,
    refreshKpis,
    customerPage,
    customerHasNext,
    setCustomerPage
  } = useKpiData(regularDiscount, primeDiscount);

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tabs right below main navigation matching Image 1 */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => setSubTab('studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            subTab === 'studio'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campaign Studio</span>
        </button>

        <button
          onClick={() => setSubTab('price_review')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            subTab === 'price_review'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Price &amp; Quality Review</span>
        </button>
      </div>

      {subTab === 'price_review' ? (
        <PriceReviewTab />
      ) : (
        <>
          {/* Unified selection area keeps all user inputs above the result set. */}
          <UnifiedFilterBar
            skuList={filterOptions?.skus}
            filterOptions={filterOptions}
            regularDiscount={regularDiscount}
            setRegularDiscount={setRegularDiscount}
            primeDiscount={primeDiscount}
            setPrimeDiscount={setPrimeDiscount}
            onApplyScope={refreshKpis}
          />

          {/* 7 Top Ribbon KPI Cards */}
          <KpiRibbon kpis={kpis} />

          {/* Results workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <CustomerTable customers={customers} page={customerPage} hasNext={customerHasNext} onPrevious={() => setCustomerPage(page => Math.max(1, page - 1))} onNext={() => setCustomerPage(page => page + 1)} />
            </div>

            <div className="lg:col-span-4">
              <ExecutiveGovernance clusterDist={clusterDist} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
