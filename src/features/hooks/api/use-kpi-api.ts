// src/hooks/api/use-kpi-api.ts
// -----------------------------------------------------------------------
// Typed React hooks connecting to FastAPI Phase 2 endpoints.
// All hooks degrade gracefully (static fallbacks) when the backend is offline.
// -----------------------------------------------------------------------

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, fetchApi } from '../../lib/api-client';
import { useGlobalFilters } from '../use-global-filters';
import {
  KpiRibbonData,
  CustomerRow,
  CampaignCostStructure,
  CateDecompositionData,
  CannibalizationMetrics,
  FreshCustomerUpliftData,
  FilterMeta,
  CampaignSummaryKPI,
  CustomerAllocationRecord,
  CurvePointsPayload,
  CategoryBaselineRecord,
  IncrementalityAuditRecord,
  CannibalizationRecord,
  OfferMechanic,
  PaginatedResponse,
} from '../../types';

// ---------------------------------------------------------------------------
// Static fallbacks (shown while backend is unavailable)
// ---------------------------------------------------------------------------
const DEFAULT_KPI: KpiRibbonData = {
  incrementalRevenue:     124_680_000,
  incrementalUnits:       3_900,
  promoRoi:               145,
  customerTargetedCount:  6_731,
  audienceReached:        6_191,
  redemptionRate:         25.2,
  discountEfficiencyRatio: 4.97,
  discountCost:           31_200_000,
};

const DEFAULT_COST: CampaignCostStructure = {
  discountCostRedeemedOnly: 31_200_000,
  fixedOverhead:            15_000_000,
  adSpend:                  35_000_000,
  reachDeliveryFee:         8_500_000,
  marketingAgencyCost:      12_000_000,
  totalCost:                70_500_000,
};

const DEFAULT_CATE: CateDecompositionData = {
  exposureCate:           0.07,
  doseCate:               0.83,
  netCate:                0.90,
  confidenceIntervalLow:  0.78,
  confidenceIntervalHigh: 1.02,
};

const DEFAULT_CANNIB: CannibalizationMetrics = {
  crossProductLossUnits:  420,
  crossProductLossMargin: 18_500_000,
  pullForwardLossUnits:   280,
  pullForwardLossMargin:  12_200_000,
  netIncrementalGain:     93_980_000,
};

const DEFAULT_FRESH: FreshCustomerUpliftData = {
  freshCustomerLift:       32.4,
  freshCustomerVolume:     1_450,
  replenishmentLift:       11.8,
  replenishmentVolume:     2_450,
  counterfactualBaseline:  1_820,
};

const DEFAULT_CLUSTERS = [
  { id: 'A', name: 'Champions (1)',    percentage: 32.9, color: '#10b981', count: 2215 },
  { id: 'B', name: 'Loyalists (2)',    percentage: 11.0, color: '#06b6d4', count: 740  },
  { id: 'C', name: 'Promising (3)',    percentage: 17.0, color: '#6366f1', count: 1144 },
  { id: 'D', name: 'At Risk (4)',      percentage: 2.2,  color: '#f59e0b', count: 148  },
  { id: 'E', name: 'Reactivation (5)',  percentage: 6.2,  color: '#ef4444', count: 417  },
  { id: 'F', name: 'Replenishment (6)', percentage: 18.5, color: '#8b5cf6', count: 1245 },
  { id: 'G', name: 'Low-Eng (7)',       percentage: 25.1, color: '#94a3b8', count: 1690 },
];

// ---------------------------------------------------------------------------
// 1. Filter metadata hook
// ---------------------------------------------------------------------------
export function useFilterMeta() {
  const [meta, setMeta] = useState<FilterMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<FilterMeta>('/filters/meta')
      .then(setMeta)
      .catch((err) => console.warn('useFilterMeta: backend unreachable, using defaults.', err))
      .finally(() => setLoading(false));
  }, []);

  return { meta, loading };
}

