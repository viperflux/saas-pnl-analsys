export interface PricingTier {
  id: string;
  name: string;
  baseFee: number;
  includedUsers: number;
  aiCredits: number;
  perUserRate: number;
  aiOverageRate: number;
  description: string;
}

export interface FeatureAddon {
  id: string;
  name: string;
  price: number;
  description: string;
  enabled: boolean;
  pricingModel: 'per_user' | 'flat_rate' | 'usage_based';
  usageLimit?: number;
  quantity?: number;
  customPrice?: number;
}

export interface CustomPricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    users?: number;
    storage?: number;
    apiCalls?: number;
    projects?: number;
  };
  isActive: boolean;
}

export interface ExtendedGrowthScenario {
  id: string;
  name: string;
  description: string;
  growthRates: number[]; // Monthly growth rates for up to 60 months
  seasonalModifiers?: number[];
  isDefault: boolean;
}

export interface TenantProfile {
  users: number;
  aiUsage: number;
  addons: FeatureAddon[];
  pricingTier: string;
}

export interface GrowthScenario {
  name: string;
  description: string;
  tenants: number;
  usersPerTenant: number;
  aiUsagePerTenant: number;
  tenantGrowthRate: number;
  userGrowthRate: number;
  aiGrowthRate: number;
  churnRate: number;
  marketingSpendRate?: number;
  cac?: number;
  ltv?: number;
  nrr?: number;
}

export interface HybridPricingData {
  startingCash: number;
  startDate: string;
  monthlyFixedCosts: {
    infra: number;
    salary: number;
    support: number;
    wages: number;
    hosting: number;
    marketing?: number;
  };
  capitalPurchases: number[];
  initialTenants: number;
  selectedTier: string;
  customPricingTiers: CustomPricingTier[];
  avgUsersPerTenant: number;
  avgAiUsagePerTenant: number;
  selectedAddons: string[];
  growthScenario: string;
  customScenario?: GrowthScenario;
  projectionMonths: number;
  multipleScenarios?: GrowthScenario[];
  marketingMetrics?: MarketingMetrics;
}

export interface FinancialData {
  startingCash: number;
  startDate: string;
  pricePerUser: number;
  churnRate: number;
  monthlyFixedCosts: {
    infra: number;
    salary: number;
    support: number;
    wages: number;
    hosting: number;
    marketing?: number;
  };
  capitalPurchases: number[];
  seasonalGrowth: number[];
  initialUsers: number;
  projectionMonths: number;
  selectedGrowthScenario?: string;
  enabledAddons?: string[];
  marketingMetrics?: MarketingMetrics;
  avgUsersPerClient?: number;
  userGrowthRate?: number;
  userChurnRate?: number;
}

export interface MonthlyData {
  month: number;
  date: string;
  users: number;
  newUsers: number;
  churnedUsers: number;
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  capitalPurchase: number;
  totalExpenses: number;
  profit: number;
  cashOnHand: number;
  totalUsers?: number;
  arpu?: number;
  cac?: number;
  ltv?: number;
  marketingSpend?: number;
  retentionRate?: number;
  nrr?: number;
  timeToPayback?: number;
}

export interface HybridMonthlyData {
  month: number;
  date: string;
  tenants: number;
  newTenants: number;
  churnedTenants: number;
  totalUsers: number;
  baseRevenue: number;
  userRevenue: number;
  aiRevenue: number;
  addonRevenue: number;
  totalRevenue: number;
  fixedCosts: number;
  variableCosts: number;
  capitalPurchase: number;
  totalExpenses: number;
  profit: number;
  cashOnHand: number;
  mrr: number;
  avgUsersPerTenant: number;
  avgAiUsagePerTenant: number;
  arpu: number;
  cac: number;
  ltv: number;
  marketingSpend: number;
  retentionRate: number;
  nrr: number;
  timeToPayback: number;
  newUsers: number;
  churnedUsers: number;
}

export interface BreakEvenData {
  month: number;
  actualUsers: number;
  requiredUsers: number;
  breakEvenRevenue: number;
  actualRevenue: number;
  isBreakEven: boolean;
  percentToBreakEven: number;
}

