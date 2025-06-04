"use client";

import React, { useState, useEffect } from "react";
import EnhancedInputForm from "@/components/forms/EnhancedInputForm";
import CashFlowTable from "@/components/charts/CashFlowTable";
import PnLReport from "@/components/charts/PnLReport";
import ChartsDashboard from "@/components/charts/ChartsDashboard";
import DownloadButton from "@/components/ui/DownloadButton";
import BreakEvenAnalysis from "@/components/charts/BreakEvenAnalysis";
import RevenueGoalTracker from "@/components/charts/RevenueGoalTracker";
import InteractiveControls from "@/components/forms/InteractiveControls";
import PredictionSections from "@/components/dashboard/PredictionSections";
import HybridPricingConfigurator from "@/components/management/HybridPricingConfigurator";
import HybridDashboard from "@/components/dashboard/HybridDashboard";
import HybridPricingTable from "@/components/dashboard/HybridPricingTable";
import {
  FinancialData,
  CalculationResults,
  HybridPricingData,
  HybridCalculationResults,
} from "@/types";
import {
  calculateMonthlyProjections,
  generateChartData,
} from "@/lib/calculations/calculations";
import {
  calculateEnhancedProjections,
  calculateEnhancedHybridProjections,
  runCalculationTests,
} from "@/lib/calculations/enhancedCalculations";
import {
  calculateHybridProjections,
  generateHybridChartData,
} from "@/lib/calculations/hybridCalculations";
import { DEFAULT_CONFIG } from "@/lib/utils/config";
import { DEFAULT_HYBRID_CONFIG } from "@/lib/utils/hybridConfig";
import Header from "@/components/ui/Header";

