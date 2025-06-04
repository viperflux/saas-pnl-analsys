import {
  FinancialData,
  MonthlyData,
  CalculationResults,
  MarketingMetrics,
  MarketingAnalytics,
  UserLevelMetrics,
  RetentionMetrics,
  FeatureUsageMetrics,
  InfrastructureMetrics,
  HybridPricingData,
  HybridMonthlyData,
  HybridCalculationResults,
  GrowthScenario,
} from "@/types";
import { format, addMonths, parseISO } from "date-fns";

export function calculateEnhancedProjections(
  config: FinancialData,
): CalculationResults {
  const monthlyData: MonthlyData[] = [];
  const startDate = parseISO(config.startDate);
  const projectionMonths = config.projectionMonths || 12;

  // Initialize variables
  let currentUsers = config.initialUsers;
  let currentCash = config.startingCash;
  let currentUsersPerClient = config.avgUsersPerClient || 3;
  let totalUsers = currentUsers * currentUsersPerClient;

  // Marketing and customer metrics
  const marketingMetrics =
    config.marketingMetrics || getDefaultMarketingMetrics();
  const monthlyMarketingSpend = marketingMetrics.monthlyMarketingSpend;

  // Calculate total fixed costs including marketing
  const fixedCostsPerMonth =
    config.monthlyFixedCosts.infra +
    config.monthlyFixedCosts.salary +
    config.monthlyFixedCosts.support +
    config.monthlyFixedCosts.wages +
    config.monthlyFixedCosts.hosting +
    (config.monthlyFixedCosts.marketing || 0);

  // Track cumulative metrics for calculations
  let cumulativeMarketingSpend = 0;
  let totalNewCustomers = 0;
  let totalChurnedCustomers = 0;

  for (let month = 0; month < projectionMonths; month++) {
    const currentDate = addMonths(startDate, month);
    const monthName = format(currentDate, "MMM yyyy");

    // Calculate customer changes with enhanced metrics
    const churnedUsers = Math.round(currentUsers * config.churnRate);
    const organicNewUsers = Math.round(
      extendedGrowthPattern(month, config.seasonalGrowth) * 0.3,
    ); // 30% organic
    const paidNewUsers = Math.round(
      (monthlyMarketingSpend / marketingMetrics.cac) * 0.7,
    ); // 70% paid
    const newUsers = organicNewUsers + paidNewUsers;
    const endingUsers = Math.max(0, currentUsers - churnedUsers + newUsers);

    // User-level calculations
    const userGrowthRate = config.userGrowthRate || 0.05;
    const userChurnRate = config.userChurnRate || config.churnRate * 0.8;
    currentUsersPerClient = Math.round(
      currentUsersPerClient * (1 + userGrowthRate),
    );

    const newUsersTotal = newUsers * currentUsersPerClient;
    const churnedUsersFromTotal = Math.round(totalUsers * userChurnRate);
    totalUsers = Math.max(
      0,
      totalUsers - churnedUsersFromTotal + newUsersTotal,
    );

    // Revenue calculations with ARPU
    const avgUsers = (currentUsers + endingUsers) / 2;
    const baseRevenue = avgUsers * config.pricePerUser;
    const addonRevenue = calculateAddonRevenue(avgUsers, config.enabledAddons);
    const totalRevenue = baseRevenue + addonRevenue;

    // ARPU calculations
    const arpu = avgUsers > 0 ? totalRevenue / avgUsers : 0;
    const revenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

    // Cost calculations
    const infrastructureCosts = calculateInfrastructureCosts(
      totalUsers,
      config,
    );
    const variableCosts = infrastructureCosts;
    const capitalPurchase = extendedCapitalPurchases(
      month,
      config.capitalPurchases,
    );
    const marketingSpendThisMonth = monthlyMarketingSpend;
    const totalExpenses =
      fixedCostsPerMonth +
      variableCosts +
      capitalPurchase +
      marketingSpendThisMonth;

    // Update cumulative tracking
    cumulativeMarketingSpend += marketingSpendThisMonth;
    totalNewCustomers += newUsers;
    totalChurnedCustomers += churnedUsers;

    // Calculate LTV and CAC
    const avgCustomerLifespan = 1 / config.churnRate; // months
    const ltv = arpu * avgCustomerLifespan * 0.8; // 80% gross margin assumption
    const cac =
      totalNewCustomers > 0
        ? cumulativeMarketingSpend / totalNewCustomers
        : marketingMetrics.cac;

    // Retention and NRR calculations
    const retentionRate = 1 - config.churnRate;
    const expansionRevenue = avgUsers * config.pricePerUser * 0.15; // 15% expansion assumption
    const nrr = retentionRate + expansionRevenue / totalRevenue;

    // Time to payback calculation
    const timeToPayback = cac > 0 ? cac / (arpu * 0.8) : 0; // months to recover CAC

    // Cash flow
    const profit = totalRevenue - totalExpenses;
    currentCash += profit;

    monthlyData.push({
      month: month + 1,
      date: monthName,
      users: Math.round(endingUsers),
      newUsers,
      churnedUsers,
      revenue: Math.round(totalRevenue * 100) / 100,
      fixedCosts: Math.round(fixedCostsPerMonth * 100) / 100,
      variableCosts: Math.round(variableCosts * 100) / 100,
      capitalPurchase,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      cashOnHand: Math.round(currentCash * 100) / 100,
      totalUsers: Math.round(totalUsers),
      arpu: Math.round(arpu * 100) / 100,
      cac: Math.round(cac * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      marketingSpend: Math.round(marketingSpendThisMonth * 100) / 100,
      retentionRate: Math.round(retentionRate * 10000) / 100,
      nrr: Math.round(nrr * 10000) / 100,
      timeToPayback: Math.round(timeToPayback * 100) / 100,
    });

    currentUsers = endingUsers;
  }

  // Calculate marketing analytics
  const marketingAnalytics = calculateMarketingAnalytics(
    monthlyData,
    marketingMetrics,
  );

  // Enhanced summary calculations
  const totalRevenue = monthlyData.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );
  const totalExpenses = monthlyData.reduce(
    (sum, month) => sum + month.totalExpenses,
    0,
  );
  const totalProfit = totalRevenue - totalExpenses;
  const finalCash = monthlyData[monthlyData.length - 1]?.cashOnHand || 0;

  // Break-even analysis
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;
  for (let i = 0; i < monthlyData.length; i++) {
    cumulativeProfit += monthlyData[i].profit;
    if (cumulativeProfit > 0 && breakEvenMonth === null) {
      breakEvenMonth = i + 1;
    }
  }

  const maxUsers = Math.max(...monthlyData.map((m) => m.users));
  const avgMonthlyProfit = totalProfit / projectionMonths;

  // Enhanced break-even data with new metrics
  const breakEvenData = monthlyData.map((month, index) => {
    const requiredRevenueToBreakEven =
      month.fixedCosts + month.capitalPurchase + (month.marketingSpend || 0);
    const avgVariableCost =
      month.users > 0 ? month.variableCosts / month.users : 0;
    const requiredUsers = Math.ceil(
      requiredRevenueToBreakEven / (config.pricePerUser - avgVariableCost),
    );
    const breakEvenRevenue = requiredUsers * config.pricePerUser;
    const isBreakEven = month.profit >= 0;
    const percentToBreakEven = Math.min(
      (month.revenue / breakEvenRevenue) * 100,
      100,
    );

    return {
      month: month.month,
      actualUsers: month.users,
      requiredUsers: Math.max(0, requiredUsers),
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      actualRevenue: month.revenue,
      isBreakEven,
      percentToBreakEven: Math.round(percentToBreakEven * 100) / 100,
    };
  });

  const revenueGoalData = calculateEnhancedRevenueGoalData(
    monthlyData,
    config,
    marketingAnalytics,
  );

  return {
    monthlyData,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    finalCash: Math.round(finalCash * 100) / 100,
    breakEvenMonth,
    maxUsers,
    avgMonthlyProfit: Math.round(avgMonthlyProfit * 100) / 100,
    breakEvenData,
    revenueGoalData,
  };
}

