import {
  FinancialData,
  MonthlyData,
  CalculationResults,
  ChartDataPoint,
  BreakEvenData,
  RevenueGoalData,
} from "@/types";
import { format, addMonths, parseISO } from "date-fns";

export function calculateMonthlyProjections(
  config: FinancialData,
): CalculationResults {
  const monthlyData: MonthlyData[] = [];
  const breakEvenData: BreakEvenData[] = [];
  let currentUsers = config.initialUsers;
  let currentCash = config.startingCash;

  const startDate = parseISO(config.startDate);
  const projectionMonths = config.projectionMonths || 12;

  // Calculate total fixed costs per month including marketing
  const fixedCostsPerMonth =
    config.monthlyFixedCosts.infra +
    config.monthlyFixedCosts.salary +
    config.monthlyFixedCosts.support +
    config.monthlyFixedCosts.wages +
    config.monthlyFixedCosts.hosting +
    (config.monthlyFixedCosts.marketing || 0);

  // Average variable cost per user (infrastructure and other variable costs)
  const avgVariableCostPerUser = 5; // Infrastructure and other variable costs

  // Calculate add-on revenue per month
  function calculateAddonRevenue(userCount: number): number {
    if (!config.enabledAddons || config.enabledAddons.length === 0) return 0;

    // Simplified add-on calculation - in real implementation, this would use the actual add-on data
    const baseAddonRevenue = config.enabledAddons.length * 50; // Average $50 per enabled add-on
    const userBasedAddonRevenue = userCount * config.enabledAddons.length * 5; // $5 per user per add-on
    return baseAddonRevenue + userBasedAddonRevenue;
  }

  // Extend growth patterns for longer projections
  const extendedGrowthPattern = (month: number): number => {
    if (month < config.seasonalGrowth.length) {
      return config.seasonalGrowth[month];
    }
    // Repeat the seasonal pattern for extended projections
    const patternIndex = month % config.seasonalGrowth.length;
    return config.seasonalGrowth[patternIndex];
  };

  // Extend capital purchases array for longer projections
  const extendedCapitalPurchases = (month: number): number => {
    if (month < config.capitalPurchases.length) {
      return config.capitalPurchases[month] || 0;
    }
    return 0; // No capital purchases beyond the initial array
  };

  for (let month = 0; month < projectionMonths; month++) {
    const currentDate = addMonths(startDate, month);
    const monthName = format(currentDate, "MMM yyyy");

    // Calculate user changes
    const churnedUsers = Math.round(currentUsers * config.churnRate);
    const newUsers = extendedGrowthPattern(month);
    const endingUsers = Math.max(0, currentUsers - churnedUsers + newUsers);

    // Calculate revenue (using average users for the month)
    const avgUsers = (currentUsers + endingUsers) / 2;
    const baseRevenue = avgUsers * config.pricePerUser;
    const addonRevenue = calculateAddonRevenue(avgUsers);
    const revenue = baseRevenue + addonRevenue;

    // Calculate costs
    const fixedCosts = fixedCostsPerMonth;

    const variableCosts = avgUsers * avgVariableCostPerUser;
    const capitalPurchase = extendedCapitalPurchases(month);
    const marketingSpend = config.marketingMetrics?.monthlyMarketingSpend || 0;
    const totalExpenses =
      fixedCosts + variableCosts + capitalPurchase + marketingSpend;

    // Calculate profit and cash
    const profit = revenue - totalExpenses;
    currentCash += profit;

    monthlyData.push({
      month: month + 1,
      date: monthName,
      users: Math.round(endingUsers),
      newUsers,
      churnedUsers,
      revenue: Math.round(revenue * 100) / 100,
      fixedCosts: Math.round(fixedCosts * 100) / 100,
      variableCosts: Math.round(variableCosts * 100) / 100,
      capitalPurchase,
      marketingSpend: Math.round(marketingSpend * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      cashOnHand: Math.round(currentCash * 100) / 100,
    });

    // Calculate break-even data for this month
    const requiredRevenueToBreakEven =
      fixedCosts + capitalPurchase + marketingSpend;
    const requiredUsers = Math.ceil(
      requiredRevenueToBreakEven /
        (config.pricePerUser - avgVariableCostPerUser),
    );
    const breakEvenRevenue = requiredUsers * config.pricePerUser;
    const isBreakEven = profit >= 0;
    const percentToBreakEven = Math.min(
      (revenue / breakEvenRevenue) * 100,
      100,
    );

    breakEvenData.push({
      month: month + 1,
      actualUsers: Math.round(endingUsers),
      requiredUsers: Math.max(0, requiredUsers),
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      actualRevenue: Math.round(revenue * 100) / 100,
      isBreakEven,
      percentToBreakEven: Math.round(percentToBreakEven * 100) / 100,
    });

    currentUsers = endingUsers;
  }

  // Calculate summary metrics
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

  // Find break-even month (first month with positive cumulative profit)
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

  // Calculate $1M Revenue Goal Data
  const revenueGoalData = calculateRevenueGoalData(
    monthlyData,
    config.pricePerUser,
    avgVariableCostPerUser,
    fixedCostsPerMonth,
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

export function generateChartData(
  monthlyData: MonthlyData[],
): ChartDataPoint[] {
  return monthlyData.map((month) => ({
    month: month.date,
    revenue: month.revenue,
    expenses: month.totalExpenses,
    profit: month.profit,
    cash: month.cashOnHand,
    users: month.users,
  }));
}

export function exportToCSV(
  config: FinancialData,
  results: CalculationResults,
): string {
  const headers = [
    "Month",
    "Date",
    "Users",
    "New Users",
    "Churned Users",
    "Revenue ($)",
    "Fixed Costs ($)",
    "Variable Costs ($)",
    "Marketing Spend ($)",
    "Capital Purchase ($)",
    "Total Expenses ($)",
    "Profit ($)",
    "Cash on Hand ($)",
    "Break-Even Users",
    "Break-Even Revenue ($)",
    "Break-Even Achieved",
    "Progress to Break-Even (%)",
  ];

  const rows = results.monthlyData.map((month, index) => {
    const breakEvenData = results.breakEvenData[index];
    return [
      month.month,
      month.date,
      month.users,
      month.newUsers,
      month.churnedUsers,
      month.revenue,
      month.fixedCosts,
      month.variableCosts,
      month.marketingSpend || 0,
      month.capitalPurchase,
      month.totalExpenses,
      month.profit,
      month.cashOnHand,
      breakEvenData?.requiredUsers || 0,
      breakEvenData?.breakEvenRevenue || 0,
      breakEvenData?.isBreakEven ? "Yes" : "No",
      breakEvenData?.percentToBreakEven || 0,
    ];
  });

  // Add summary rows
  const summaryRows = [
    [],
    ["SUMMARY"],
    ["Total Revenue", "", "", "", "", results.totalRevenue],
    ["Total Expenses", "", "", "", "", results.totalExpenses],
    ["Total Profit", "", "", "", "", results.totalProfit],
    ["Final Cash", "", "", "", "", results.finalCash],
    ["Break-even Month", "", "", "", "", results.breakEvenMonth || "N/A"],
    ["Max Users", "", "", "", "", results.maxUsers],
    ["Avg Monthly Profit", "", "", "", "", results.avgMonthlyProfit],
    [],
    ["$1M REVENUE GOAL ANALYSIS"],
    [
      "Current Annual Revenue",
      "",
      "",
      "",
      "",
      results.revenueGoalData.currentAnnualRevenue,
    ],
    [
      "Required Annual Revenue",
      "",
      "",
      "",
      "",
      results.revenueGoalData.requiredAnnualRevenue,
    ],
    [
      "Monthly Goal Revenue",
      "",
      "",
      "",
      "",
      results.revenueGoalData.monthlyGoalRevenue,
    ],
    [
      "Required Users for Goal",
      "",
      "",
      "",
      "",
      results.revenueGoalData.requiredUsersForGoal,
    ],
    [
      "Additional Users Needed",
      "",
      "",
      "",
      "",
      results.revenueGoalData.additionalUsersNeeded,
    ],
    [
      "Progress Percentage",
      "",
      "",
      "",
      "",
      results.revenueGoalData.progressPercentage + "%",
    ],
    [
      "Projected Annual Revenue",
      "",
      "",
      "",
      "",
      results.revenueGoalData.projectedAnnualRevenue,
    ],
    [
      "Months to Reach Goal",
      "",
      "",
      "",
      "",
      results.revenueGoalData.monthsToReachGoal || "N/A",
    ],
  ];

  const allRows = [headers, ...rows, ...summaryRows];

  return allRows
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell,
        )
        .join(","),
    )
    .join("\n");
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function calculateRevenueGoalData(
  monthlyData: MonthlyData[],
  pricePerUser: number,
  avgVariableCostPerUser: number,
  fixedCostsPerMonth: number,
): RevenueGoalData {
  const TARGET_ANNUAL_REVENUE = 1_000_000;
  const currentAnnualRevenue = monthlyData.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );
  const monthlyGoalRevenue = TARGET_ANNUAL_REVENUE / 12;

  // Calculate required users for $1M goal (considering variable costs and break-even)
  const contributionMarginPerUser =
    pricePerUser - (avgVariableCostPerUser || 5);
  const requiredUsersForGoal = Math.ceil(
    (monthlyGoalRevenue + fixedCostsPerMonth) / pricePerUser,
  );

  // Current average users
  const avgCurrentUsers =
    monthlyData.reduce((sum, month) => sum + month.users, 0) / 12;
  const additionalUsersNeeded = Math.max(
    0,
    requiredUsersForGoal - avgCurrentUsers,
  );

  const progressPercentage = Math.min(
    (currentAnnualRevenue / TARGET_ANNUAL_REVENUE) * 100,
    100,
  );

  // Project annual revenue based on current trajectory
  const lastThreeMonths = monthlyData.slice(-3);
  const avgRecentRevenue =
    lastThreeMonths.reduce((sum, month) => sum + month.revenue, 0) /
    lastThreeMonths.length;
  const projectedAnnualRevenue = avgRecentRevenue * 12;

  // Calculate months to reach goal based on current growth
  let monthsToReachGoal: number | null = null;
  if (projectedAnnualRevenue > currentAnnualRevenue) {
    const monthlyGrowthRate =
      (projectedAnnualRevenue - currentAnnualRevenue) /
      currentAnnualRevenue /
      12;
    if (monthlyGrowthRate > 0) {
      const remainingRevenue = TARGET_ANNUAL_REVENUE - currentAnnualRevenue;
      monthsToReachGoal = Math.ceil(
        Math.log(1 + remainingRevenue / currentAnnualRevenue) /
          Math.log(1 + monthlyGrowthRate),
      );
    }
  }

  return {
    currentAnnualRevenue: Math.round(currentAnnualRevenue * 100) / 100,
    requiredAnnualRevenue: TARGET_ANNUAL_REVENUE,
    monthlyGoalRevenue: Math.round(monthlyGoalRevenue * 100) / 100,
    requiredUsersForGoal: Math.round(requiredUsersForGoal),
    additionalUsersNeeded: Math.round(additionalUsersNeeded),
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    projectedAnnualRevenue: Math.round(projectedAnnualRevenue * 100) / 100,
    monthsToReachGoal,
  };
}

export function validateFinancialData(data: Partial<FinancialData>): string[] {
  const errors: string[] = [];

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

  if (!data.seasonalGrowth || data.seasonalGrowth.length !== 12) {
    errors.push("Seasonal growth must have 12 values");
  }

  if (!data.capitalPurchases || data.capitalPurchases.length !== 12) {
    errors.push("Capital purchases must have 12 values");
  }

  return errors;
}
