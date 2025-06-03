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
}

export interface FinancialData {
  startingCash: number;
  startDate: string;
  pricePerClient: number;
  churnRate: number;
  monthlyFixedCosts: {
    infra: number;
    salary: number;
    support: number;
    wages: number;
    hosting: number;
  };
  openAiCostPerClient: number;
  capitalPurchases: number[];
  seasonalGrowth: number[];
  initialClients: number;
  projectionMonths: number;
  selectedGrowthScenario?: string;
  enabledAddons?: string[];
}

export interface MonthlyData {
  month: number;
  date: string;
  clients: number;
  newClients: number;
  churnedClients: number;
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  aiCosts: number;
  capitalPurchase: number;
  totalExpenses: number;
  profit: number;
  cashOnHand: number;
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
}

export interface BreakEvenData {
  month: number;
  actualClients: number;
  requiredClients: number;
  breakEvenRevenue: number;
  actualRevenue: number;
  isBreakEven: boolean;
  percentToBreakEven: number;
}

export interface RevenueGoalData {
  currentAnnualRevenue: number;
  requiredAnnualRevenue: number;
  monthlyGoalRevenue: number;
  requiredClientsForGoal: number;
  additionalClientsNeeded: number;
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
  maxClients: number;
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
  };
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  cash: number;
  clients: number;
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