// ---------------------------------------------------------------------------
// 2. Campaign summary KPI hook
// ---------------------------------------------------------------------------
export function useCampaignSummary(campaignId: string) {
  const [data, setData]       = useState<CampaignSummaryKPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    fetchApi<CampaignSummaryKPI>(`/campaigns/${encodeURIComponent(campaignId)}/summary`)
      .then((res) => { setData(res); setError(null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  return { data, loading, error };
}

// ---------------------------------------------------------------------------
// 3. Customer allocations hook  (paginated)
// ---------------------------------------------------------------------------
export function useCustomerAllocations(
  campaignId: string,
  clusterId?: number,
  page:      number = 1,
  pageSize:  number = 35,
) {
  const [result, setResult]   = useState<PaginatedResponse<CustomerAllocationRecord>>({ total_records: 0, items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    const params: Record<string, any> = {
      limit:  pageSize,
      offset: (page - 1) * pageSize,
    };
    if (clusterId !== undefined) params['cluster_id'] = clusterId;

    apiClient
      .get<PaginatedResponse<CustomerAllocationRecord>>(
        `/campaigns/${encodeURIComponent(campaignId)}/customers`, params
      )
      .then(setResult)
      .catch((err) => console.warn('useCustomerAllocations error:', err))
      .finally(() => setLoading(false));
  }, [campaignId, clusterId, page, pageSize]);

  return { ...result, loading };
}

// ---------------------------------------------------------------------------
// 4. Response curve hook  (smooth 50-point Hill evaluation)
// ---------------------------------------------------------------------------
export function useResponseCurveData(categoryGroup: string, clusterId: number) {
  const [data, setData]       = useState<CurvePointsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!categoryGroup || !clusterId) return;
    setLoading(true);
    apiClient
      .get<CurvePointsPayload>('/causal/curve-points', {
        category_group: categoryGroup,
        cluster_id:     clusterId,
      })
      .then((res) => { setData(res); setError(null); })
      .catch((err) => { setError(err.message); })
      .finally(() => setLoading(false));
  }, [categoryGroup, clusterId]);

  return { data, loading, error };
}

// ---------------------------------------------------------------------------
// 5. Category baseline hook
// ---------------------------------------------------------------------------
export function useCategoryBaseline(categoryGroup?: string, windowType?: string) {
  const [records, setRecords] = useState<CategoryBaselineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, any> = {};
    if (categoryGroup) params['category_group'] = categoryGroup;
    if (windowType)    params['window_type']    = windowType;

    apiClient
      .get<CategoryBaselineRecord[]>('/analytics/category-baseline', params)
      .then(setRecords)
      .catch((err) => console.warn('useCategoryBaseline error:', err))
      .finally(() => setLoading(false));
  }, [categoryGroup, windowType]);

  return { records, loading };
}

// ---------------------------------------------------------------------------
// 6. Incrementality audit hook
// ---------------------------------------------------------------------------
export function useIncrementalityAudit(campaignId?: string) {
  const [records, setRecords] = useState<IncrementalityAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, any> = {};
    if (campaignId) params['campaign_id'] = campaignId;

    apiClient
      .get<IncrementalityAuditRecord[]>('/audit/incrementality', params)
      .then(setRecords)
      .catch((err) => console.warn('useIncrementalityAudit error:', err))
      .finally(() => setLoading(false));
  }, [campaignId]);

  return { records, loading };
}

// ---------------------------------------------------------------------------
// 7. Cannibalization hook
// ---------------------------------------------------------------------------
export function useCannibalization(categoryGroup?: string) {
  const [records, setRecords] = useState<CannibalizationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params: Record<string, any> = {};
    if (categoryGroup) params['category_group'] = categoryGroup;

    apiClient
      .get<CannibalizationRecord[]>('/analytics/cannibalization', params)
      .then(setRecords)
      .catch((err) => console.warn('useCannibalization error:', err));
  }, [categoryGroup]);

  return { records, loading };
}