export function calculateEnhancedHybridProjections(
  config: HybridPricingData,
): HybridCalculationResults {
  const monthlyData: HybridMonthlyData[] = [];
  const startDate = parseISO(config.startDate);
  const projectionMonths = config.projectionMonths || 12;

  // Initialize enhanced variables
  let currentTenants = config.initialTenants;
  let currentCash = config.startingCash;
  let currentUsersPerTenant = config.avgUsersPerTenant;
  let currentAiUsagePerTenant = config.avgAiUsagePerTenant;
  let totalUsers = currentTenants * currentUsersPerTenant;

  // Marketing metrics
  const marketingMetrics =
    config.marketingMetrics || getDefaultMarketingMetrics();
  const monthlyMarketingSpend = marketingMetrics.monthlyMarketingSpend;

  // Get growth scenario
  const scenario =
    getGrowthScenario(config.growthScenario) || config.customScenario;
  if (!scenario) throw new Error("Invalid growth scenario");

  // Enhanced fixed costs including marketing
  const fixedCostsPerMonth =
    config.monthlyFixedCosts.infra +
    config.monthlyFixedCosts.salary +
    config.monthlyFixedCosts.support +
    config.monthlyFixedCosts.wages +
    config.monthlyFixedCosts.hosting +
    (config.monthlyFixedCosts.marketing || 0);

  let cumulativeMarketingSpend = 0;
  let totalNewTenants = 0;

  for (let month = 0; month < projectionMonths; month++) {
    const currentDate = addMonths(startDate, month);
    const monthName = format(currentDate, "MMM yyyy");

    // Enhanced tenant calculations
    const churnedTenants = Math.round(currentTenants * scenario.churnRate);
    const organicNewTenants = Math.round(
      currentTenants * scenario.tenantGrowthRate * 0.4,
    );
    const paidNewTenants = Math.round(
      (monthlyMarketingSpend / marketingMetrics.cac) * 0.6,
    );
    const newTenants = organicNewTenants + paidNewTenants;
    const endingTenants = Math.max(
      0,
      currentTenants - churnedTenants + newTenants,
    );

    // User-level growth
    currentUsersPerTenant = Math.round(
      currentUsersPerTenant * (1 + scenario.userGrowthRate),
    );
    currentAiUsagePerTenant = Math.round(
      currentAiUsagePerTenant * (1 + scenario.aiGrowthRate),
    );

    const avgTenants = (currentTenants + endingTenants) / 2;
    const newUsers = newTenants * currentUsersPerTenant;
    const churnedUsers = Math.round(totalUsers * scenario.churnRate * 0.8); // User churn lower than tenant churn
    totalUsers = Math.max(0, totalUsers - churnedUsers + newUsers);

    // Enhanced revenue calculations
    const tenantRevenue = calculateEnhancedTenantRevenue(
      config,
      currentUsersPerTenant,
      currentAiUsagePerTenant,
    );
    const baseRevenue = avgTenants * tenantRevenue.baseRevenue;
    const userRevenue = avgTenants * tenantRevenue.userRevenue;
    const aiRevenue = avgTenants * tenantRevenue.aiRevenue;
    const addonRevenue = avgTenants * tenantRevenue.addonRevenue;
    const totalRevenue = baseRevenue + userRevenue + aiRevenue + addonRevenue;

    // Enhanced metrics
    const arpu = avgTenants > 0 ? totalRevenue / avgTenants : 0;
    const mrr = endingTenants * tenantRevenue.totalRevenue;

    // Cost calculations
    const variableCostRate = 0.15 + (totalUsers / 10000) * 0.05; // Scaling costs
    const variableCosts = totalRevenue * variableCostRate;
    const capitalPurchase = config.capitalPurchases[month] || 0;
    const marketingSpendThisMonth = monthlyMarketingSpend;
    const totalExpenses =
      fixedCostsPerMonth +
      variableCosts +
      capitalPurchase +
      marketingSpendThisMonth;

    // Update tracking
    cumulativeMarketingSpend += marketingSpendThisMonth;
    totalNewTenants += newTenants;

    // Enhanced SaaS metrics
    const avgTenantLifespan = 1 / scenario.churnRate;
    const ltv = arpu * avgTenantLifespan * 0.85; // 85% gross margin
    const cac =
      totalNewTenants > 0
        ? cumulativeMarketingSpend / totalNewTenants
        : marketingMetrics.cac;
    const retentionRate = 1 - scenario.churnRate;
    const expansionRate = 0.12; // 12% monthly expansion
    const nrr = retentionRate + expansionRate;
    const timeToPayback = cac > 0 ? cac / (arpu * 0.85) : 0;

    const profit = totalRevenue - totalExpenses;
    currentCash += profit;

    monthlyData.push({
      month: month + 1,
      date: monthName,
      tenants: Math.round(endingTenants),
      newTenants,
      churnedTenants,
      totalUsers: Math.round(totalUsers),
      baseRevenue: Math.round(baseRevenue * 100) / 100,
      userRevenue: Math.round(userRevenue * 100) / 100,
      aiRevenue: Math.round(aiRevenue * 100) / 100,
      addonRevenue: Math.round(addonRevenue * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      fixedCosts: Math.round(fixedCostsPerMonth * 100) / 100,
      variableCosts: Math.round(variableCosts * 100) / 100,
      capitalPurchase,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      cashOnHand: Math.round(currentCash * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      avgUsersPerTenant: currentUsersPerTenant,
      avgAiUsagePerTenant: currentAiUsagePerTenant,
      arpu: Math.round(arpu * 100) / 100,
      cac: Math.round(cac * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      marketingSpend: Math.round(marketingSpendThisMonth * 100) / 100,
      retentionRate: Math.round(retentionRate * 10000) / 100,
      nrr: Math.round(nrr * 10000) / 100,
      timeToPayback: Math.round(timeToPayback * 100) / 100,
      newUsers,
      churnedUsers,
    });

    currentTenants = endingTenants;
  }

  // Enhanced summary calculations
  const totalRevenue = monthlyData.reduce(
    (sum, month) => sum + month.totalRevenue,
    0,
  );
  const totalBaseRevenue = monthlyData.reduce(
    (sum, month) => sum + month.baseRevenue,
    0,
  );
  const totalUserRevenue = monthlyData.reduce(
    (sum, month) => sum + month.userRevenue,
    0,
  );
  const totalAiRevenue = monthlyData.reduce(
    (sum, month) => sum + month.aiRevenue,
    0,
  );
  const totalAddonRevenue = monthlyData.reduce(
    (sum, month) => sum + month.addonRevenue,
    0,
  );
  const totalExpenses = monthlyData.reduce(
    (sum, month) => sum + month.totalExpenses,
    0,
  );
  const totalProfit = totalRevenue - totalExpenses;
  const finalCash = monthlyData[monthlyData.length - 1]?.cashOnHand || 0;

  // Break-even calculation
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;
  for (let i = 0; i < monthlyData.length; i++) {
    cumulativeProfit += monthlyData[i].profit;
    if (cumulativeProfit > 0 && breakEvenMonth === null) {
      breakEvenMonth = i + 1;
    }
  }

  const maxTenants = Math.max(...monthlyData.map((m) => m.tenants));
  const peakMRR = Math.max(...monthlyData.map((m) => m.mrr));
  const avgMonthlyProfit = totalProfit / projectionMonths;

  // Enhanced revenue composition
  const revenueComposition = {
    base: (totalBaseRevenue / totalRevenue) * 100,
    users: (totalUserRevenue / totalRevenue) * 100,
    ai: (totalAiRevenue / totalRevenue) * 100,
    addons: (totalAddonRevenue / totalRevenue) * 100,
  };

  // Enhanced growth metrics
  const initialTenants = config.initialTenants;
  const finalTenants = monthlyData[monthlyData.length - 1]?.tenants || 0;
  const tenantGrowthRate =
    ((finalTenants / initialTenants) ** (1 / projectionMonths) - 1) * 100;

  const initialUsers = config.avgUsersPerTenant;
  const finalUsers =
    monthlyData[monthlyData.length - 1]?.avgUsersPerTenant || 0;
  const userGrowthRate =
    ((finalUsers / initialUsers) ** (1 / projectionMonths) - 1) * 100;

  // Enhanced LTV/CAC calculations
  const avgMonthlyRevenuePerTenant =
    totalRevenue / projectionMonths / ((initialTenants + finalTenants) / 2);
  const avgChurnRate = scenario.churnRate;
  const ltv = avgMonthlyRevenuePerTenant / avgChurnRate;
  const totalMarketingSpend = cumulativeMarketingSpend;
  const cac = totalNewTenants > 0 ? totalMarketingSpend / totalNewTenants : 0;
  const avgArpu =
    monthlyData.reduce((sum, month) => sum + month.arpu, 0) / projectionMonths;
  const avgNrr =
    monthlyData.reduce((sum, month) => sum + month.nrr, 0) / projectionMonths;
  const avgTimeToPayback =
    monthlyData.reduce((sum, month) => sum + month.timeToPayback, 0) /
    projectionMonths;

  // Marketing analytics
  const marketingAnalytics = calculateMarketingAnalytics(
    monthlyData.map((m) => ({
      ...m,
      clients: m.tenants,
      revenue: m.totalRevenue,
    })),
    marketingMetrics,
  );

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
      arpu: Math.round(avgArpu * 100) / 100,
      nrr: Math.round(avgNrr * 100) / 100,
      timeToPayback: Math.round(avgTimeToPayback * 100) / 100,
    },
    marketingMetrics: marketingAnalytics,
  };
}

// Helper functions

function getDefaultMarketingMetrics(): MarketingMetrics {
  return {
    monthlyMarketingSpend: 5000,
    cac: 250,
    ltv: 1200,
    ltvCacRatio: 4.8,
    paybackPeriodMonths: 8,
    organicGrowthRate: 0.15,
    paidGrowthRate: 0.35,
    brandAwarenessSpend: 1500,
    performanceMarketingSpend: 2500,
    contentMarketingSpend: 800,
    affiliateMarketingSpend: 200,
    conversionRate: 0.08,
    leadQualityScore: 75,
    marketingROI: 3.2,
  };
}

function extendedGrowthPattern(
  month: number,
  seasonalGrowth: number[],
): number {
  if (month < seasonalGrowth.length) {
    return seasonalGrowth[month];
  }
  const patternIndex = month % seasonalGrowth.length;
  return seasonalGrowth[patternIndex];
}

function extendedCapitalPurchases(
  month: number,
  capitalPurchases: number[],
): number {
  if (month < capitalPurchases.length) {
    return capitalPurchases[month] || 0;
  }
  return 0;
}

function calculateAddonRevenue(
  users: number,
  enabledAddons?: string[],
): number {
  if (!enabledAddons || enabledAddons.length === 0) return 0;
  const baseAddonRevenue = enabledAddons.length * 50;
  const userBasedAddonRevenue = users * enabledAddons.length * 5;
  return baseAddonRevenue + userBasedAddonRevenue;
}

function calculateInfrastructureCosts(
  totalUsers: number,
  config: FinancialData,
): number {
  const baseCost = 100; // Base infrastructure cost
  const scalingCost = Math.floor(totalUsers / 1000) * 50; // $50 per 1000 users
  return baseCost + scalingCost;
}

function calculateEnhancedTenantRevenue(
  config: HybridPricingData,
  usersPerTenant: number,
  aiUsagePerTenant: number,
): {
  baseRevenue: number;
  userRevenue: number;
  aiRevenue: number;
  addonRevenue: number;
  totalRevenue: number;
} {
  // Simplified calculation - in real implementation, use proper tier logic
  const baseRevenue = 299; // Growth tier base
  const userRevenue = Math.max(0, usersPerTenant - 15) * 12;
  const aiRevenue = Math.max(0, aiUsagePerTenant - 5000) * 0.015;
  const addonRevenue = config.selectedAddons.length * 75;

  return {
    baseRevenue,
    userRevenue,
    aiRevenue,
    addonRevenue,
    totalRevenue: baseRevenue + userRevenue + aiRevenue + addonRevenue,
  };
}

function getGrowthScenario(scenarioId: string): GrowthScenario | null {
  // Simplified - in real implementation, fetch from database or config
  const scenarios: Record<string, GrowthScenario> = {
    conservative: {
      name: "Conservative",
      description: "Steady growth",
      tenants: 60,
      usersPerTenant: 10,
      aiUsagePerTenant: 30,
      tenantGrowthRate: 0.08,
      userGrowthRate: 0.03,
      aiGrowthRate: 0.05,
      churnRate: 0.06,
    },
    base: {
      name: "Base Case",
      description: "Realistic growth",
      tenants: 100,
      usersPerTenant: 15,
      aiUsagePerTenant: 50,
      tenantGrowthRate: 0.15,
      userGrowthRate: 0.05,
      aiGrowthRate: 0.08,
      churnRate: 0.04,
    },
    aggressive: {
      name: "Aggressive",
      description: "High growth",
      tenants: 160,
      usersPerTenant: 20,
      aiUsagePerTenant: 75,
      tenantGrowthRate: 0.25,
      userGrowthRate: 0.08,
      aiGrowthRate: 0.12,
      churnRate: 0.02,
    },
  };

  return scenarios[scenarioId] || null;
}

function calculateMarketingAnalytics(
  monthlyData: any[],
  marketingMetrics: MarketingMetrics,
): MarketingAnalytics {
  const totalMarketingSpend = monthlyData.reduce(
    (sum, month) => sum + (month.marketingSpend || 0),
    0,
  );
  const totalNewCustomers = monthlyData.reduce(
    (sum, month) => sum + month.newClients,
    0,
  );
  const avgCac =
    totalNewCustomers > 0 ? totalMarketingSpend / totalNewCustomers : 0;

  const avgLtv =
    monthlyData.reduce((sum, month) => sum + (month.ltv || 0), 0) /
    monthlyData.length;
  const avgLtvCacRatio = avgCac > 0 ? avgLtv / avgCac : 0;
  const avgPaybackPeriod =
    monthlyData.reduce((sum, month) => sum + (month.timeToPayback || 0), 0) /
    monthlyData.length;

  const totalRevenue = monthlyData.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );
  const marketingROI =
    totalMarketingSpend > 0
      ? (totalRevenue - totalMarketingSpend) / totalMarketingSpend
      : 0;

  const channelPerformance = [
    {
      channel: "Performance Marketing",
      spend: totalMarketingSpend * 0.5,
      acquisitions: totalNewCustomers * 0.6,
      cac: avgCac * 0.9,
      roi: marketingROI * 1.2,
    },
    {
      channel: "Content Marketing",
      spend: totalMarketingSpend * 0.2,
      acquisitions: totalNewCustomers * 0.25,
      cac: avgCac * 0.7,
      roi: marketingROI * 1.8,
    },
    {
      channel: "Brand Awareness",
      spend: totalMarketingSpend * 0.25,
      acquisitions: totalNewCustomers * 0.1,
      cac: avgCac * 1.5,
      roi: marketingROI * 0.8,
    },
    {
      channel: "Affiliate Marketing",
      spend: totalMarketingSpend * 0.05,
      acquisitions: totalNewCustomers * 0.05,
      cac: avgCac * 0.8,
      roi: marketingROI * 2.0,
    },
  ];

  const customerAcquisitionTrends = monthlyData.map((month) => ({
    month: month.date,
    organicAcquisitions: Math.round(month.newClients * 0.3),
    paidAcquisitions: Math.round(month.newClients * 0.7),
    totalCost: month.marketingSpend || 0,
    blendedCac: month.cac || 0,
  }));

  return {
    totalMarketingSpend: Math.round(totalMarketingSpend * 100) / 100,
    avgCac: Math.round(avgCac * 100) / 100,
    avgLtv: Math.round(avgLtv * 100) / 100,
    avgLtvCacRatio: Math.round(avgLtvCacRatio * 100) / 100,
    avgPaybackPeriod: Math.round(avgPaybackPeriod * 100) / 100,
    marketingROI: Math.round(marketingROI * 100) / 100,
    channelPerformance,
    customerAcquisitionTrends,
  };
}

