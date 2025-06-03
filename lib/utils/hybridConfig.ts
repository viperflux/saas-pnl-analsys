import { PricingTier, FeatureAddon, GrowthScenario, HybridPricingData } from '@/types';

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    baseFee: 99,
    includedUsers: 5,
    aiCredits: 1000,
    perUserRate: 15,
    aiOverageRate: 0.02,
    description: 'Perfect for small teams getting started'
  },
  {
    id: 'growth',
    name: 'Growth',
    baseFee: 299,
    includedUsers: 15,
    aiCredits: 5000,
    perUserRate: 12,
    aiOverageRate: 0.015,
    description: 'Ideal for growing businesses'
  },
  {
    id: 'scale',
    name: 'Scale',
    baseFee: 799,
    includedUsers: 50,
    aiCredits: 20000,
    perUserRate: 10,
    aiOverageRate: 0.01,
    description: 'Built for scaling organizations'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    baseFee: 1999,
    includedUsers: 150,
    aiCredits: 100000,
    perUserRate: 8,
    aiOverageRate: 0.008,
    description: 'Enterprise-grade features and support'
  }
];

export const FEATURE_ADDONS: FeatureAddon[] = [
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    price: 49,
    description: 'Enhanced reporting and dashboards',
    enabled: false,
    pricingModel: 'flat_rate'
  },
  {
    id: 'api_access',
    name: 'API Access',
    price: 99,
    description: 'Full REST API with webhooks',
    enabled: false,
    pricingModel: 'flat_rate'
  },
  {
    id: 'white_label',
    name: 'White Label',
    price: 199,
    description: 'Custom branding and domain',
    enabled: false,
    pricingModel: 'flat_rate'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    price: 79,
    description: '24/7 priority customer support',
    enabled: false,
    pricingModel: 'flat_rate'
  },
  {
    id: 'sso_integration',
    name: 'SSO Integration',
    price: 149,
    description: 'Single sign-on with SAML/OAuth',
    enabled: false,
    pricingModel: 'flat_rate'
  },
  {
    id: 'data_export',
    name: 'Data Export',
    price: 29,
    description: 'Bulk data export capabilities',
    enabled: false,
    pricingModel: 'flat_rate'
  }
];

export const GROWTH_SCENARIOS: Record<string, GrowthScenario> = {
  conservative: {
    name: 'Conservative',
    description: 'Slow but steady growth with higher churn',
    tenants: 60,
    usersPerTenant: 10,
    aiUsagePerTenant: 30,
    tenantGrowthRate: 0.08, // 8% monthly tenant growth
    userGrowthRate: 0.03, // 3% monthly user growth per tenant
    aiGrowthRate: 0.05, // 5% monthly AI usage growth
    churnRate: 0.06 // 6% monthly churn
  },
  base: {
    name: 'Base Case',
    description: 'Realistic growth assumptions',
    tenants: 100,
    usersPerTenant: 15,
    aiUsagePerTenant: 50,
    tenantGrowthRate: 0.15, // 15% monthly tenant growth
    userGrowthRate: 0.05, // 5% monthly user growth per tenant
    aiGrowthRate: 0.08, // 8% monthly AI usage growth
    churnRate: 0.04 // 4% monthly churn
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Optimistic growth with viral adoption',
    tenants: 160,
    usersPerTenant: 20,
    aiUsagePerTenant: 75,
    tenantGrowthRate: 0.25, // 25% monthly tenant growth
    userGrowthRate: 0.08, // 8% monthly user growth per tenant
    aiGrowthRate: 0.12, // 12% monthly AI usage growth
    churnRate: 0.02 // 2% monthly churn
  }
};

export const DEFAULT_HYBRID_CONFIG: HybridPricingData = {
  startingCash: 50000,
  startDate: "2025-06-01",
  monthlyFixedCosts: {
    infra: 2500,
    salary: 25000,
    support: 3000,
    wages: 5000,
    hosting: 1200
  },
  capitalPurchases: [10000, 0, 0, 5000, 0, 0, 0, 0, 0, 0, 0, 0],
  initialTenants: 10,
  selectedTier: 'growth',
  customPricingTiers: [],
  avgUsersPerTenant: 15,
  avgAiUsagePerTenant: 50,
  selectedAddons: ['advanced_analytics'],
  growthScenario: 'base',
  projectionMonths: 12
};

export const HYBRID_STORAGE_KEY = 'hybrid-pricing-config';

export function saveHybridConfigToStorage(config: HybridPricingData): void {
  try {
    localStorage.setItem(HYBRID_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save hybrid configuration:', error);
  }
}

export function loadHybridConfigFromStorage(): HybridPricingData {
  try {
    const stored = localStorage.getItem(HYBRID_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_HYBRID_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load hybrid configuration:', error);
  }
  return DEFAULT_HYBRID_CONFIG;
}

export function getPricingTier(tierId: string): PricingTier | null {
  return PRICING_TIERS.find(tier => tier.id === tierId) || null;
}

export function getFeatureAddon(addonId: string): FeatureAddon | null {
  return FEATURE_ADDONS.find(addon => addon.id === addonId) || null;
}

export function getGrowthScenario(scenarioId: string): GrowthScenario | null {
  return GROWTH_SCENARIOS[scenarioId] || null;
}

export function calculateTenantRevenue(
  tier: PricingTier,
  users: number,
  aiUsage: number,
  addons: FeatureAddon[]
): {
  baseRevenue: number;
  userRevenue: number;
  aiRevenue: number;
  addonRevenue: number;
  totalRevenue: number;
} {
  const additionalUsers = Math.max(0, users - tier.includedUsers);
  const userRevenue = additionalUsers * tier.perUserRate;
  
  const aiUsageOverage = Math.max(0, aiUsage - tier.aiCredits);
  const aiRevenue = aiUsageOverage * tier.aiOverageRate;
  
  const addonRevenue = addons.reduce((sum, addon) => sum + addon.price, 0);
  
  const totalRevenue = tier.baseFee + userRevenue + aiRevenue + addonRevenue;
  
  return {
    baseRevenue: tier.baseFee,
    userRevenue,
    aiRevenue,
    addonRevenue,
    totalRevenue
  };
}