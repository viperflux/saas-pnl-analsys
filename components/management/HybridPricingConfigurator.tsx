import React from "react";
import {
  HybridPricingData,
  PricingTier,
  FeatureAddon,
  GrowthScenario,
} from "@/types";
import {
  PRICING_TIERS,
  FEATURE_ADDONS,
  GROWTH_SCENARIOS,
} from "@/lib/utils/hybridConfig";

interface HybridPricingConfiguratorProps {
  config: HybridPricingData;
  onChange: (config: HybridPricingData) => void;
}

export default function HybridPricingConfigurator({
  config,
  onChange,
}: HybridPricingConfiguratorProps) {
  const updateConfig = (field: keyof HybridPricingData, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const updateFixedCosts = (
    field: keyof HybridPricingData["monthlyFixedCosts"],
    value: number,
  ) => {
    onChange({
      ...config,
      monthlyFixedCosts: {
        ...config.monthlyFixedCosts,
        [field]: value,
      },
    });
  };

  const toggleAddon = (addonId: string) => {
    const selectedAddons = config.selectedAddons.includes(addonId)
      ? config.selectedAddons.filter((id) => id !== addonId)
      : [...config.selectedAddons, addonId];

    updateConfig("selectedAddons", selectedAddons);
  };

  const selectedTier = PRICING_TIERS.find(
    (tier) => tier.id === config.selectedTier,
  );
  const selectedScenario = GROWTH_SCENARIOS[config.growthScenario];

  return (
    <div className="space-y-8">
      {/* Pricing Tier Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 Pricing Tier Configuration</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  config.selectedTier === tier.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => updateConfig("selectedTier", tier.id)}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {tier.name}
                  </h3>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 my-2">
                    ${tier.baseFee}/mo
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {tier.description}
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                    <div>✓ {tier.includedUsers} included users</div>
                    <div>✓ {tier.aiCredits.toLocaleString()} AI credits</div>
                    <div>✓ ${tier.perUserRate}/user overage</div>
                    <div>✓ ${tier.aiOverageRate}/AI credit</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTier && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Selected: {selectedTier.name} Plan
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Base Fee:
                  </span>
                  <div className="font-semibold">
                    ${selectedTier.baseFee}/month
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Included Users:
                  </span>
                  <div className="font-semibold">
                    {selectedTier.includedUsers}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    AI Credits:
                  </span>
                  <div className="font-semibold">
                    {selectedTier.aiCredits.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Overage Rates:
                  </span>
                  <div className="font-semibold">
                    ${selectedTier.perUserRate}/user, $
                    {selectedTier.aiOverageRate}/AI
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Parameters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Business Parameters</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="form-label">Starting Cash ($)</label>
              <input
                type="number"
                value={config.startingCash}
                onChange={(e) =>
                  updateConfig("startingCash", parseFloat(e.target.value) || 0)
                }
                className="form-input"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => updateConfig("startDate", e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Initial Tenants</label>
              <input
                type="number"
                min="1"
                value={config.initialTenants}
                onChange={(e) =>
                  updateConfig("initialTenants", parseInt(e.target.value) || 1)
                }
                className="form-input"
                placeholder="10"
              />
            </div>

            <div>
              <label className="form-label">Avg Users per Tenant</label>
              <input
                type="number"
                min="1"
                value={config.avgUsersPerTenant}
                onChange={(e) =>
                  updateConfig(
                    "avgUsersPerTenant",
                    parseInt(e.target.value) || 1,
                  )
                }
                className="form-input"
                placeholder="15"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="form-label">
              Avg AI Usage per Tenant (credits/month)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={config.avgAiUsagePerTenant}
                onChange={(e) =>
                  updateConfig("avgAiUsagePerTenant", parseInt(e.target.value))
                }
                className="flex-1 slider"
              />
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-400 w-20">
                {config.avgAiUsagePerTenant.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0</span>
              <span>10,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Scenario Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📈 Growth Scenario</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(GROWTH_SCENARIOS).map(([key, scenario]) => (
              <div
                key={key}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  config.growthScenario === key
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => updateConfig("growthScenario", key)}
              >
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                  {scenario.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {scenario.description}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-500">
                      Tenant Growth:
                    </span>
                    <span className="font-medium">
                      {(scenario.tenantGrowthRate * 100).toFixed(0)}%/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-500">
                      Churn Rate:
                    </span>
                    <span className="font-medium">
                      {(scenario.churnRate * 100).toFixed(0)}%/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-500">
                      Users/Tenant:
                    </span>
                    <span className="font-medium">
                      {scenario.usersPerTenant}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedScenario && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Selected: {selectedScenario.name} Scenario
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Tenant Growth:
                  </span>
                  <div className="font-semibold">
                    {(selectedScenario.tenantGrowthRate * 100).toFixed(1)}
                    %/month
                  </div>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    User Growth:
                  </span>
                  <div className="font-semibold">
                    {(selectedScenario.userGrowthRate * 100).toFixed(1)}%/month
                  </div>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    AI Growth:
                  </span>
                  <div className="font-semibold">
                    {(selectedScenario.aiGrowthRate * 100).toFixed(1)}%/month
                  </div>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Churn Rate:
                  </span>
                  <div className="font-semibold">
                    {(selectedScenario.churnRate * 100).toFixed(1)}%/month
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Add-ons */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🔧 Feature Add-ons</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_ADDONS.map((addon) => (
              <div
                key={addon.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  config.selectedAddons.includes(addon.id)
                    ? "border-success-500 bg-success-50 dark:bg-success-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => toggleAddon(addon.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {addon.name}
                  </h4>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-success-600 dark:text-success-400">
                      ${addon.price}
                    </span>
                    <div
                      className={`ml-2 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        config.selectedAddons.includes(addon.id)
                          ? "border-success-500 bg-success-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {config.selectedAddons.includes(addon.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {addon.description}
                </p>
              </div>
            ))}
          </div>

          {config.selectedAddons.length > 0 && (
            <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Selected Add-ons
              </h4>
              <div className="space-y-2">
                {config.selectedAddons.map((addonId) => {
                  const addon = FEATURE_ADDONS.find((a) => a.id === addonId);
                  return addon ? (
                    <div
                      key={addon.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-purple-700 dark:text-purple-300">
                        {addon.name}
                      </span>
                      <span className="font-semibold">
                        ${addon.price}/month
                      </span>
                    </div>
                  ) : null;
                })}
                <div className="border-t border-purple-200 dark:border-purple-800 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Add-ons:</span>
                    <span>
                      $
                      {config.selectedAddons.reduce((sum, addonId) => {
                        const addon = FEATURE_ADDONS.find(
                          (a) => a.id === addonId,
                        );
                        return sum + (addon?.price || 0);
                      }, 0)}
                      /month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Costs */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">💰 Monthly Fixed Costs</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Infrastructure ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.infra}
                onChange={(e) =>
                  updateFixedCosts("infra", parseFloat(e.target.value) || 0)
                }
                className="form-input"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="form-label">Salaries ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.salary}
                onChange={(e) =>
                  updateFixedCosts("salary", parseFloat(e.target.value) || 0)
                }
                className="form-input"
                placeholder="25000"
              />
            </div>

            <div>
              <label className="form-label">Support Team ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.support}
                onChange={(e) =>
                  updateFixedCosts("support", parseFloat(e.target.value) || 0)
                }
                className="form-input"
                placeholder="3000"
              />
            </div>

            <div>
              <label className="form-label">Other Wages ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.wages}
                onChange={(e) =>
                  updateFixedCosts("wages", parseFloat(e.target.value) || 0)
                }
                className="form-input"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="form-label">Hosting & Services ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.hosting}
                onChange={(e) =>
                  updateFixedCosts("hosting", parseFloat(e.target.value) || 0)
                }
                className="form-input"
                placeholder="1200"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Fixed Costs
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  $
                  {(
                    config.monthlyFixedCosts.infra +
                    config.monthlyFixedCosts.salary +
                    config.monthlyFixedCosts.support +
                    config.monthlyFixedCosts.wages +
                    config.monthlyFixedCosts.hosting
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