export interface RevenueGoalData {
  currentAnnualRevenue: number;
  requiredAnnualRevenue: number;
  monthlyGoalRevenue: number;
  requiredUsersForGoal: number;
  additionalUsersNeeded: number;
  progressPercentage: number;
  projectedAnnualRevenue: number;
  monthsToReachGoal: number | null;
}

export interface CalculationResults {
  monthlyData: MonthlyData[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  finalCash: number;
  breakEvenMonth: number | null;
  maxUsers: number;
  avgMonthlyProfit: number;
  breakEvenData: BreakEvenData[];
  revenueGoalData: RevenueGoalData;
}

export interface HybridCalculationResults {
  monthlyData: HybridMonthlyData[];
  totalRevenue: number;
  totalBaseRevenue: number;
  totalUserRevenue: number;
  totalAiRevenue: number;
  totalAddonRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  finalCash: number;
  breakEvenMonth: number | null;
  maxTenants: number;
  peakMRR: number;
  avgMonthlyProfit: number;
  revenueComposition: {
    base: number;
    users: number;
    ai: number;
    addons: number;
  };
  growthMetrics: {
    tenantGrowthRate: number;
    userGrowthRate: number;
    churnRate: number;
    ltv: number;
    cac: number;
    arpu: number;
    nrr: number;
    timeToPayback: number;
  };
  marketingMetrics: MarketingAnalytics;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  cash: number;
  users: number;
}

export interface ScenarioConfig {
  name: string;
  description: string;
  modifications: Partial<FinancialData>;
}

export interface ExportData {
  config: FinancialData;
  results: CalculationResults;
  exportDate: string;
  version: string;
  projectionMonths: number;
  scenarios?: ExtendedGrowthScenario[];
  addons?: FeatureAddon[];
}

export interface ConfigurationSettings {
  userId: string;
  projectionMonths: number;
  enableMultipleScenarios: boolean;
  enableCustomPricing: boolean;
  enableFeatureAddons: boolean;
  defaultGrowthScenario?: string;
}

export interface ProjectionTimeframe {
  months: number;
  years: number;
  label: string;
}

export interface AddonCalculation {
  addonId: string;
  monthlyRevenue: number;
  totalRevenue: number;
  quantity: number;
  unitPrice: number;
}

export interface MarketingMetrics {
  monthlyMarketingSpend: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  paybackPeriodMonths: number;
  organicGrowthRate: number;
  paidGrowthRate: number;
  brandAwarenessSpend: number;
  performanceMarketingSpend: number;
  contentMarketingSpend: number;
  affiliateMarketingSpend: number;
  conversionRate: number;
  leadQualityScore: number;
  marketingROI: number;
}

export interface MarketingAnalytics {
  totalMarketingSpend: number;
  avgCac: number;
  avgLtv: number;
  avgLtvCacRatio: number;
  avgPaybackPeriod: number;
  marketingROI: number;
  channelPerformance: ChannelPerformance[];
  customerAcquisitionTrends: AcquisitionTrend[];
}

export interface ChannelPerformance {
  channel: string;
  spend: number;
  acquisitions: number;
  cac: number;
  roi: number;
}

export interface AcquisitionTrend {
  month: string;
  organicAcquisitions: number;
  paidAcquisitions: number;
  totalCost: number;
  blendedCac: number;
}

export interface UserLevelMetrics {
  avgUsersPerTenant: number;
  userGrowthRate: number;
  userChurnRate: number;
  userRetentionRate: number;
  userLtv: number;
  revenuePerUser: number;
  activeUserRate: number;
}

export interface RetentionMetrics {
  monthlyRetentionRate: number;
  nrr: number; // Net Revenue Retention
  grr: number; // Gross Revenue Retention
  expansionRevenue: number;
  contractionRevenue: number;
  churnRevenue: number;
}

export interface FeatureUsageMetrics {
  premiumFeatureAdoption: number;
  aiFeatureUsage: number;
  averageFeatureUtilization: number;
  featureStickiness: number;
}

export interface InfrastructureMetrics {
  serverCosts: number;
  aiInferenceCosts: number;
  apiUsageCosts: number;
  storageGrowthRate: number;
  scalingThresholds: ScalingThreshold[];
}

export interface ScalingThreshold {
  userCount: number;
  costPerUser: number;
  infrastructureUpgrade: number;
}