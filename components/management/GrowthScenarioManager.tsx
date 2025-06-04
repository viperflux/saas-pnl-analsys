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
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customScenario, setCustomScenario] = useState<ExtendedGrowthScenario>({
    id: `custom-${Date.now()}`,
    name: "Custom Scenario",
    description: "Your custom growth scenario",
    growthRates: Array(projectionMonths).fill(8),
    isDefault: false,
  });

  // Load scenarios from API on component mount
  useEffect(() => {
    loadScenariosFromAPI();
  }, []);

  // Update custom scenario when projection months change
  useEffect(() => {
    setCustomScenario(prev => ({
      ...prev,
      growthRates: prev.growthRates.length === projectionMonths 
        ? prev.growthRates 
        : Array(projectionMonths).fill(8)
    }));
  }, [projectionMonths]);

  const loadScenariosFromAPI = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/scenarios', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        console.log('User not authenticated, using default scenarios only');
        setErrors(prev => ({
          ...prev,
          auth: 'Log in to access custom scenarios'
        }));
        setScenarios(DEFAULT_GROWTH_SCENARIOS);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded scenarios from API:', data.scenarios?.length || 0);
        
        const apiScenarios = (data.scenarios || []).map((scenario: any) => ({
          id: scenario.id,
          name: scenario.name,
          description: scenario.description,
          growthRates: typeof scenario.growth_rates === 'string' 
            ? JSON.parse(scenario.growth_rates) 
            : (scenario.growth_rates || scenario.growthRates || []),
          seasonalModifiers: scenario.seasonal_modifiers 
            ? (typeof scenario.seasonal_modifiers === 'string'
               ? JSON.parse(scenario.seasonal_modifiers)
               : scenario.seasonal_modifiers)
            : undefined,
          isDefault: scenario.is_default || scenario.isDefault || false,
        }));
        
        // Combine default scenarios with user's custom scenarios
        const allScenarios = [...DEFAULT_GROWTH_SCENARIOS, ...apiScenarios];
        setScenarios(allScenarios);
        
        // Clear auth errors if successful
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.auth;
          return newErrors;
        });
      } else {
        console.error('Failed to load scenarios:', response.status);
        setScenarios(DEFAULT_GROWTH_SCENARIOS);
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios(DEFAULT_GROWTH_SCENARIOS);
    } finally {
      setIsLoading(false);
    }
  };

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

  const saveCustomScenario = async () => {
    try {
      setSaveStatus('saving');
      
      console.log('Attempting to save scenario:', customScenario.name);
      
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify({
          name: customScenario.name,
          description: customScenario.description,
          growthRates: customScenario.growthRates,
          seasonalModifiers: customScenario.seasonalModifiers,
          isDefault: false,
        }),
      });

      console.log('Save response status:', response.status);
      
      if (response.status === 401) {
        const errorData = await response.json();
        console.error('Authentication error:', errorData);
        setErrors(prev => ({
          ...prev,
          auth: 'Please log in to save custom scenarios. Visit /login to authenticate.'
        }));
        setSaveStatus('error');
        return;
      }

      if (response.ok) {
        const savedScenario = await response.json();
        console.log('Successfully saved scenario:', savedScenario);
        
        const newScenario: ExtendedGrowthScenario = {
          id: savedScenario.id,
          name: savedScenario.name,
          description: savedScenario.description,
          growthRates: typeof savedScenario.growth_rates === 'string' 
            ? JSON.parse(savedScenario.growth_rates)
            : savedScenario.growth_rates,
          seasonalModifiers: savedScenario.seasonal_modifiers 
            ? (typeof savedScenario.seasonal_modifiers === 'string' 
               ? JSON.parse(savedScenario.seasonal_modifiers)
               : savedScenario.seasonal_modifiers)
            : undefined,
          isDefault: savedScenario.is_default || savedScenario.isDefault,
        };
        
        const newScenarios = [...scenarios, newScenario];
        setScenarios(newScenarios);
        onScenarioChange(newScenario.id);
        setShowCustomEditor(false);
        setSaveStatus('saved');
        
        // Clear any auth errors
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.auth;
          return newErrors;
        });
        
        // Reset save status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save scenario');
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
      setErrors(prev => ({
        ...prev,
        save: error instanceof Error ? error.message : 'Failed to save scenario'
      }));
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scenarios?id=${scenarioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedScenarios = scenarios.filter(s => s.id !== scenarioId);
        setScenarios(updatedScenarios);
        
        // If deleted scenario was selected, switch to first available
        if (selectedScenario === scenarioId) {
          onScenarioChange(updatedScenarios[0]?.id || 'conservative');
        }
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
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

  const isCustomScenario = (scenario: ExtendedGrowthScenario) => {
    return !DEFAULT_GROWTH_SCENARIOS.some(ds => ds.id === scenario.id);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="form-label">Growth Scenario</label>
        <div className="flex space-x-2">
          <select
            value={selectedScenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="form-input flex-1"
            disabled={isLoading}
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name} {isCustomScenario(scenario) ? '(Custom)' : ''}
              </option>
            ))}
          </select>
          
          {/* Delete button for custom scenarios */}
          {selectedScenarioData && isCustomScenario(selectedScenarioData) && (
            <button
              onClick={() => deleteScenario(selectedScenario)}
              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-red-200 dark:border-red-700"
              title="Delete this custom scenario"
            >
              🗑️
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {selectedScenarioData?.description}
        </p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setShowCustomEditor(!showCustomEditor)}
          className="btn-secondary text-xs"
        >
          {showCustomEditor ? "Hide" : "Create"} Custom Scenario
        </button>
        
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
            ✅ Saved successfully!
          </span>
        )}
        
        {saveStatus === 'error' && (
          <span className="text-xs text-red-600 dark:text-red-400 flex items-center">
            ❌ Failed to save
          </span>
        )}
        
        {errors.auth && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2 mt-2">
            ⚠️ {errors.auth}
          </div>
        )}
        
        {errors.save && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2 mt-2">
            ❌ {errors.save}
          </div>
        )}
      </div>

      {showCustomEditor && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Custom Growth Scenario
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Scenario Name *</label>
              <input
                type="text"
                value={customScenario.name}
                onChange={(e) =>
                  handleCustomScenarioChange("name", e.target.value)
                }
                className="form-input"
                placeholder="Enter scenario name"
                required
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
                type="button"
                onClick={() => applyPattern("steady")}
                className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                Steady 8%
              </button>
              <button
                type="button"
                onClick={() => applyPattern("seasonal")}
                className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/40"
              >
                Seasonal
              </button>
              <button
                type="button"
                onClick={() => applyPattern("growth")}
                className="px-3 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40"
              >
                Accelerating
              </button>
              <button
                type="button"
                onClick={() => applyPattern("decline")}
                className="px-3 py-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-100 dark:hover:bg-orange-900/40"
              >
                Declining
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">
              Monthly Growth Rates (%) - {projectionMonths} months
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded p-2">
              {customScenario.growthRates
                .slice(0, projectionMonths)
                .map((rate, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block text-center">
                      M{index + 1}
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) =>
                        handleGrowthRateChange(index, Number(e.target.value))
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                      min="-50"
                      max="100"
                      step="0.1"
                    />
                  </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter growth rates as percentages. Negative values represent decline.
            </p>
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={saveCustomScenario} 
              className="btn-primary text-xs"
              disabled={saveStatus === 'saving' || !customScenario.name.trim()}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Custom Scenario'}
            </button>
            <button
              type="button"
              onClick={() => setShowCustomEditor(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedScenario !== "custom" && selectedScenarioData && (
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
      
      {isLoading && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <span className="animate-spin mr-2">⏳</span>
          Loading scenarios...
        </div>
      )}
    </div>
  );
}