// ============================================================
// src/types/index.ts  –  Farmatodo Promotion Intelligence Studio
// Data contracts strictly matching Phase 2 gold table schemas
// ============================================================

// ---------------------------------------------------------------------------
// Primitive shared types
// ---------------------------------------------------------------------------
export type Country = 'Colombia' | 'Venezuela' | 'CO' | 'VE';
export type CampaignType = 'awareness' | 'reactivation' | 'retention' | 'cross_sell' | 'flash_sale';
export type OfferMechanic = 'pct_discount' | 'coupon' | 'multibuy' | 'bundle' | 'special_price' | 'prime_differential';
export type PrimeTier = 'All' | 'Prime Only' | 'Non-Prime';
export type WindowType = 'normal_period' | 'promo_counterfactual';
export type SolverMethod = 'greedy' | 'greedy_no_offer' | 'ortools_cpsat';

// ---------------------------------------------------------------------------
// Global filter state (drives every studio + causal tab)
// ---------------------------------------------------------------------------
export interface GlobalFilterState {
  country: Country;
  campaign: string;
  campaignType: string;
  sku: string;
  category: string;
  region: string;
  mechanic: OfferMechanic | 'All';
  primeTier: PrimeTier;
  dateRange: string;
  audienceType: string;
  channel: string;
  lifecycle: string;
  selectedClusters: string[];
}

// ---------------------------------------------------------------------------
// Filter metadata (GET /api/v1/filters/meta)
// ---------------------------------------------------------------------------
export interface ClusterDefinition {
  id: number;
  name: string;
  short: string;
}

export interface CampaignMetaRecord {
  campaign_id: string;
  campaign_name?: string;
  country?: string;
  campaign_type?: string;
}

export interface FilterMeta {
  campaigns: CampaignMetaRecord[];
  category_groups: string[];
  countries: string[];
  channels: string[];
  clusters: ClusterDefinition[];
  campaign_types: string[];
  mechanics: Array<{ id: string; label: string }>;
  audiences:  Array<{ id: string; label: string }>;
  regions: string[];
}

// ---------------------------------------------------------------------------
// Campaign KPI ribbon  (GET /api/v1/campaigns/{id}/summary)
// ---------------------------------------------------------------------------
export interface CampaignSummaryKPI {
  campaign_id: string;
  total_budget_spent: number;
  net_incremental_margin: number;
  total_incremental_units: number;
  total_baseline_units: number;
  der: number;                   // Discount Efficiency Ratio = NIM / spend
  customers_targeted: number;
  customers_no_offer: number;
}

// Legacy shape kept for backward compat with KpiRibbon component
export interface KpiRibbonData {
  incrementalRevenue: number;
  incrementalUnits: number;
  promoRoi: number;
  customerTargetedCount: number;
  audienceReached: number;
  redemptionRate: number;
  discountEfficiencyRatio: number;
  discountCost: number;
}

// ---------------------------------------------------------------------------
// Customer allocation table  (GET /api/v1/campaigns/{id}/customers)
// ---------------------------------------------------------------------------
export interface CustomerAllocationRecord {
  customer_id: string;
  product_code: string;
  campaign_id: string;
  category_group: string;
  cluster_id: number;
  prime_status: 'prime' | 'regular';
  depth: number;                    // 0.0 → 0.25
  cate_total_units: number;
  baseline_units: number;
  incremental_units: number;
  discount_cost: number;
  net_profit: number;
  solver_method: SolverMethod;
}

// Legacy shape kept for CustomerTable component
export interface CustomerRow {
  campaignName: string;
  customerId: string;
  audienceSegment: string;
  behavioralCluster: string;
  primeStatus: 'Prime' | 'Non-Prime';
  productCode: string;
  productName: string;
  category?: string;
  purchaseRegion?: string;
  purchaseChannel?: string;
  recDiscount: number;
  recMechanic: OfferMechanic;
  offerDisplayText?: string;
  estIncUnits: number;
  estDiscountCost: number;
  constraintFlags: string;
  decision: 'YES' | 'NO OFFER';
  action: 'Override';
}

// ---------------------------------------------------------------------------
// Response curve params  (GET /api/v1/causal/response-curves)
// ---------------------------------------------------------------------------
export interface ResponseCurveParam {
  category_group: string;
  cluster_id: number;
  sample_customers: number;
  d_threshold: number;
  d_plateau: number;
  elasticity_at_15pct: number;
  r2_score: number;
  hill_Vmax?: number;
  hill_K?: number;
  hill_n?: number;
  estimation_method: string;
  curve_source: string;
}

