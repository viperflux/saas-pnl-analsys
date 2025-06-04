"use client";

import React, { useState } from "react";
import { runComprehensiveTests } from "@/lib/tests/calculationTests";
import { 
  calculateEnhancedProjections,
  runCalculationTests 
} from "@/lib/calculations/enhancedCalculations";
import { FinancialData } from "@/types";

export default function TestsPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>("all");

  const baseConfig: FinancialData = {
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

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      if (selectedTest === "all") {
        const results = runComprehensiveTests();
        setTestResults(results);
      } else if (selectedTest === "enhanced") {
        const results = runCalculationTests(baseConfig);
        setTestResults({
          report: generateQuickReport(results),
          passed: results.passed,
          testSuites: []
        });
      } else if (selectedTest === "quick") {
        const calculation = calculateEnhancedProjections(baseConfig);
        const quickTests = {
          "Revenue Calculation": calculation.totalRevenue > 0,
          "Monthly Data": calculation.monthlyData.length === 12,
          "Break-even Analysis": calculation.breakEvenMonth !== null,
          "Marketing Metrics": calculation.monthlyData[0].marketingSpend !== undefined,
          "User Metrics": calculation.monthlyData[0].totalUsers !== undefined,
          "CAC/LTV Metrics": calculation.monthlyData[0].cac !== undefined && calculation.monthlyData[0].ltv !== undefined,
          "No AI Costs": calculation.monthlyData.every(m => !m.hasOwnProperty('aiCosts')),
          "Marketing Included": calculation.monthlyData.every(m => m.totalExpenses > m.fixedCosts + m.variableCosts)
        };
        
        const passed = Object.values(quickTests).every(test => test === true);
        setTestResults({
          report: generateQuickTestReport(quickTests),
          passed,
          testSuites: []
        });
      }
    } catch (error) {
      setTestResults({
        report: `Error running tests: ${error}`,
        passed: false,
        testSuites: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const generateQuickReport = (results: any) => {
    return `# Enhanced Calculation Test Results

**Status:** ${results.passed ? "✅ PASSED" : "❌ FAILED"}
**Errors:** ${results.errors.length}
**Warnings:** ${results.warnings.length}

## Results Summary
- Total Revenue: $${results.results?.totalRevenue?.toLocaleString() || "N/A"}
- Break-even Month: ${results.results?.breakEvenMonth || "N/A"}
- Final Cash: $${results.results?.finalCash?.toLocaleString() || "N/A"}

## Issues Found
${results.errors.map((error: string) => `- ❌ ${error}`).join('\n')}
${results.warnings.map((warning: string) => `- ⚠️ ${warning}`).join('\n')}
`;
  };

  const generateQuickTestReport = (tests: Record<string, boolean>) => {
    const passedCount = Object.values(tests).filter(Boolean).length;
    const totalCount = Object.keys(tests).length;
    
    return `# Quick Test Results

**Status:** ${passedCount === totalCount ? "✅ ALL PASSED" : `❌ ${totalCount - passedCount} FAILED`}
**Passed:** ${passedCount}/${totalCount}

## Test Results
${Object.entries(tests).map(([test, passed]) => 
  `- ${passed ? "✅" : "❌"} ${test}`
).join('\n')}
`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Calculation Test Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all calculations with marketing costs, validate user metrics, and ensure system consistency
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Test Controls
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Suite
                  </label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isRunning}
                  >
                    <option value="quick">Quick Tests (Fast)</option>
                    <option value="enhanced">Enhanced Tests (Medium)</option>
                    <option value="all">Comprehensive Tests (Slow)</option>
                  </select>
                </div>

                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className={`w-full py-3 px-4 rounded-md font-medium ${
                    isRunning
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors`}
                >
                  {isRunning ? "Running Tests..." : "Run Tests"}
                </button>

                {isRunning && (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Testing calculations...
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Test Descriptions
                </h3>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>Quick Tests:</strong> Basic functionality, marketing cost inclusion, and user terminology validation
                  </div>
                  <div>
                    <strong>Enhanced Tests:</strong> Marketing metrics, user-level analytics, CAC/LTV calculations, and data validation
                  </div>
                  <div>
                    <strong>Comprehensive Tests:</strong> Full test suite including edge cases, performance, marketing consistency, and user metric validation
                  </div>
                </div>
              </div>
            </div>

            {/* Test Status */}
            {testResults && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Test Status
                </h2>
                
                <div className={`text-center p-4 rounded-lg ${
                  testResults.passed 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                }`}>
                  <div className="text-2xl mb-2">
                    {testResults.passed ? "✅" : "❌"}
                  </div>
                  <div className="font-medium">
                    {testResults.passed ? "All Tests Passed" : "Tests Failed"}
                  </div>
                </div>

                {testResults.testSuites && testResults.testSuites.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {testResults.testSuites.map((suite: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{suite.suiteName}</span>
                        <span className={`font-medium ${
                          suite.failedTests === 0 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {suite.passedTests}/{suite.totalTests}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test Results
                </h2>
              </div>
              
              <div className="p-6">
                {!testResults ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                      🧪
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a test suite and click "Run Tests" to begin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                        {testResults.report}
                      </pre>
                    </div>
                    
                    {testResults.testSuites && testResults.testSuites.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">
                          Detailed Results
                        </h3>
                        {testResults.testSuites.map((suite: any, suiteIndex: number) => (
                          <div key={suiteIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {suite.suiteName}
                                </h4>
                                <span className={`text-sm px-2 py-1 rounded ${
                                  suite.failedTests === 0 
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                    : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                }`}>
                                  {suite.passedTests}/{suite.totalTests} passed
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Execution time: {suite.totalExecutionTime}ms
                              </div>
                            </div>
                            
                            {suite.tests.filter((test: any) => !test.passed).length > 0 && (
                              <div className="p-4">
                                <h5 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                                  Failed Tests:
                                </h5>
                                <div className="space-y-1">
                                  {suite.tests.filter((test: any) => !test.passed).map((test: any, testIndex: number) => (
                                    <div key={testIndex} className="text-sm">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {test.testName}:
                                      </span>
                                      <span className="text-red-600 dark:text-red-400 ml-2">
                                        {test.errors.join(', ')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}