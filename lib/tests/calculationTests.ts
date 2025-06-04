import {
  calculateEnhancedProjections,
  calculateEnhancedHybridProjections,
  validateEnhancedFinancialData,
  runCalculationTests,
  calculateCustomScenarioProjections,
} from "../calculations/enhancedCalculations";
import {
  calculateMonthlyProjections,
  calculateRevenueGoalData,
  validateFinancialData,
} from "../calculations/calculations";
import { calculateHybridProjections } from "../calculations/hybridCalculations";
import {
  FinancialData,
  HybridPricingData,
  GrowthScenario,
  MarketingMetrics,
} from "@/types";

export interface TestResult {
  testName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  executionTime: number;
  result?: any;
}

export interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalExecutionTime: number;
}

// Test configurations
const BASE_CONFIG: FinancialData = {
  startingCash: 50000,
  startDate: "2025-01-01",
  pricePerUser: 299,
  churnRate: 0.05,
  monthlyFixedCosts: {
    infra: 2500,
    salary: 25000,
    support: 3000,
    wages: 5000,
    hosting: 1200,
    marketing: 4000,
  },
  capitalPurchases: [10000, 0, 0, 5000, 0, 0, 0, 0, 0, 0, 0, 0],
  seasonalGrowth: [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3],
  initialUsers: 25,
  projectionMonths: 12,
  avgUsersPerClient: 5,
  userGrowthRate: 0.08,
  userChurnRate: 0.03,
  marketingMetrics: {
    monthlyMarketingSpend: 4000,
    cac: 200,
    ltv: 1500,
    ltvCacRatio: 7.5,
    paybackPeriodMonths: 6,
    organicGrowthRate: 0.2,
    paidGrowthRate: 0.8,
    brandAwarenessSpend: 1200,
    performanceMarketingSpend: 2000,
    contentMarketingSpend: 600,
    affiliateMarketingSpend: 200,
    conversionRate: 0.12,
    leadQualityScore: 82,
    marketingROI: 4.2,
  }
};

const BASE_HYBRID_CONFIG: HybridPricingData = {
  startingCash: 75000,
  startDate: "2025-01-01",
  monthlyFixedCosts: {
    infra: 3000,
    salary: 30000,
    support: 4000,
    wages: 6000,
    hosting: 1500,
    marketing: 5000,
  },
  capitalPurchases: [15000, 0, 0, 8000, 0, 0, 0, 0, 0, 0, 0, 0],
  initialTenants: 15,
  selectedTier: "growth",
  customPricingTiers: [],
  avgUsersPerTenant: 12,
  avgAiUsagePerTenant: 2500,
  selectedAddons: ["advanced_analytics", "api_access"],
  growthScenario: "base",
  projectionMonths: 12,
  marketingMetrics: {
    monthlyMarketingSpend: 5000,
    cac: 350,
    ltv: 2800,
    ltvCacRatio: 8.0,
    paybackPeriodMonths: 5,
    organicGrowthRate: 0.15,
    paidGrowthRate: 0.85,
    brandAwarenessSpend: 1500,
    performanceMarketingSpend: 2500,
    contentMarketingSpend: 800,
    affiliateMarketingSpend: 200,
    conversionRate: 0.15,
    leadQualityScore: 88,
    marketingROI: 5.1,
  },
};

export function runAllCalculationTests(): TestSuite[] {
  const testSuites: TestSuite[] = [];

  // Basic calculation tests
  testSuites.push(runBasicCalculationTests());

  // Enhanced calculation tests
  testSuites.push(runEnhancedCalculationTests());

  // Hybrid calculation tests
  testSuites.push(runHybridCalculationTests());

  // Validation tests
  testSuites.push(runValidationTests());

  // Edge case tests
  testSuites.push(runEdgeCaseTests());

  // Performance tests
  testSuites.push(runPerformanceTests());

  // Marketing metrics tests
  testSuites.push(runMarketingMetricsTests());

  // Custom scenario tests
  testSuites.push(runCustomScenarioTests());

  // Consistency tests
  testSuites.push(runConsistencyTests());

  return testSuites;
}

function runBasicCalculationTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Basic monthly projections
  tests.push(
    runTest("Basic Monthly Projections", () => {
      const result = calculateMonthlyProjections(BASE_CONFIG);

      if (!result || !result.monthlyData || result.monthlyData.length !== 12) {
        throw new Error("Invalid monthly data structure");
      }

      if (result.totalRevenue <= 0) {
        throw new Error("Total revenue must be positive");
      }

      if (result.monthlyData[0].users !== BASE_CONFIG.initialUsers) {
        throw new Error("Initial users mismatch");
      }

      return result;
    }),
  );

  // Test 2: Revenue goal calculations
  tests.push(
    runTest("Revenue Goal Calculations", () => {
      const monthlyResult = calculateMonthlyProjections(BASE_CONFIG);
      const goalData = calculateRevenueGoalData(
        monthlyResult.monthlyData,
        BASE_CONFIG.pricePerUser,
        15, // avgVariableCostPerUser
        Object.values(BASE_CONFIG.monthlyFixedCosts).reduce(
          (sum, cost) => sum + cost,
          0,
        ),
      );

      if (!goalData || !goalData.currentAnnualRevenue) {
        throw new Error("Invalid revenue goal data");
      }

      if (goalData.requiredAnnualRevenue !== 1_000_000) {
        throw new Error("Required annual revenue should be $1M");
      }

      return goalData;
    }),
  );

  // Test 3: Break-even calculations
  tests.push(
    runTest("Break-even Analysis", () => {
      const result = calculateMonthlyProjections(BASE_CONFIG);

      if (!result.breakEvenData || result.breakEvenData.length !== 12) {
        throw new Error("Invalid break-even data structure");
      }

      // Check if break-even data is consistent
      for (let i = 0; i < result.breakEvenData.length; i++) {
        const breakEven = result.breakEvenData[i];
        if (breakEven.actualUsers < 0 || breakEven.requiredUsers < 0) {
          throw new Error(`Invalid user counts in month ${i + 1}`);
        }
      }

      return result.breakEvenData;
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Basic Calculations",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runEnhancedCalculationTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Enhanced projections with marketing metrics
  tests.push(
    runTest("Enhanced Projections with Marketing", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      if (!result || !result.monthlyData) {
        throw new Error("Invalid enhanced calculation result");
      }

      // Check for new metrics
      const firstMonth = result.monthlyData[0];
      if (
        !firstMonth.hasOwnProperty("arpu") ||
        !firstMonth.hasOwnProperty("cac") ||
        !firstMonth.hasOwnProperty("ltv")
      ) {
        throw new Error("Missing enhanced metrics (ARPU, CAC, LTV)");
      }

      // Validate ARPU calculation
      if (firstMonth.arpu && firstMonth.arpu <= 0) {
        throw new Error("ARPU must be positive");
      }

      // Validate LTV/CAC ratio
      if (
        firstMonth.ltv &&
        firstMonth.cac &&
        firstMonth.ltv / firstMonth.cac < 1
      ) {
        throw new Error("LTV/CAC ratio should be greater than 1");
      }

      return result;
    }),
  );

  // Test 2: User-level metrics
  tests.push(
    runTest("User-level Metrics", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      for (let i = 0; i < result.monthlyData.length; i++) {
        const month = result.monthlyData[i];

        if (month.totalUsers !== undefined && month.totalUsers <= 0) {
          throw new Error(`Invalid total users in month ${i + 1}`);
        }

        if (
          month.retentionRate &&
          (month.retentionRate < 0 || month.retentionRate > 100)
        ) {
          throw new Error(`Invalid retention rate in month ${i + 1}`);
        }
      }

      return result;
    }),
  );

  // Test 3: Marketing spend validation
  tests.push(
    runTest("Marketing Spend Tracking", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      const totalMarketingSpend = result.monthlyData.reduce(
        (sum, month) => sum + (month.marketingSpend || 0),
        0,
      );

      const expectedMarketingSpend =
        (BASE_CONFIG.marketingMetrics?.monthlyMarketingSpend || 0) * 12;

      if (Math.abs(totalMarketingSpend - expectedMarketingSpend) > 1) {
        throw new Error("Marketing spend calculation mismatch");
      }

      return { totalMarketingSpend, expectedMarketingSpend };
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Enhanced Calculations",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runHybridCalculationTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Hybrid projections
  tests.push(
    runTest("Hybrid Pricing Projections", () => {
      const result = calculateHybridProjections(BASE_HYBRID_CONFIG);

      if (!result || !result.monthlyData) {
        throw new Error("Invalid hybrid calculation result");
      }

      // Check revenue composition
      if (
        !result.revenueComposition ||
        typeof result.revenueComposition.base !== "number" ||
        typeof result.revenueComposition.users !== "number" ||
        typeof result.revenueComposition.ai !== "number" ||
        typeof result.revenueComposition.addons !== "number"
      ) {
        throw new Error("Invalid revenue composition structure");
      }

      // Revenue composition should add up to approximately 100%
      const totalComposition = Object.values(result.revenueComposition).reduce(
        (sum, val) => sum + val,
        0,
      );
      if (Math.abs(totalComposition - 100) > 1) {
        throw new Error("Revenue composition doesn't add up to 100%");
      }

      return result;
    }),
  );

  // Test 2: Enhanced hybrid projections
  tests.push(
    runTest("Enhanced Hybrid Projections", () => {
      const result = calculateEnhancedHybridProjections(BASE_HYBRID_CONFIG);

      if (!result || !result.monthlyData) {
        throw new Error("Invalid enhanced hybrid calculation result");
      }

      // Check for marketing metrics in results
      if (!result.marketingMetrics) {
        throw new Error("Missing marketing metrics in hybrid results");
      }

      // Validate tenant and user counts
      for (let i = 0; i < result.monthlyData.length; i++) {
        const month = result.monthlyData[i];

        if (month.tenants < 0 || month.totalUsers < 0) {
          throw new Error(`Negative tenant or user count in month ${i + 1}`);
        }

        if (month.totalUsers < month.tenants) {
          throw new Error(
            `Users per tenant calculation error in month ${i + 1}`,
          );
        }
      }

      return result;
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Hybrid Calculations",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runValidationTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Basic validation
  tests.push(
    runTest("Basic Data Validation", () => {
      const errors = validateFinancialData(BASE_CONFIG);

      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(", ")}`);
      }

      return { errors };
    }),
  );

  // Test 2: Enhanced validation
  tests.push(
    runTest("Enhanced Data Validation", () => {
      const errors = validateEnhancedFinancialData(BASE_CONFIG);

      if (errors.length > 0) {
        throw new Error(`Enhanced validation errors: ${errors.join(", ")}`);
      }

      return { errors };
    }),
  );

  // Test 3: Invalid data validation
  tests.push(
    runTest("Invalid Data Rejection", () => {
      const invalidConfig = {
        ...BASE_CONFIG,
        pricePerUser: -100, // Invalid negative price
        churnRate: 1.5, // Invalid churn rate > 1
      };

      const errors = validateEnhancedFinancialData(invalidConfig);

      if (errors.length === 0) {
        throw new Error("Should have detected validation errors");
      }

      return { errors };
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Validation Tests",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runEdgeCaseTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Zero initial Users
  tests.push(
    runTest("Zero Initial Users", () => {
      const config = { ...BASE_CONFIG, initialUsers: 0 };
      const result = calculateEnhancedProjections(config);

      if (!result || result.monthlyData[0].users !== 0) {
        throw new Error("Should handle zero initial users");
      }

      return result;
    }),
  );

  // Test 2: Very high churn rate
  tests.push(
    runTest("High Churn Rate (50%)", () => {
      const config = { ...BASE_CONFIG, churnRate: 0.5 };
      const result = calculateEnhancedProjections(config);

      if (!result) {
        throw new Error("Should handle high churn rates");
      }

      // Check that users don't go negative
      for (let month of result.monthlyData) {
        if (month.users < 0) {
          throw new Error("User count went negative with high churn");
        }
      }

      return result;
    }),
  );

  // Test 3: Extended projection period
  tests.push(
    runTest("Extended Projection (60 months)", () => {
      const config = { ...BASE_CONFIG, projectionMonths: 60 };
      const result = calculateEnhancedProjections(config);

      if (!result || result.monthlyData.length !== 60) {
        throw new Error("Should handle extended projections");
      }

      return result;
    }),
  );

  // Test 4: Negative starting cash
  tests.push(
    runTest("Negative Starting Cash", () => {
      const config = { ...BASE_CONFIG, startingCash: -10000 };
      const result = calculateEnhancedProjections(config);

      if (!result) {
        throw new Error("Should handle negative starting cash");
      }

      return result;
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Edge Case Tests",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runPerformanceTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Large projection performance
  tests.push(
    runTest("Large Projection Performance (120 months)", () => {
      const config = { ...BASE_CONFIG, projectionMonths: 120 };
      const start = Date.now();
      const result = calculateEnhancedProjections(config);
      const executionTime = Date.now() - start;

      if (executionTime > 5000) {
        // 5 seconds threshold
        throw new Error(`Performance issue: took ${executionTime}ms`);
      }

      return { executionTime, monthsCalculated: result.monthlyData.length };
    }),
  );

  // Test 2: Multiple scenario calculations
  tests.push(
    runTest("Multiple Scenario Performance", () => {
      const scenarios = ["conservative", "base", "aggressive"];
      const start = Date.now();

      const results = scenarios.map((scenario) => {
        const customScenario: GrowthScenario = {
          name: scenario,
          description: `${scenario} scenario`,
          tenants: 50,
          usersPerTenant: 10,
          aiUsagePerTenant: 100,
          tenantGrowthRate:
            scenario === "aggressive"
              ? 0.2
              : scenario === "conservative"
                ? 0.05
                : 0.1,
          userGrowthRate: 0.05,
          aiGrowthRate: 0.08,
          churnRate:
            scenario === "aggressive"
              ? 0.02
              : scenario === "conservative"
                ? 0.08
                : 0.05,
        };

        return calculateCustomScenarioProjections(BASE_CONFIG, customScenario);
      });

      const executionTime = Date.now() - start;

      if (executionTime > 3000) {
        // 3 seconds threshold
        throw new Error(
          `Performance issue with multiple scenarios: took ${executionTime}ms`,
        );
      }

      return { executionTime, scenariosCalculated: results.length };
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Performance Tests",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runMarketingMetricsTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: CAC calculation accuracy
  tests.push(
    runTest("CAC Calculation Accuracy", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      const totalMarketingSpend = result.monthlyData.reduce(
        (sum, month) => sum + (month.marketingSpend || 0),
        0,
      );
      const totalNewUsers = result.monthlyData.reduce(
        (sum, month) => sum + month.newUsers,
        0,
      );

      const calculatedCAC =
        totalNewUsers > 0 ? totalMarketingSpend / totalNewUsers : 0;

      // CAC should be reasonable (between $50 and $1000)
      if (calculatedCAC < 50 || calculatedCAC > 1000) {
        throw new Error(`CAC seems unrealistic: $${calculatedCAC.toFixed(2)}`);
      }

      return { calculatedCAC, totalMarketingSpend, totalNewUsers };
    }),
  );

  // Test 2: LTV calculation validation
  tests.push(
    runTest("LTV Calculation Validation", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      for (let i = 0; i < result.monthlyData.length; i++) {
        const month = result.monthlyData[i];

        if (month.ltv && month.ltv < 0) {
          throw new Error(`Negative LTV in month ${i + 1}`);
        }

        // LTV should generally be higher than ARPU
        if (month.ltv && month.arpu && month.ltv < month.arpu) {
          throw new Error(`LTV should be higher than ARPU in month ${i + 1}`);
        }
      }

      return result;
    }),
  );

  // Test 3: Payback period validation
  tests.push(
    runTest("Payback Period Validation", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      for (let i = 0; i < result.monthlyData.length; i++) {
        const month = result.monthlyData[i];

        if (month.timeToPayback && month.timeToPayback < 0) {
          throw new Error(`Negative payback period in month ${i + 1}`);
        }

        // Payback period should be reasonable (less than 24 months)
        if (month.timeToPayback && month.timeToPayback > 24) {
          throw new Error(
            `Unrealistic payback period in month ${i + 1}: ${month.timeToPayback} months`,
          );
        }
      }

      return result;
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Marketing Metrics Tests",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runCustomScenarioTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Custom growth scenario
  tests.push(
    runTest("Custom Growth Scenario", () => {
      const customScenario: GrowthScenario = {
        name: "Test Scenario",
        description: "Testing custom scenario",
        tenants: 100,
        usersPerTenant: 15,
        aiUsagePerTenant: 200,
        tenantGrowthRate: 0.15,
        userGrowthRate: 0.08,
        aiGrowthRate: 0.12,
        churnRate: 0.03,
        cac: 300,
        ltv: 2000,
        nrr: 115,
      };

      const result = calculateCustomScenarioProjections(
        BASE_CONFIG,
        customScenario,
      );

      if (!result || !result.monthlyData) {
        throw new Error("Custom scenario calculation failed");
      }

      // Verify that custom scenario parameters are applied
      const lastMonth = result.monthlyData[result.monthlyData.length - 1];
      if (
        lastMonth.cac &&
        customScenario.cac &&
        Math.abs(lastMonth.cac - customScenario.cac) > 50
      ) {
        throw new Error("Custom CAC not properly applied");
      }

      return result;
    }),
  );

  // Test 2: Scenario comparison
  tests.push(
    runTest("Scenario Comparison", () => {
      const conservativeScenario: GrowthScenario = {
        name: "Conservative",
        description: "Conservative growth",
        tenants: 50,
        usersPerTenant: 8,
        aiUsagePerTenant: 100,
        tenantGrowthRate: 0.05,
        userGrowthRate: 0.03,
        aiGrowthRate: 0.05,
        churnRate: 0.08,
      };

      const aggressiveScenario: GrowthScenario = {
        name: "Aggressive",
        description: "Aggressive growth",
        tenants: 200,
        usersPerTenant: 25,
        aiUsagePerTenant: 500,
        tenantGrowthRate: 0.25,
        userGrowthRate: 0.12,
        aiGrowthRate: 0.2,
        churnRate: 0.02,
      };

      const conservativeResult = calculateCustomScenarioProjections(
        BASE_CONFIG,
        conservativeScenario,
      );
      const aggressiveResult = calculateCustomScenarioProjections(
        BASE_CONFIG,
        aggressiveScenario,
      );

      // Aggressive scenario should generate more revenue
      if (aggressiveResult.totalRevenue <= conservativeResult.totalRevenue) {
        throw new Error(
          "Aggressive scenario should generate more revenue than conservative",
        );
      }

      return {
        conservativeRevenue: conservativeResult.totalRevenue,
        aggressiveRevenue: aggressiveResult.totalRevenue,
      };
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Custom Scenario Tests",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runConsistencyTests(): TestSuite {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Revenue calculation consistency
  tests.push(
    runTest("Revenue Calculation Consistency", () => {
      const basicResult = calculateMonthlyProjections(BASE_CONFIG);
      const enhancedResult = calculateEnhancedProjections(BASE_CONFIG);

      // Compare total revenue (should be similar within 5%)
      const revenueDifference = Math.abs(
        basicResult.totalRevenue - enhancedResult.totalRevenue,
      );
      const revenueThreshold =
        Math.max(basicResult.totalRevenue, enhancedResult.totalRevenue) * 0.05;

      if (revenueDifference > revenueThreshold) {
        throw new Error(
          `Revenue calculation inconsistency: ${revenueDifference} vs threshold ${revenueThreshold}`,
        );
      }

      return {
        basicRevenue: basicResult.totalRevenue,
        enhancedRevenue: enhancedResult.totalRevenue,
        difference: revenueDifference,
      };
    }),
  );

  // Test 2: User count progression consistency
  tests.push(
    runTest("User Count Progression", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      for (let i = 1; i < result.monthlyData.length; i++) {
        const prevMonth = result.monthlyData[i - 1];
        const currentMonth = result.monthlyData[i];

        // User count change should match new Users minus churned Users
        const expectedChange =
          currentMonth.newUsers - currentMonth.churnedUsers;
        const actualChange = currentMonth.users - prevMonth.users;

        if (Math.abs(expectedChange - actualChange) > 1) {
          // Allow for rounding
          throw new Error(`User count inconsistency in month ${i + 1}`);
        }
      }

      return result;
    }),
  );

  // Test 3: Cash flow consistency
  tests.push(
    runTest("Cash Flow Consistency", () => {
      const result = calculateEnhancedProjections(BASE_CONFIG);

      let expectedCash = BASE_CONFIG.startingCash;

      for (let month of result.monthlyData) {
        expectedCash += month.profit;

        if (Math.abs(expectedCash - month.cashOnHand) > 0.01) {
          // Allow for rounding
          throw new Error(
            `Cash flow inconsistency: expected ${expectedCash}, got ${month.cashOnHand}`,
          );
        }
      }

      return result;
    }),
  );

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = tests.filter((t) => t.passed).length;

  return {
    suiteName: "Consistency Tests",
    tests,
    totalTests: tests.length,
    passedTests,
    failedTests: tests.length - passedTests,
    totalExecutionTime,
  };
}

function runTest(testName: string, testFunction: () => any): TestResult {
  const startTime = Date.now();

  try {
    const result = testFunction();
    const executionTime = Date.now() - startTime;

    return {
      testName,
      passed: true,
      errors: [],
      warnings: [],
      executionTime,
      result,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    return {
      testName,
      passed: false,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
      executionTime,
    };
  }
}

export function generateTestReport(testSuites: TestSuite[]): string {
  const totalTests = testSuites.reduce(
    (sum, suite) => sum + suite.totalTests,
    0,
  );
  const totalPassed = testSuites.reduce(
    (sum, suite) => sum + suite.passedTests,
    0,
  );
  const totalFailed = testSuites.reduce(
    (sum, suite) => sum + suite.failedTests,
    0,
  );
  const totalTime = testSuites.reduce(
    (sum, suite) => sum + suite.totalExecutionTime,
    0,
  );

  let report = `# Calculation Test Report\n\n`;
  report += `**Overall Results:**\n`;
  report += `- Total Tests: ${totalTests}\n`;
  report += `- Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)\n`;
  report += `- Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)\n`;
  report += `- Total Execution Time: ${totalTime}ms\n\n`;

  testSuites.forEach((suite) => {
    report += `## ${suite.suiteName}\n`;
    report += `- Tests: ${suite.totalTests}\n`;
    report += `- Passed: ${suite.passedTests}\n`;
    report += `- Failed: ${suite.failedTests}\n`;
    report += `- Execution Time: ${suite.totalExecutionTime}ms\n\n`;

    if (suite.failedTests > 0) {
      report += `### Failed Tests:\n`;
      suite.tests
        .filter((t) => !t.passed)
        .forEach((test) => {
          report += `- **${test.testName}**: ${test.errors.join(", ")}\n`;
        });
      report += `\n`;
    }

    if (suite.tests.some((t) => t.warnings.length > 0)) {
      report += `### Warnings:\n`;
      suite.tests.forEach((test) => {
        test.warnings.forEach((warning) => {
          report += `- **${test.testName}**: ${warning}\n`;
        });
      });
      report += `\n`;
    }
  });

  return report;
}

// Utility function to run comprehensive system tests
export function runComprehensiveTests(): {
  report: string;
  passed: boolean;
  testSuites: TestSuite[];
} {
  const testSuites = runAllCalculationTests();
  const report = generateTestReport(testSuites);
  const passed = testSuites.every((suite) => suite.failedTests === 0);

  return {
    report,
    passed,
    testSuites,
  };
}