export default function HomePage() {
  const [config, setConfig] = useState<FinancialData>({
    ...DEFAULT_CONFIG,
    pricePerUser: DEFAULT_CONFIG.pricePerUser || 49,
    initialUsers: DEFAULT_CONFIG.initialUsers || 5,
    monthlyFixedCosts: {
      ...DEFAULT_CONFIG.monthlyFixedCosts,
      marketing: DEFAULT_CONFIG.monthlyFixedCosts.marketing || 2000
    }
  });
  const [hybridConfig, setHybridConfig] = useState<HybridPricingData>(
    DEFAULT_HYBRID_CONFIG,
  );
  const [currentConfigId, setCurrentConfigId] = useState<string | undefined>();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [hybridResults, setHybridResults] =
    useState<HybridCalculationResults | null>(null);
  const [activeTab, setActiveTab] = useState("inputs");
  const [pricingMode, setPricingMode] = useState<"standard" | "hybrid">(
    "standard",
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [useEnhancedCalculations, setUseEnhancedCalculations] = useState(true);
  const [calculationErrors, setCalculationErrors] = useState<string[]>([]);

  // Calculate projections whenever config changes with debouncing for better UX
  useEffect(() => {
    setIsCalculating(true);

    const calculateWithDelay = setTimeout(() => {
      try {
        setCalculationErrors([]);
        
        if (pricingMode === "standard") {
          if (useEnhancedCalculations) {
            // Run validation tests first
            const testResults = runCalculationTests(config);
            if (!testResults.passed) {
              setCalculationErrors(testResults.errors);
            }
            
            const calculationResults = calculateEnhancedProjections(config);
            setResults(calculationResults);
          } else {
            const calculationResults = calculateMonthlyProjections(config);
            setResults(calculationResults);
          }
        } else {
          if (useEnhancedCalculations) {
            const hybridCalculationResults = calculateEnhancedHybridProjections(hybridConfig);
            setHybridResults(hybridCalculationResults);
          } else {
            const hybridCalculationResults = calculateHybridProjections(hybridConfig);
            setHybridResults(hybridCalculationResults);
          }
        }
      } catch (error) {
        console.error("Error calculating projections:", error);
        setCalculationErrors([`Calculation error: ${error instanceof Error ? error.message : String(error)}`]);
        if (pricingMode === "standard") {
          setResults(null);
        } else {
          setHybridResults(null);
        }
      } finally {
        setIsCalculating(false);
      }
    }, 300); // Debounce calculations by 300ms

    return () => clearTimeout(calculateWithDelay);
  }, [config, hybridConfig, pricingMode, useEnhancedCalculations]);

  // Initialize with default config - ConfigurationManager will handle loading from DB
  useEffect(() => {
    // Initial config is already set to DEFAULT_CONFIG
  }, []);

  const handleConfigChange = (newConfig: FinancialData, configId?: string) => {
    setConfig(newConfig);
    setCurrentConfigId(configId);
  };

  const handleSaveConfig = () => {
    // Save functionality is handled by ConfigurationManager in the Header
    // This function is kept for interface compatibility
  };

  const handleResetConfig = () => {
    if (
      confirm(
        "Are you sure you want to reset to default values? This will overwrite your current configuration.",
      )
    ) {
      const resetConfig = {
        ...DEFAULT_CONFIG,
        pricePerUser: 49,
        initialUsers: 5,
        monthlyFixedCosts: {
          ...DEFAULT_CONFIG.monthlyFixedCosts,
          marketing: 2000
        }
      };
      setConfig(resetConfig);
      setCurrentConfigId(undefined);
      alert("Configuration reset to default values!");
    }
  };

  const chartData = results ? generateChartData(results.monthlyData) : [];
  const hybridChartData = hybridResults
    ? generateHybridChartData(hybridResults.monthlyData)
    : [];

  const standardTabs = [
    {
      id: "inputs",
      label: "⚙️ Setup",
      description: "Configure your business and marketing parameters",
    },
    {
      id: "controls",
      label: "🎛️ Controls",
      description: "Interactive sliders & scenarios",
    },
    {
      id: "predictions",
      label: "🔮 Predictions",
      description: "Break-even & $1M timeline",
    },
    {
      id: "projections",
      label: "📊 Projections",
      description: "View monthly financial projections with marketing costs",
    },
    {
      id: "analysis",
      label: "🎯 Analysis",
      description: "Break-even & goal tracking",
    },
    {
      id: "summary",
      label: "📈 Summary",
      description: "Key insights and metrics",
    },
    { id: "charts", label: "📉 Charts", description: "Visual analysis" },
    { id: "export", label: "📥 Export", description: "Download reports" },
  ];

  const hybridTabs = [
    {
      id: "hybrid-config",
      label: "🎯 Hybrid Setup",
      description: "Configure pricing tiers & scenarios",
    },
    {
      id: "hybrid-projections",
      label: "📊 Hybrid Projections",
      description: "Monthly hybrid pricing data",
    },
    {
      id: "hybrid-dashboard",
      label: "📈 Hybrid Dashboard",
      description: "Revenue composition & metrics",
    },
  ];

  const tabs = pricingMode === "standard" ? standardTabs : hybridTabs;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header
        currentConfig={config}
        currentConfigId={currentConfigId}
        onConfigChange={handleConfigChange}
        onSave={handleSaveConfig}
        onResetConfig={handleResetConfig}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Calculations Toggle and Status */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Calculation Engine
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enhanced calculations include marketing costs, user-level analytics, CAC/LTV metrics, and comprehensive validation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useEnhancedCalculations}
                  onChange={(e) => setUseEnhancedCalculations(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Use Enhanced Calculations
                </span>
              </label>
              {isCalculating && (
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Calculating...
                </div>
              )}
            </div>
          </div>
          
          {/* Error Display */}
          {calculationErrors.length > 0 && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Calculation Issues Detected:
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {calculationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Pricing Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                setPricingMode("standard");
                setActiveTab("inputs");
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                pricingMode === "standard"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              📊 Standard Pricing Model
            </button>
            <button
              onClick={() => {
                setPricingMode("hybrid");
                setActiveTab("hybrid-config");
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                pricingMode === "hybrid"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              🎯 Hybrid Pricing Model
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">{tab.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tab.description}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {pricingMode === "standard" && activeTab === "inputs" && (
            <div className="space-y-6 animate-fade-in">
              <EnhancedInputForm
                config={config}
                onConfigChange={(newConfig) =>
                  handleConfigChange(newConfig, currentConfigId)
                }
                onSave={handleSaveConfig}
              />
            </div>
          )}

          {pricingMode === "standard" && activeTab === "controls" && (
            <div className="animate-fade-in">
              <InteractiveControls
                config={config}
                onChange={(newConfig) =>
                  handleConfigChange(newConfig, currentConfigId)
                }
              />
            </div>
          )}

          {pricingMode === "standard" && activeTab === "predictions" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Updating predictions...
                    </div>
                  </div>
                </div>
              ) : results ? (
                <PredictionSections results={results} config={config} />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No prediction data available. Please check your
                      configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pricingMode === "standard" && activeTab === "projections" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Updating projections...
                    </div>
                  </div>
                </div>
              ) : results ? (
                <CashFlowTable monthlyData={results.monthlyData} />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No projections available. Please check your configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pricingMode === "standard" && activeTab === "analysis" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Updating analysis...
                    </div>
                  </div>
                </div>
              ) : results ? (
                <div className="space-y-8">
                  <BreakEvenAnalysis breakEvenData={results.breakEvenData} />
                  <RevenueGoalTracker
                    revenueGoalData={results.revenueGoalData}
                    monthlyData={results.monthlyData}
                  />
                </div>
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No analysis data available. Please check your
                      configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pricingMode === "standard" && activeTab === "summary" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Updating summary...
                    </div>
                  </div>
                </div>
              ) : results ? (
                <PnLReport results={results} />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No summary data available. Please check your
                      configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pricingMode === "standard" && activeTab === "charts" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Updating charts...
                    </div>
                  </div>
                </div>
              ) : results && chartData.length > 0 ? (
                <ChartsDashboard chartData={chartData} />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No chart data available. Please check your configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pricingMode === "standard" && activeTab === "export" && (
            <div className="animate-fade-in">
              {results ? (
                <DownloadButton config={config} results={results} />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No data available for export. Please check your
                      configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hybrid Pricing Tabs */}
          {pricingMode === "hybrid" && activeTab === "hybrid-config" && (
            <div className="animate-fade-in">
              <HybridPricingConfigurator
                config={hybridConfig}
                onChange={setHybridConfig}
              />
            </div>
          )}

          {pricingMode === "hybrid" && activeTab === "hybrid-projections" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Calculating hybrid projections...
                    </div>
                  </div>
                </div>
              ) : hybridResults ? (
                <HybridPricingTable monthlyData={hybridResults.monthlyData} />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No hybrid pricing data available. Please check your
                      configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pricingMode === "hybrid" && activeTab === "hybrid-dashboard" && (
            <div className="animate-fade-in">
              {isCalculating ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      Updating dashboard...
                    </div>
                  </div>
                </div>
              ) : hybridResults && hybridChartData.length > 0 ? (
                <HybridDashboard
                  results={hybridResults}
                  chartData={hybridChartData}
                />
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No hybrid dashboard data available. Please check your
                      configuration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        {pricingMode === "standard" && results && (
          <div className="mt-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Total Users (End)
                  </div>
                  <div className="font-bold text-lg text-primary-600 dark:text-primary-400">
                    {results.monthlyData[results.monthlyData.length - 1]
                      ?.users || 0}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Monthly Revenue (End)
                  </div>
                  <div className="font-bold text-lg text-success-600 dark:text-success-400">
                    $
                    {Math.round(
                      results.monthlyData[results.monthlyData.length - 1]
                        ?.revenue || 0,
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Break-even Month
                  </div>
                  <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {results.breakEvenMonth
                      ? `Month ${results.breakEvenMonth}`
                      : "Not achieved"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Final Cash
                  </div>
                  <div
                    className={`font-bold text-lg ${results.finalCash >= 0 ? "text-primary-600 dark:text-primary-400" : "text-danger-600 dark:text-danger-400"}`}
                  >
                    ${Math.round(results.finalCash).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hybrid Quick Stats Footer */}
        {pricingMode === "hybrid" && hybridResults && (
          <div className="mt-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Hybrid Pricing Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Max Tenants
                  </div>
                  <div className="font-bold text-lg text-primary-600 dark:text-primary-400">
                    {hybridResults.maxTenants}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Peak MRR
                  </div>
                  <div className="font-bold text-lg text-success-600 dark:text-success-400">
                    ${Math.round(hybridResults.peakMRR).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Break-even Month
                  </div>
                  <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {hybridResults.breakEvenMonth
                      ? `Month ${hybridResults.breakEvenMonth}`
                      : "Not achieved"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Final Cash
                  </div>
                  <div
                    className={`font-bold text-lg ${hybridResults.finalCash >= 0 ? "text-primary-600 dark:text-primary-400" : "text-danger-600 dark:text-danger-400"}`}
                  >
                    ${Math.round(hybridResults.finalCash).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