// Single point on the smooth 50-point curve
export interface CurvePointData {
  depth_pct: number;
  expected_lift: number;
  ci_lower: number;
  ci_upper: number;
}

// Discrete candidate depth dot
export interface CandidateDot {
  depth_pct: number;
  actual_avg_lift: number;
  ci_lower: number;
  ci_upper: number;
}

// Full curve-points API payload (GET /api/v1/causal/curve-points)
export interface CurvePointsPayload {
  category_group: string;
  cluster_id: number;
  d_threshold_pct: number;
  d_plateau_pct: number;
  elasticity_at_15pct: number;
  r2_score: number;
  hill_params: { Vmax: number; K: number; n: number };
  curve: CurvePointData[];
  candidate_dots: CandidateDot[];
}

// ---------------------------------------------------------------------------
// CATE uplift scores  (GET /api/v1/causal/cate-decomposition)
// ---------------------------------------------------------------------------
export interface CateScoreRecord {
  customer_id: string;
  product_code: string;
  campaign_id: string;
  category_group: string;
  cluster_id: number;
  prime_status: string;
  depth: number;
  baseline_units: number;
  cate_incremental_units: number;
  cate_total_units: number;
  ci_lower: number;
  ci_upper: number;
  model_version: string;
}

// Legacy shape
export interface CateDecompositionData {
  exposureCate: number;
  doseCate: number;
  netCate: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
}

// ---------------------------------------------------------------------------
// Category macro baseline  (GET /api/v1/analytics/category-baseline)
// ---------------------------------------------------------------------------
export interface CategoryBaselineRecord {
  category_group: string;
  category?: string;
  country?: string;
  channel?: string;
  week?: string;
  window_type: WindowType;
  baseline_units: number;
  actual_units?: number;
  incremental_units?: number;
  incremental_margin?: number;
  lift_pct?: number;
  smoothed_lift_pct?: number;
}

// ---------------------------------------------------------------------------
// Cannibalization estimates  (GET /api/v1/analytics/cannibalization)
// ---------------------------------------------------------------------------
export interface CannibalizationRecord {
  product_code: string;
  category_group: string;
  pull_forward_rate: number;
  pull_forward_window_days: number;
  substitute_count: number;
  cannib_margin_loss_per_promo_unit: number;
  model_version: string;
}

export interface CannibalizationMetrics {
  crossProductLossUnits: number;
  crossProductLossMargin: number;
  pullForwardLossUnits: number;
  pullForwardLossMargin: number;
  netIncrementalGain: number;
}

// ---------------------------------------------------------------------------
// 6-step incrementality audit  (GET /api/v1/audit/incrementality)
// ---------------------------------------------------------------------------
export interface IncrementalityAuditRecord {
  campaign_id: string;
  product_code: string;
  treatment_customers: number;
  holdout_customers: number;
  step2_observed_diff_units: number;
  step3_attribution_corrected_units: number;
  step4_true_incremental_units: number;
  step5_cannibalization_loss: number;
  step5_pull_forward_rate?: number;
  step6_final_measured_nim: number;
  avg_unit_price?: number;
  confidence_grade: string;
  measurement_model_version: string;
  computed_at?: string;
}

// ---------------------------------------------------------------------------
// Pricing review  (GET /api/v1/pricing/review)
// ---------------------------------------------------------------------------
export interface PricingReviewRecord {
  product_code: string;
  category_group: string;
  reconstructed_regular_price: number;
  unit_cost?: number;
  gross_margin_pct?: number;
  effective_max_discount_pct?: number;
  winning_tier?: string;
}

// ---------------------------------------------------------------------------
// Misc legacy types (kept for existing component compat)
// ---------------------------------------------------------------------------
export interface CampaignCostStructure {
  discountCostRedeemedOnly: number;
  fixedOverhead: number;
  adSpend: number;
  reachDeliveryFee: number;
  marketingAgencyCost: number;
  totalCost: number;
}

export interface FreshCustomerUpliftData {
  freshCustomerLift: number;
  freshCustomerVolume: number;
  replenishmentLift: number;
  replenishmentVolume: number;
  counterfactualBaseline: number;
}

export interface PaginatedResponse<T> {
  total_records: number;
  items: T[];
}
