import { 
  HybridPricingData, 
  HybridMonthlyData, 
  HybridCalculationResults,
  PricingTier,
  FeatureAddon,
  GrowthScenario
} from '@/types';
import { 
  PRICING_TIERS, 
  FEATURE_ADDONS, 
  GROWTH_SCENARIOS,
  getPricingTier,
  getFeatureAddon,
  getGrowthScenario,
  calculateTenantRevenue
} from './hybridConfig';
import { format, addMonths, parseISO } from 'date-fns';

export function calculateHybridProjections(config: HybridPricingData): HybridCalculationResults {
  const monthlyData: HybridMonthlyData[] = [];
  const startDate = parseISO(config.startDate);
  
  // Get pricing tier and scenario
  const tier = getPricingTier(config.selectedTier);
  const scenario = getGrowthScenario(config.growthScenario) || config.customScenario;
  
  if (!tier || !scenario) {
    throw new Error('Invalid pricing tier or growth scenario');
  }
  
  // Get selected addons
  const selectedAddons = config.selectedAddons.map(id => getFeatureAddon(id)).filter(Boolean) as FeatureAddon[];
  
  // Calculate total fixed costs per month
  const fixedCostsPerMonth = 
    config.monthlyFixedCosts.infra +
    config.monthlyFixedCosts.salary +
    config.monthlyFixedCosts.support +
    config.monthlyFixedCosts.wages +
    config.monthlyFixedCosts.hosting;
  
  let currentTenants = config.initialTenants;
  let currentCash = config.startingCash;
  let currentUsersPerTenant = config.avgUsersPerTenant;
  let currentAiUsagePerTenant = config.avgAiUsagePerTenant;
  
  for (let month = 0; month < 12; month++) {
    const currentDate = addMonths(startDate, month);
    const monthName = format(currentDate, 'MMM yyyy');
    
    // Calculate tenant changes
    const churnedTenants = Math.round(currentTenants * scenario.churnRate);
    const newTenants = Math.round(currentTenants * scenario.tenantGrowthRate);
    const endingTenants = Math.max(0, currentTenants - churnedTenants + newTenants);
    
    // Calculate user and AI usage growth
    currentUsersPerTenant = Math.round(currentUsersPerTenant * (1 + scenario.userGrowthRate));
    currentAiUsagePerTenant = Math.round(currentAiUsagePerTenant * (1 + scenario.aiGrowthRate));
    
    // Use average tenants for revenue calculation
    const avgTenants = (currentTenants + endingTenants) / 2;
    const totalUsers = Math.round(avgTenants * currentUsersPerTenant);
    
    // Calculate revenue per tenant
    const tenantRevenue = calculateTenantRevenue(
      tier,
      currentUsersPerTenant,
      currentAiUsagePerTenant,
      selectedAddons
    );
    
    // Total revenue across all tenants
    const baseRevenue = avgTenants * tenantRevenue.baseRevenue;
    const userRevenue = avgTenants * tenantRevenue.userRevenue;
    const aiRevenue = avgTenants * tenantRevenue.aiRevenue;
    const addonRevenue = avgTenants * tenantRevenue.addonRevenue;
    const totalRevenue = baseRevenue + userRevenue + aiRevenue + addonRevenue;
    
    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = endingTenants * tenantRevenue.totalRevenue;
    
    // Calculate costs
    const fixedCosts = fixedCostsPerMonth;
    
    // Variable costs (estimated as percentage of revenue)
    const variableCostRate = 0.15; // 15% of revenue for infrastructure scaling, support, etc.
    const variableCosts = totalRevenue * variableCostRate;
    
    const capitalPurchase = config.capitalPurchases[month] || 0;
    const totalExpenses = fixedCosts + variableCosts + capitalPurchase;
    
    // Calculate profit and cash
    const profit = totalRevenue - totalExpenses;
    currentCash += profit;
    
    monthlyData.push({
      month: month + 1,
      date: monthName,
      tenants: Math.round(endingTenants),
      newTenants,
      churnedTenants,
      totalUsers,
      baseRevenue: Math.round(baseRevenue * 100) / 100,
      userRevenue: Math.round(userRevenue * 100) / 100,
      aiRevenue: Math.round(aiRevenue * 100) / 100,
      addonRevenue: Math.round(addonRevenue * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      fixedCosts: Math.round(fixedCosts * 100) / 100,
      variableCosts: Math.round(variableCosts * 100) / 100,
      capitalPurchase,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      cashOnHand: Math.round(currentCash * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      avgUsersPerTenant: currentUsersPerTenant,
      avgAiUsagePerTenant: currentAiUsagePerTenant,
    });
    
    currentTenants = endingTenants;
  }
  
  // Calculate summary metrics
  const totalRevenue = monthlyData.reduce((sum, month) => sum + month.totalRevenue, 0);
  const totalBaseRevenue = monthlyData.reduce((sum, month) => sum + month.baseRevenue, 0);
  const totalUserRevenue = monthlyData.reduce((sum, month) => sum + month.userRevenue, 0);
  const totalAiRevenue = monthlyData.reduce((sum, month) => sum + month.aiRevenue, 0);
  const totalAddonRevenue = monthlyData.reduce((sum, month) => sum + month.addonRevenue, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const finalCash = monthlyData[monthlyData.length - 1]?.cashOnHand || 0;
  
  // Find break-even month
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;
  for (let i = 0; i < monthlyData.length; i++) {
    cumulativeProfit += monthlyData[i].profit;
    if (cumulativeProfit > 0 && breakEvenMonth === null) {
      breakEvenMonth = i + 1;
    }
  }
  
  const maxTenants = Math.max(...monthlyData.map(m => m.tenants));
  const peakMRR = Math.max(...monthlyData.map(m => m.mrr));
  const avgMonthlyProfit = totalProfit / 12;
  
  // Calculate revenue composition percentages
  const revenueComposition = {
    base: (totalBaseRevenue / totalRevenue) * 100,
    users: (totalUserRevenue / totalRevenue) * 100,
    ai: (totalAiRevenue / totalRevenue) * 100,
    addons: (totalAddonRevenue / totalRevenue) * 100,
  };
  
  // Calculate growth metrics
  const initialTenants = config.initialTenants;
  const finalTenants = monthlyData[monthlyData.length - 1]?.tenants || 0;
  const tenantGrowthRate = ((finalTenants / initialTenants) ** (1/12) - 1) * 100;
  
  const initialUsers = config.avgUsersPerTenant;
  const finalUsers = monthlyData[monthlyData.length - 1]?.avgUsersPerTenant || 0;
  const userGrowthRate = ((finalUsers / initialUsers) ** (1/12) - 1) * 100;
  
  // Calculate LTV and CAC (simplified estimates)
  const avgMonthlyRevenuePerTenant = totalRevenue / 12 / ((initialTenants + finalTenants) / 2);
  const avgChurnRate = scenario.churnRate;
  const ltv = avgMonthlyRevenuePerTenant / avgChurnRate; // Simplified LTV calculation
  
  // Estimate CAC based on marketing spend (assumed 20% of revenue)
  const marketingSpend = totalRevenue * 0.20;
  const totalNewTenants = monthlyData.reduce((sum, month) => sum + month.newTenants, 0);
  const cac = totalNewTenants > 0 ? marketingSpend / totalNewTenants : 0;
  
  return {
    monthlyData,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalBaseRevenue: Math.round(totalBaseRevenue * 100) / 100,
    totalUserRevenue: Math.round(totalUserRevenue * 100) / 100,
    totalAiRevenue: Math.round(totalAiRevenue * 100) / 100,
    totalAddonRevenue: Math.round(totalAddonRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    finalCash: Math.round(finalCash * 100) / 100,
    breakEvenMonth,
    maxTenants,
    peakMRR: Math.round(peakMRR * 100) / 100,
    avgMonthlyProfit: Math.round(avgMonthlyProfit * 100) / 100,
    revenueComposition: {
      base: Math.round(revenueComposition.base * 100) / 100,
      users: Math.round(revenueComposition.users * 100) / 100,
      ai: Math.round(revenueComposition.ai * 100) / 100,
      addons: Math.round(revenueComposition.addons * 100) / 100,
    },
    growthMetrics: {
      tenantGrowthRate: Math.round(tenantGrowthRate * 100) / 100,
      userGrowthRate: Math.round(userGrowthRate * 100) / 100,
      churnRate: Math.round(avgChurnRate * 100 * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      cac: Math.round(cac * 100) / 100,
    },
  };
}

export function generateHybridChartData(monthlyData: HybridMonthlyData[]) {
  return monthlyData.map(month => ({
    month: month.date,
    baseRevenue: month.baseRevenue,
    userRevenue: month.userRevenue,
    aiRevenue: month.aiRevenue,
    addonRevenue: month.addonRevenue,
    totalRevenue: month.totalRevenue,
    expenses: month.totalExpenses,
    profit: month.profit,
    cash: month.cashOnHand,
    tenants: month.tenants,
    mrr: month.mrr,
    users: month.totalUsers,
  }));
}

export function exportHybridToCSV(config: HybridPricingData, results: HybridCalculationResults): string {
  const headers = [
    'Month',
    'Date',
    'Tenants',
    'New Tenants',
    'Churned Tenants',
    'Total Users',
    'Base Revenue ($)',
    'User Revenue ($)',
    'AI Revenue ($)',
    'Addon Revenue ($)',
    'Total Revenue ($)',
    'Fixed Costs ($)',
    'Variable Costs ($)',
    'Capital Purchase ($)',
    'Total Expenses ($)',
    'Profit ($)',
    'Cash on Hand ($)',
    'MRR ($)',
    'Avg Users/Tenant',
    'Avg AI Usage/Tenant',
  ];
  
  const rows = results.monthlyData.map(month => [
    month.month,
    month.date,
    month.tenants,
    month.newTenants,
    month.churnedTenants,
    month.totalUsers,
    month.baseRevenue,
    month.userRevenue,
    month.aiRevenue,
    month.addonRevenue,
    month.totalRevenue,
    month.fixedCosts,
    month.variableCosts,
    month.capitalPurchase,
    month.totalExpenses,
    month.profit,
    month.cashOnHand,
    month.mrr,
    month.avgUsersPerTenant,
    month.avgAiUsagePerTenant,
  ]);
  
  // Add summary rows
  const summaryRows = [
    [],
    ['SUMMARY'],
    ['Total Revenue', '', '', '', '', '', results.totalRevenue],
    ['Base Revenue', '', '', '', '', '', results.totalBaseRevenue],
    ['User Revenue', '', '', '', '', '', results.totalUserRevenue],
    ['AI Revenue', '', '', '', '', '', results.totalAiRevenue],
    ['Addon Revenue', '', '', '', '', '', results.totalAddonRevenue],
    ['Total Expenses', '', '', '', '', '', results.totalExpenses],
    ['Total Profit', '', '', '', '', '', results.totalProfit],
    ['Final Cash', '', '', '', '', '', results.finalCash],
    ['Break-even Month', '', '', '', '', '', results.breakEvenMonth || 'N/A'],
    ['Max Tenants', '', '', '', '', '', results.maxTenants],
    ['Peak MRR', '', '', '', '', '', results.peakMRR],
    [],
    ['GROWTH METRICS'],
    ['Tenant Growth Rate (%)', '', '', '', '', '', results.growthMetrics.tenantGrowthRate],
    ['User Growth Rate (%)', '', '', '', '', '', results.growthMetrics.userGrowthRate],
    ['Churn Rate (%)', '', '', '', '', '', results.growthMetrics.churnRate],
    ['LTV ($)', '', '', '', '', '', results.growthMetrics.ltv],
    ['CAC ($)', '', '', '', '', '', results.growthMetrics.cac],
    [],
    ['REVENUE COMPOSITION (%)'],
    ['Base Revenue', '', '', '', '', '', results.revenueComposition.base],
    ['User Revenue', '', '', '', '', '', results.revenueComposition.users],
    ['AI Revenue', '', '', '', '', '', results.revenueComposition.ai],
    ['Addon Revenue', '', '', '', '', '', results.revenueComposition.addons],
  ];
  
  const allRows = [headers, ...rows, ...summaryRows];
  
  return allRows.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') 
        ? `"${cell}"` 
        : cell
    ).join(',')
  ).join('\n');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}