function calculateEnhancedRevenueGoalData(
  monthlyData: MonthlyData[],
  config: FinancialData,
  marketingAnalytics: MarketingAnalytics,
): any {
  const TARGET_ANNUAL_REVENUE = 1_000_000;
  const currentAnnualRevenue = monthlyData.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );
  const monthlyGoalRevenue = TARGET_ANNUAL_REVENUE / 12;

  // Calculate required users for $1M goal considering all costs
  const avgVariableCostPerUser = 15; // Infrastructure and other variable costs
  const contributionMarginPerUser =
    config.pricePerUser - avgVariableCostPerUser;
  const fixedCostsPerMonth = Object.values(config.monthlyFixedCosts).reduce(
    (sum, cost) => sum + cost,
    0,
  );
  const requiredUsersForGoal = Math.ceil(
    (monthlyGoalRevenue + fixedCostsPerMonth) / config.pricePerUser,
  );

  // Current metrics
  const avgCurrentUsers =
    monthlyData.reduce((sum, month) => sum + month.users, 0) /
    monthlyData.length;
  const additionalUsersNeeded = Math.max(
    0,
    requiredUsersForGoal - avgCurrentUsers,
  );
  const progressPercentage = Math.min(
    (currentAnnualRevenue / TARGET_ANNUAL_REVENUE) * 100,
    100,
  );

  // Project future based on growth trends
  const lastThreeMonths = monthlyData.slice(-3);
  const avgRecentRevenue =
    lastThreeMonths.reduce((sum, month) => sum + month.revenue, 0) /
    lastThreeMonths.length;
  const projectedAnnualRevenue = avgRecentRevenue * 12;

  // Enhanced goal analysis with marketing considerations
  const marketingSpendNeeded =
    additionalUsersNeeded * marketingAnalytics.avgCac;
  const timeToGoalMonths =
    avgRecentRevenue > 0
      ? Math.ceil(
          (TARGET_ANNUAL_REVENUE - currentAnnualRevenue) / avgRecentRevenue,
        )
      : null;

  return {
    currentAnnualRevenue: Math.round(currentAnnualRevenue * 100) / 100,
    requiredAnnualRevenue: TARGET_ANNUAL_REVENUE,
    monthlyGoalRevenue: Math.round(monthlyGoalRevenue * 100) / 100,
    requiredUsersForGoal: Math.round(requiredUsersForGoal),
    additionalUsersNeeded: Math.round(additionalUsersNeeded),
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    projectedAnnualRevenue: Math.round(projectedAnnualRevenue * 100) / 100,
    monthsToReachGoal: timeToGoalMonths,
    marketingSpendNeeded: Math.round(marketingSpendNeeded * 100) / 100,
    estimatedCacForGoal: Math.round(marketingAnalytics.avgCac * 100) / 100,
  };
}

