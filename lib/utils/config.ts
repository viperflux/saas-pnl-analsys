import { FinancialData } from '@/types';

export const DEFAULT_CONFIG: FinancialData = {
  startingCash: 0,
  startDate: "2025-06-01",
  pricePerClient: 49,
  churnRate: 0.03,
  monthlyFixedCosts: {
    infra: 1588.60,
    salary: 3000,
    support: 500,
    wages: 1000,
    hosting: 1600
  },
  openAiCostPerClient: 5,
  capitalPurchases: [2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  seasonalGrowth: [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3],
  initialClients: 5,
  projectionMonths: 12,
  selectedGrowthScenario: 'conservative',
  enabledAddons: []
};

export const STORAGE_KEY = 'pnl-analysis-config';

export function saveConfigToStorage(config: FinancialData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save configuration:', error);
  }
}

export function loadConfigFromStorage(): FinancialData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default config to ensure all properties exist
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
  return DEFAULT_CONFIG;
}

export function resetConfig(): FinancialData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset configuration:', error);
  }
  return DEFAULT_CONFIG;
}

export const SCENARIO_PRESETS = {
  conservative: {
    name: "Conservative Growth",
    description: "Lower growth, higher churn",
    modifications: {
      seasonalGrowth: [4, 5, 6, 3, 3, 4, 5, 6, 4, 3, 2, 2],
      churnRate: 0.05
    }
  },
  aggressive: {
    name: "Aggressive Growth",
    description: "Higher growth, lower churn",
    modifications: {
      seasonalGrowth: [15, 18, 20, 12, 14, 16, 18, 20, 15, 12, 10, 8],
      churnRate: 0.02
    }
  },
  priceIncrease: {
    name: "Price Increase",
    description: "50% price increase after month 3",
    modifications: {
      pricePerClient: 74
    }
  }
};

export const PROJECTION_TIMEFRAMES = [
  { months: 12, years: 1, label: '1 Year' },
  { months: 18, years: 1.5, label: '18 Months' },
  { months: 24, years: 2, label: '2 Years' },
  { months: 36, years: 3, label: '3 Years' },
  { months: 48, years: 4, label: '4 Years' },
  { months: 60, years: 5, label: '5 Years' }
];

export const DEFAULT_GROWTH_SCENARIOS = [
  {
    id: 'conservative',
    name: 'Conservative Growth',
    description: 'Steady 5-8% monthly growth with seasonal variations',
    growthRates: Array(60).fill(0).map((_, i) => {
      const baseGrowth = [5, 6, 7, 5, 6, 7, 8, 7, 6, 5, 4, 5];
      return baseGrowth[i % 12];
    }),
    isDefault: true
  },
  {
    id: 'aggressive',
    name: 'Aggressive Growth',
    description: 'High growth targeting 10-15% monthly increases',
    growthRates: Array(60).fill(0).map((_, i) => {
      const baseGrowth = [10, 12, 15, 12, 13, 14, 15, 13, 12, 10, 8, 10];
      return baseGrowth[i % 12];
    }),
    isDefault: false
  },
  {
    id: 'startup',
    name: 'Startup Launch',
    description: 'Initial rapid growth followed by stabilization',
    growthRates: Array(60).fill(0).map((_, i) => {
      if (i < 6) return [20, 25, 30, 25, 20, 15][i];
      if (i < 12) return [12, 10, 8, 6, 5, 5][i - 6];
      const baseGrowth = [6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5];
      return baseGrowth[(i - 12) % 12];
    }),
    isDefault: false
  }
];

export const DEFAULT_FEATURE_ADDONS = [
  {
    id: 'premium-support',
    name: 'Premium Support',
    description: '24/7 priority support with dedicated account manager',
    price: 99,
    pricingModel: 'flat_rate' as const,
    enabled: false
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Advanced API access with higher rate limits',
    price: 29,
    pricingModel: 'per_user' as const,
    usageLimit: 10000,
    enabled: false
  },
  {
    id: 'white-labeling',
    name: 'White Labeling',
    description: 'Remove branding and customize with your own',
    price: 199,
    pricingModel: 'flat_rate' as const,
    enabled: false
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Detailed reporting and custom dashboards',
    price: 49,
    pricingModel: 'usage_based' as const,
    usageLimit: 1000,
    enabled: false
  }
];

export function extendArrayToMonths(array: number[], targetMonths: number): number[] {
  if (array.length >= targetMonths) {
    return array.slice(0, targetMonths);
  }
  
  const extended = [...array];
  const pattern = array.length;
  
  while (extended.length < targetMonths) {
    const index = extended.length % pattern;
    extended.push(array[index]);
  }
  
  return extended.slice(0, targetMonths);
}

export function generateGrowthRatesForMonths(scenario: string, months: number): number[] {
  const scenarios = DEFAULT_GROWTH_SCENARIOS.find(s => s.id === scenario);
  if (!scenarios) {
    return extendArrayToMonths(DEFAULT_CONFIG.seasonalGrowth, months);
  }
  return scenarios.growthRates.slice(0, months);
}