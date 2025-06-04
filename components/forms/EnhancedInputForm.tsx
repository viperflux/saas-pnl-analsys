import React, { useState } from "react";
import { FinancialData } from "@/types";
import GrowthScenarioManager from "../management/GrowthScenarioManager";
import FeatureAddonsManager from "../management/FeatureAddonsManager";
import ProjectionTimeframeSelector from "../management/ProjectionTimeframeSelector";
import MarketingMetricsManager from "../management/MarketingMetricsManager";

interface EnhancedInputFormProps {
  config: FinancialData;
  onConfigChange: (config: FinancialData) => void;
  onSave: () => void;
}

export default function EnhancedInputForm({
  config,
  onConfigChange,
  onSave,
}: EnhancedInputFormProps) {
  const [activeSection, setActiveSection] = useState<
    "basic" | "projections" | "growth" | "addons" | "marketing"
  >("basic");

  const handleInputChange = (field: keyof FinancialData, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleNestedInputChange = (
    parentField: keyof FinancialData,
    childField: string,
    value: number,
  ) => {
    const parent = config[parentField] as any;
    onConfigChange({
      ...config,
      [parentField]: { ...parent, [childField]: value },
    });
  };

  const handleArrayInputChange = (
    field: keyof FinancialData,
    index: number,
    value: number,
  ) => {
    const array = [...(config[field] as number[])];
    array[index] = value;
    onConfigChange({ ...config, [field]: array });
  };

  const extendArrayToMonths = (
    array: number[],
    targetMonths: number,
  ): number[] => {
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
  };

  const handleProjectionMonthsChange = (months: number) => {
    const extendedCapitalPurchases = extendArrayToMonths(
      config.capitalPurchases,
      months,
    );
    const extendedSeasonalGrowth = extendArrayToMonths(
      config.seasonalGrowth,
      months,
    );

    onConfigChange({
      ...config,
      projectionMonths: months,
      capitalPurchases: extendedCapitalPurchases,
      seasonalGrowth: extendedSeasonalGrowth,
    });
  };

  const sections = [
    { id: "basic", label: "Basic Settings", icon: "⚙️" },
    { id: "projections", label: "Projections", icon: "📊" },
    { id: "growth", label: "Growth Scenarios", icon: "📈" },
    { id: "addons", label: "Feature Add-ons", icon: "🔌" },
    { id: "marketing", label: "Marketing Metrics", icon: "📣" },
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Settings */}
      {activeSection === "basic" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Starting Cash ($)</label>
              <input
                type="number"
                value={config.startingCash}
                onChange={(e) =>
                  handleInputChange("startingCash", Number(e.target.value))
                }
                className="form-input"
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Price per User ($)</label>
              <input
                type="number"
                value={config.pricePerUser}
                onChange={(e) =>
                  handleInputChange("pricePerUser", Number(e.target.value))
                }
                className="form-input"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="form-label">Monthly Churn Rate (%)</label>
              <input
                type="number"
                value={config.churnRate * 100}
                onChange={(e) =>
                  handleInputChange("churnRate", Number(e.target.value) / 100)
                }
                className="form-input"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="form-label">Initial Users</label>
              <input
                type="number"
                value={config.initialUsers}
                onChange={(e) =>
                  handleInputChange("initialUsers", Number(e.target.value))
                }
                className="form-input"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="form-label">Marketing Spend ($)</label>
              <input
                type="number"
                value={config.monthlyFixedCosts.marketing || 0}
                onChange={(e) =>
                  handleNestedInputChange(
                    "monthlyFixedCosts",
                    "marketing",
                    Number(e.target.value),
                  )
                }
                className="form-input"
                min="0"
                step="50"
              />
            </div>
          </div>

          {/* Monthly Fixed Costs */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Monthly Fixed Costs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Infrastructure ($)</label>
                <input
                  type="number"
                  value={config.monthlyFixedCosts.infra}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "monthlyFixedCosts",
                      "infra",
                      Number(e.target.value),
                    )
                  }
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="form-label">Salary ($)</label>
                <input
                  type="number"
                  value={config.monthlyFixedCosts.salary}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "monthlyFixedCosts",
                      "salary",
                      Number(e.target.value),
                    )
                  }
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="form-label">Support ($)</label>
                <input
                  type="number"
                  value={config.monthlyFixedCosts.support}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "monthlyFixedCosts",
                      "support",
                      Number(e.target.value),
                    )
                  }
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="form-label">Wages ($)</label>
                <input
                  type="number"
                  value={config.monthlyFixedCosts.wages}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "monthlyFixedCosts",
                      "wages",
                      Number(e.target.value),
                    )
                  }
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="form-label">Hosting ($)</label>
                <input
                  type="number"
                  value={config.monthlyFixedCosts.hosting}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "monthlyFixedCosts",
                      "hosting",
                      Number(e.target.value),
                    )
                  }
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Capital Purchases */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Capital Purchases (First {Math.min(12, config.projectionMonths)}{" "}
              Months)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {config.capitalPurchases
                .slice(0, Math.min(12, config.projectionMonths))
                .map((purchase, index) => (
                  <div key={index}>
                    <label className="form-label text-xs">
                      Month {index + 1}
                    </label>
                    <input
                      type="number"
                      value={purchase}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "capitalPurchases",
                          index,
                          Number(e.target.value),
                        )
                      }
                      className="form-input text-sm"
                      min="0"
                      step="100"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Projections Section */}
      {activeSection === "projections" && (
        <div className="space-y-6">
          <ProjectionTimeframeSelector
            selectedMonths={config.projectionMonths}
            onTimeframeChange={handleProjectionMonthsChange}
          />

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Monthly Growth Pattern (New Clients per Month)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
              {config.seasonalGrowth.map((growth, index) => (
                <div key={index}>
                  <label className="form-label text-xs">
                    Month {index + 1}
                    {index >= 12 && (
                      <span className="text-gray-400">
                        {" "}
                        (Y{Math.floor(index / 12) + 1})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={growth}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "seasonalGrowth",
                        index,
                        Number(e.target.value),
                      )
                    }
                    className="form-input text-sm"
                    min="0"
                    step="1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Growth Scenarios Section */}
      {activeSection === "growth" && (
        <GrowthScenarioManager
          selectedScenario={config.selectedGrowthScenario || "default"}
          onScenarioChange={(scenario) =>
            handleInputChange("selectedGrowthScenario", scenario)
          }
          projectionMonths={config.projectionMonths}
        />
      )}

      {/* Feature Add-ons Section */}
      {activeSection === "addons" && (
        <FeatureAddonsManager
          enabledAddons={config.enabledAddons || []}
          onAddonsChange={(addons) =>
            handleInputChange("enabledAddons", addons)
          }
          projectionMonths={config.projectionMonths}
          clientCount={config.initialUsers}
        />
      )}

      {/* Marketing Metrics Section */}
      {activeSection === "marketing" && (
        <MarketingMetricsManager
          marketingMetrics={config.marketingMetrics || {
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
          }}
          onMetricsChange={(metrics) =>
            handleInputChange("marketingMetrics", metrics)
          }
        />
      )}

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onSave} className="btn-primary">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
