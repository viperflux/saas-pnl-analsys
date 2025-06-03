import React, { useState, useEffect } from "react";
import { ExtendedGrowthScenario } from "@/types";
import { DEFAULT_GROWTH_SCENARIOS } from "@/lib/utils/config";

interface GrowthScenarioManagerProps {
  selectedScenario: string;
  onScenarioChange: (scenarioId: string) => void;
  projectionMonths: number;
  onCustomScenarioUpdate?: (scenario: ExtendedGrowthScenario) => void;
  className?: string;
}

export default function GrowthScenarioManager({
  selectedScenario,
  onScenarioChange,
  projectionMonths,
  onCustomScenarioUpdate,
  className = "",
}: GrowthScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<ExtendedGrowthScenario[]>(
    DEFAULT_GROWTH_SCENARIOS,
  );
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customScenario, setCustomScenario] = useState<ExtendedGrowthScenario>({
    id: "custom",
    name: "Custom Scenario",
    description: "Your custom growth scenario",
    growthRates: Array(projectionMonths).fill(8),
    isDefault: false,
  });

  const selectedScenarioData =
    scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  const handleCustomScenarioChange = (
    field: keyof ExtendedGrowthScenario,
    value: any,
  ) => {
    const updated = { ...customScenario, [field]: value };
    setCustomScenario(updated);
    onCustomScenarioUpdate?.(updated);
  };

  const handleGrowthRateChange = (monthIndex: number, value: number) => {
    const newRates = [...customScenario.growthRates];
    newRates[monthIndex] = value;
    handleCustomScenarioChange("growthRates", newRates);
  };

  const addCustomScenario = () => {
    const newScenarios = [...scenarios, customScenario];
    setScenarios(newScenarios);
    onScenarioChange(customScenario.id);
    setShowCustomEditor(false);
  };

  const applyPattern = (
    pattern: "steady" | "seasonal" | "growth" | "decline",
  ) => {
    let newRates: number[] = [];

    switch (pattern) {
      case "steady":
        newRates = Array(projectionMonths).fill(8);
        break;
      case "seasonal":
        const seasonalPattern = [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3];
        newRates = Array(projectionMonths)
          .fill(0)
          .map((_, i) => seasonalPattern[i % 12]);
        break;
      case "growth":
        newRates = Array(projectionMonths)
          .fill(0)
          .map((_, i) => Math.min(5 + i * 0.5, 20));
        break;
      case "decline":
        newRates = Array(projectionMonths)
          .fill(0)
          .map((_, i) => Math.max(15 - i * 0.3, 2));
        break;
    }

    handleCustomScenarioChange("growthRates", newRates);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="form-label">Growth Scenario</label>
        <select
          value={selectedScenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          className="form-input"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {selectedScenarioData.description}
        </p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setShowCustomEditor(!showCustomEditor)}
          className="btn-secondary text-xs"
        >
          {showCustomEditor ? "Hide" : "Create"} Custom Scenario
        </button>
      </div>

      {showCustomEditor && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Custom Growth Scenario
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Scenario Name</label>
              <input
                type="text"
                value={customScenario.name}
                onChange={(e) =>
                  handleCustomScenarioChange("name", e.target.value)
                }
                className="form-input"
                placeholder="Enter scenario name"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input
                type="text"
                value={customScenario.description}
                onChange={(e) =>
                  handleCustomScenarioChange("description", e.target.value)
                }
                className="form-input"
                placeholder="Describe this scenario"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Quick Patterns</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPattern("steady")}
                className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                Steady 8%
              </button>
              <button
                onClick={() => applyPattern("seasonal")}
                className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/40"
              >
                Seasonal
              </button>
              <button
                onClick={() => applyPattern("growth")}
                className="px-3 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40"
              >
                Accelerating
              </button>
              <button
                onClick={() => applyPattern("decline")}
                className="px-3 py-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-100 dark:hover:bg-orange-900/40"
              >
                Declining
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Monthly Growth Rates (%)</label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto">
              {customScenario.growthRates
                .slice(0, projectionMonths)
                .map((rate, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      M{index + 1}
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) =>
                        handleGrowthRateChange(index, Number(e.target.value))
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button onClick={addCustomScenario} className="btn-primary text-xs">
              Save Custom Scenario
            </button>
            <button
              onClick={() => setShowCustomEditor(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedScenario !== "custom" && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium">
            Growth Pattern Preview (First 12 months):
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedScenarioData.growthRates
              .slice(0, 12)
              .map((rate, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                >
                  {rate}%
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