export function validateEnhancedFinancialData(
  data: Partial<FinancialData>,
): string[] {
  const errors: string[] = [];

  // Basic validations
  if (!data.startingCash && data.startingCash !== 0) {
    errors.push("Starting cash is required");
  }

  if (!data.pricePerUser || data.pricePerUser <= 0) {
    errors.push("Price per user must be greater than 0");
  }

  if (!data.churnRate && data.churnRate !== 0) {
    errors.push("Churn rate is required");
  } else if (data.churnRate < 0 || data.churnRate > 1) {
    errors.push("Churn rate must be between 0 and 1");
  }

  // Enhanced validations
  if (data.avgUsersPerClient && data.avgUsersPerClient <= 0) {
    errors.push("Average users per client must be greater than 0");
  }

  if (
    data.userGrowthRate &&
    (data.userGrowthRate < -1 || data.userGrowthRate > 5)
  ) {
    errors.push("User growth rate must be between -100% and 500%");
  }

  if (
    data.userChurnRate &&
    (data.userChurnRate < 0 || data.userChurnRate > 1)
  ) {
    errors.push("User churn rate must be between 0 and 1");
  }

  // Marketing metrics validation
  if (data.marketingMetrics) {
    const mm = data.marketingMetrics;
    if (mm.monthlyMarketingSpend && mm.monthlyMarketingSpend < 0) {
      errors.push("Monthly marketing spend cannot be negative");
    }
    if (mm.cac && mm.cac <= 0) {
      errors.push("CAC must be greater than 0");
    }
    if (mm.ltv && mm.ltv <= 0) {
      errors.push("LTV must be greater than 0");
    }
    if (mm.conversionRate && (mm.conversionRate < 0 || mm.conversionRate > 1)) {
      errors.push("Conversion rate must be between 0 and 1");
    }
  }

  if (!data.seasonalGrowth || data.seasonalGrowth.length !== 12) {
    errors.push("Seasonal growth must have 12 values");
  }

  if (!data.capitalPurchases || data.capitalPurchases.length !== 12) {
    errors.push("Capital purchases must have 12 values");
  }

  return errors;
}