// ---------------------------------------------------------------------------
// 8.  Legacy composite hook (keeps backward compat with existing components)
// ---------------------------------------------------------------------------
export function useKpiData(regularDiscount: number = 15, primeDiscount: number = 20) {
  const { filters } = useGlobalFilters();
  const [loading, setLoading]               = useState(false);
  const [filterOptions, setFilterOptions]   = useState<any>(null);
  const [kpis, setKpis]                     = useState<KpiRibbonData>(DEFAULT_KPI);
  const [clusterDist, setClusterDist]       = useState<any[]>(DEFAULT_CLUSTERS);
  const [customers, setCustomers]           = useState<CustomerRow[]>([]);
  const [customerPage, setCustomerPage]     = useState(1);
  const [costStructure, setCostStructure]   = useState<CampaignCostStructure>(DEFAULT_COST);
  const [cateData]                          = useState<CateDecompositionData>(DEFAULT_CATE);
  const [cannibalization]                   = useState<CannibalizationMetrics>(DEFAULT_CANNIB);
  const [freshCustomerData]                 = useState<FreshCustomerUpliftData>(DEFAULT_FRESH);

  // Load filter options from backend
  useEffect(() => {
    apiClient
      .get('/filters/options', { country: filters.country })
      .then(setFilterOptions)
      .catch(() => console.warn('Filter options: using defaults.'));
  }, [filters.country]);

  // Refresh KPIs from Phase 2 allocation table
  const fetchStudioKpis = useCallback(async () => {
    setLoading(true);
    try {
      // Pull campaign summary from Phase 2 endpoint
      const campId = filters.campaign || 'ALL';
      const summary = await apiClient.get<CampaignSummaryKPI>(
        `/campaigns/${encodeURIComponent(campId)}/summary`
      );

      // Map CampaignSummaryKPI → KpiRibbonData
      setKpis({
        incrementalRevenue:      summary.net_incremental_margin,
        incrementalUnits:        summary.total_incremental_units,
        promoRoi:                summary.der * 100,
        customerTargetedCount:   summary.customers_targeted,
        audienceReached:         summary.customers_targeted,
        redemptionRate:          summary.customers_targeted > 0
          ? Math.round((summary.customers_targeted / (summary.customers_targeted + summary.customers_no_offer)) * 1000) / 10
          : 0,
        discountEfficiencyRatio: summary.der,
        discountCost:            summary.total_budget_spent,
      });

      setCostStructure({
        discountCostRedeemedOnly: summary.total_budget_spent,
        fixedOverhead:            0,
        adSpend:                  0,
        reachDeliveryFee:         0,
        marketingAgencyCost:      0,
        totalCost:                summary.total_budget_spent,
      });

      // Pull paginated customer allocations
      const custResp = await apiClient.get<PaginatedResponse<CustomerAllocationRecord>>(
        `/campaigns/${encodeURIComponent(campId)}/customers`,
        { limit: 35, offset: (customerPage - 1) * 35 }
      );

      const mapped: CustomerRow[] = custResp.items.map((c) => ({
        campaignName:     campId,
        customerId:       c.customer_id,
        audienceSegment:  'personalized_segment',
        behavioralCluster: `Cluster ${c.cluster_id}`,
        primeStatus:      c.prime_status === 'prime' ? 'Prime' : 'Non-Prime',
        productCode:      c.product_code,
        productName:      c.product_code,
        category:         c.category_group,
        purchaseRegion:   'Unknown',
        purchaseChannel:  'Unknown',
        recDiscount:      Math.round(c.depth * 100),
        recMechanic:      'pct_discount' as OfferMechanic,
        estIncUnits:      c.incremental_units,
        estDiscountCost:  c.discount_cost,
        constraintFlags:  'INVIMA Pass',
        decision:         c.depth > 0 ? 'YES' : 'NO OFFER',
        action:           'Override',
      }));
      setCustomers(mapped);

    } catch (err) {
      // Try legacy endpoint as fallback
      try {
        const payload = {
          country:          filters.country,
          campaign_type:    filters.campaignType || 'awareness',
          channel:          filters.channel,
          audience_type:    filters.audienceType,
          prime_tier:       filters.primeTier,
          mechanic:         filters.mechanic === 'All' ? 'pct_discount' : filters.mechanic,
          sku_ids:          filters.sku === 'All' ? undefined : [filters.sku],
          selected_clusters: filters.selectedClusters,
          region:           filters.region,
          page:             customerPage,
          page_size:        35,
          regular_discount_pct: regularDiscount,
          prime_discount_pct:   primeDiscount,
          limit:            35,
        };
        const res: any = await apiClient.post('/studio/kpis', payload);

        if (res.ribbon) {
          const byLabel = Object.fromEntries(res.ribbon.map((i: any) => [i.label, i]));
          const parse = (label: string, fb: number) => {
            const raw = String(byLabel[label]?.value || '');
            const val = Number(raw.replace(/[^0-9.-]/g, ''));
            if (!Number.isFinite(val)) return fb;
            if (/K/i.test(raw)) return val * 1_000;
            if (/M/i.test(raw)) return val * 1_000_000;
            return val;
          };
          const reached  = parse('Audience Reached', 6191);
          const redRate  = parse('Redemption Rate', 25.2);
          const redeemed = Math.round(reached * (redRate / 100));
          setKpis({
            incrementalRevenue:      parse('Incremental Revenue', 124_680_000),
            incrementalUnits:        parse('Incremental Units', 3_900),
            promoRoi:                parse('True Promo ROI', 145),
            customerTargetedCount:   parse('Customer Targeted Count', 6731),
            audienceReached:         reached,
            redemptionRate:          redRate,
            discountEfficiencyRatio: parse('Discount Efficiency Ratio (DER)', 4.97),
            discountCost:            Math.round(redeemed * (regularDiscount / 100) * 125_000),
          });
        }
        if (res.cluster_distribution) setClusterDist(res.cluster_distribution);
        const rows = res.customer_rows || res.customers || [];
        if (rows.length > 0) {
          setCustomers(rows.map((c: any): CustomerRow => ({
            campaignName:     `${filters.campaign}`,
            customerId:       c.customerId,
            audienceSegment:  c.audience || 'personalized_segment',
            behavioralCluster: c.clusterLabel || 'Unknown',
            primeStatus:      c.prime ? 'Prime' : 'Non-Prime',
            productCode:      c.sku,
            productName:      c.productName,
            category:         c.category || 'Unknown',
            purchaseRegion:   c.purchaseRegion || 'Unknown',
            purchaseChannel:  c.purchaseChannel || 'Unknown',
            recDiscount:      c.active_discount_pct,
            recMechanic:      (c.mechanic || 'pct_discount') as OfferMechanic,
            offerDisplayText: c.offer_display_text,
            estIncUnits:      c.incUnits,
            estDiscountCost:  c.discountCost,
            constraintFlags:  c.flags?.length > 0 ? c.flags.join(', ') : 'INVIMA Pass',
            decision:         c.decision ? 'YES' : 'NO OFFER',
            action:           'Override',
          })));
        }
        if (res.cost_breakdown) {
          setCostStructure({
            discountCostRedeemedOnly: res.cost_breakdown.discount_cost_redeemed_only,
            fixedOverhead:            res.cost_breakdown.fixed_overhead,
            adSpend:                  res.cost_breakdown.ad_spend,
            reachDeliveryFee:         res.cost_breakdown.channel_send_cost,
            marketingAgencyCost:      res.cost_breakdown.marketing_spend,
            totalCost:                res.cost_breakdown.total_campaign_cost,
          });
        }
      } catch {
        console.warn('Both Phase 2 and legacy backend calls failed; showing cached state.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    customerPage, filters.audienceType, filters.campaign, filters.campaignType,
    filters.channel, filters.country, filters.mechanic, filters.primeTier,
    filters.region, filters.selectedClusters, filters.sku,
    regularDiscount, primeDiscount,
  ]);

  useEffect(() => { fetchStudioKpis(); }, [fetchStudioKpis]);

  return {
    kpis, clusterDist, customers, costStructure, cateData,
    cannibalization, freshCustomerData, filterOptions,
    loading, customerPage,
    customerHasNext: customers.length === 35,
    setCustomerPage,
    refreshKpis: fetchStudioKpis,
  };
}
