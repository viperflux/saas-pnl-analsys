import { NextRequest, NextResponse } from "next/server";
import { runComprehensiveTests } from "@/lib/tests/calculationTests";
import { 
  calculateEnhancedProjections,
  runCalculationTests,
  calculateCustomScenarioProjections
} from "@/lib/calculations/enhancedCalculations";
import { FinancialData, GrowthScenario } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, config, customScenario } = body;

    switch (testType) {
      case "comprehensive":
        const comprehensiveResults = runComprehensiveTests();
        return NextResponse.json(comprehensiveResults);

      case "enhanced":
        if (!config) {
          return NextResponse.json(
            { error: "Configuration required for enhanced tests" },
            { status: 400 }
          );
        }
        const enhancedResults = runCalculationTests(config as FinancialData);
        return NextResponse.json(enhancedResults);

      case "custom-scenario":
        if (!config || !customScenario) {
          return NextResponse.json(
            { error: "Configuration and custom scenario required" },
            { status: 400 }
          );
        }
        const scenarioResults = calculateCustomScenarioProjections(
          config as FinancialData,
          customScenario as GrowthScenario
        );
        return NextResponse.json(scenarioResults);

      case "quick":
        if (!config) {
          return NextResponse.json(
            { error: "Configuration required for quick test" },
            { status: 400 }
          );
        }
        const calculation = calculateEnhancedProjections(config as FinancialData);
        const quickTests = {
          "Revenue Calculation": calculation.totalRevenue > 0,
          "Monthly Data": calculation.monthlyData.length === (config.projectionMonths || 12),
          "Break-even Analysis": calculation.breakEvenMonth !== null,
          "Marketing Metrics": calculation.monthlyData[0].marketingSpend !== undefined,
          "User Metrics": calculation.monthlyData[0].totalUsers !== undefined,
          "CAC/LTV Metrics": calculation.monthlyData[0].cac !== undefined && calculation.monthlyData[0].ltv !== undefined,
          "No AI Costs": !calculation.monthlyData[0].hasOwnProperty('aiCosts'),
          "Marketing Costs Included": calculation.monthlyData[0].totalExpenses > calculation.monthlyData[0].fixedCosts + calculation.monthlyData[0].variableCosts
        };
        
        const passed = Object.values(quickTests).every(test => test === true);
        return NextResponse.json({
          passed,
          tests: quickTests,
          calculation
        });

      default:
        return NextResponse.json(
          { error: "Invalid test type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error running calculation tests:", error);
    return NextResponse.json(
      { error: "Failed to run tests", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("type") || "quick";

    // Default test configuration
    const defaultConfig: FinancialData = {
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
        marketing: 4000
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

    switch (testType) {
      case "comprehensive":
        const comprehensiveResults = runComprehensiveTests();
        return NextResponse.json(comprehensiveResults);

      case "enhanced":
        const enhancedResults = runCalculationTests(defaultConfig);
        return NextResponse.json(enhancedResults);

      case "quick":
      default:
        const calculation = calculateEnhancedProjections(defaultConfig);
        const quickTests = {
          "Revenue Calculation": calculation.totalRevenue > 0,
          "Monthly Data": calculation.monthlyData.length === 12,
          "Break-even Analysis": calculation.breakEvenMonth !== null,
          "Marketing Metrics": calculation.monthlyData[0].marketingSpend !== undefined,
          "User Metrics": calculation.monthlyData[0].totalUsers !== undefined,
          "CAC/LTV Metrics": calculation.monthlyData[0].cac !== undefined && calculation.monthlyData[0].ltv !== undefined,
          "No AI Costs": !calculation.monthlyData[0].hasOwnProperty('aiCosts'),
          "Marketing Costs Included": calculation.monthlyData[0].totalExpenses > calculation.monthlyData[0].fixedCosts + calculation.monthlyData[0].variableCosts
        };
        
        const passed = Object.values(quickTests).every(test => test === true);
        return NextResponse.json({
          passed,
          tests: quickTests,
          summary: {
            totalRevenue: calculation.totalRevenue,
            breakEvenMonth: calculation.breakEvenMonth,
            finalCash: calculation.finalCash,
            avgCAC: calculation.monthlyData.reduce((sum, m) => sum + (m.cac || 0), 0) / calculation.monthlyData.length,
            avgLTV: calculation.monthlyData.reduce((sum, m) => sum + (m.ltv || 0), 0) / calculation.monthlyData.length,
          }
        });
    }
  } catch (error) {
    console.error("Error running calculation tests:", error);
    return NextResponse.json(
      { error: "Failed to run tests", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}