export function calculateCustomScenarioProjections(
  baseConfig: FinancialData,
  customScenario: GrowthScenario,
): CalculationResults {
  // Create modified config with custom scenario parameters
  const modifiedConfig: FinancialData = {
    ...baseConfig,
    churnRate: customScenario.churnRate,
    userGrowthRate: customScenario.userGrowthRate || baseConfig.userGrowthRate,
    avgUsersPerClient:
      customScenario.usersPerTenant || baseConfig.avgUsersPerClient,
    marketingMetrics: {
      ...baseConfig.marketingMetrics,
      cac: customScenario.cac || baseConfig.marketingMetrics?.cac || 250,
      ltv: customScenario.ltv || baseConfig.marketingMetrics?.ltv || 1200,
      monthlyMarketingSpend:
        baseConfig.marketingMetrics?.monthlyMarketingSpend || 5000,
      ltvCacRatio: baseConfig.marketingMetrics?.ltvCacRatio || 5.0,
      paybackPeriodMonths:
        baseConfig.marketingMetrics?.paybackPeriodMonths || 8,
      organicGrowthRate: baseConfig.marketingMetrics?.organicGrowthRate || 0.15,
      paidGrowthRate: baseConfig.marketingMetrics?.paidGrowthRate || 0.35,
      brandAwarenessSpend:
        baseConfig.marketingMetrics?.brandAwarenessSpend || 1500,
      performanceMarketingSpend:
        baseConfig.marketingMetrics?.performanceMarketingSpend || 2500,
      contentMarketingSpend:
        baseConfig.marketingMetrics?.contentMarketingSpend || 800,
      affiliateMarketingSpend:
        baseConfig.marketingMetrics?.affiliateMarketingSpend || 200,
      conversionRate: baseConfig.marketingMetrics?.conversionRate || 0.08,
      leadQualityScore: baseConfig.marketingMetrics?.leadQualityScore || 75,
      marketingROI: baseConfig.marketingMetrics?.marketingROI || 3.2,
    } as MarketingMetrics,
  };

  // Use enhanced calculation engine
  return calculateEnhancedProjections(modifiedConfig);
}

export function runCalculationTests(config: FinancialData): {
  passed: boolean;
  results: any;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Test basic calculations
    const results = calculateEnhancedProjections(config);

    // Validation tests
    const validationErrors = validateEnhancedFinancialData(config);
    errors.push(...validationErrors);

    // Consistency tests
    if (results.totalRevenue < 0) {
      errors.push("Total revenue cannot be negative");
    }

    if (
      results.breakEvenMonth &&
      results.breakEvenMonth > config.projectionMonths
    ) {
      warnings.push("Break-even month exceeds projection period");
    }

    // LTV/CAC ratio validation
    const lastMonth = results.monthlyData[results.monthlyData.length - 1];
    if (lastMonth && lastMonth.ltv && lastMonth.cac) {
      const ltvCacRatio = lastMonth.ltv / lastMonth.cac;
      if (ltvCacRatio < 3) {
        warnings.push(
          `LTV/CAC ratio (${ltvCacRatio.toFixed(2)}) is below recommended 3:1 threshold`,
        );
      }
    }

    // Churn rate validation
    if (config.churnRate > 0.1) {
      warnings.push(
        "Monthly churn rate above 10% may indicate sustainability issues",
      );
    }

    // Growth consistency validation
    const growthRates = results.monthlyData
      .map((month, index) => {
        if (index === 0) return 0;
        const prevMonth = results.monthlyData[index - 1];
        return ((month.users - prevMonth.users) / prevMonth.users) * 100;
      })
      .filter((rate) => !isNaN(rate));

    const avgGrowthRate =
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    if (avgGrowthRate > 50) {
      warnings.push("Average monthly growth rate above 50% may be unrealistic");
    }

    return {
      passed: errors.length === 0,
      results,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      passed: false,
      results: null,
      errors: [`Calculation error: ${error}`],
      warnings,
    };
  }
}
