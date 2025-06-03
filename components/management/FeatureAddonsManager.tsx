import React, { useState, useEffect } from "react";
import { FeatureAddon } from "@/types";
import { DEFAULT_FEATURE_ADDONS } from "@/lib/utils/config";

interface FeatureAddonsManagerProps {
  enabledAddons: string[];
  onAddonsChange: (addonIds: string[]) => void;
  projectionMonths: number;
  clientCount?: number;
  className?: string;
}

export default function FeatureAddonsManager({
  enabledAddons,
  onAddonsChange,
  projectionMonths,
  clientCount = 100,
  className = "",
}: FeatureAddonsManagerProps) {
  const [addons, setAddons] = useState<FeatureAddon[]>(DEFAULT_FEATURE_ADDONS);
  const [showCustomAddon, setShowCustomAddon] = useState(false);
  const [customAddon, setCustomAddon] = useState<Partial<FeatureAddon>>({
    name: "",
    description: "",
    price: 0,
    pricingModel: "flat_rate",
  });

  const handleAddonToggle = (addonId: string) => {
    const newEnabledAddons = enabledAddons.includes(addonId)
      ? enabledAddons.filter((id) => id !== addonId)
      : [...enabledAddons, addonId];
    onAddonsChange(newEnabledAddons);
  };

  const calculateAddonRevenue = (addon: FeatureAddon): number => {
    const monthlyRevenue = calculateMonthlyAddonRevenue(addon);
    return monthlyRevenue * projectionMonths;
  };

  const calculateMonthlyAddonRevenue = (addon: FeatureAddon): number => {
    switch (addon.pricingModel) {
      case "flat_rate":
        return addon.price;
      case "per_user":
        return addon.price * clientCount;
      case "usage_based":
        const estimatedUsage = addon.usageLimit
          ? Math.min(clientCount * 10, addon.usageLimit)
          : clientCount * 10;
        return (estimatedUsage / (addon.usageLimit || 1000)) * addon.price;
      default:
        return addon.price;
    }
  };

  const addCustomAddon = () => {
    if (!customAddon.name || !customAddon.price) return;

    const newAddon: FeatureAddon = {
      id: `custom-${Date.now()}`,
      name: customAddon.name,
      description: customAddon.description || "",
      price: customAddon.price,
      pricingModel: customAddon.pricingModel || "flat_rate",
      usageLimit: customAddon.usageLimit,
      enabled: false,
    };

    setAddons([...addons, newAddon]);
    setCustomAddon({
      name: "",
      description: "",
      price: 0,
      pricingModel: "flat_rate",
    });
    setShowCustomAddon(false);
  };

  const removeCustomAddon = (addonId: string) => {
    setAddons(addons.filter((addon) => addon.id !== addonId));
    onAddonsChange(enabledAddons.filter((id) => id !== addonId));
  };

  const getTotalAddonRevenue = (): number => {
    return addons
      .filter((addon) => enabledAddons.includes(addon.id))
      .reduce((total, addon) => total + calculateAddonRevenue(addon), 0);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            Feature Add-ons
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Additional revenue streams for your SaaS
          </p>
        </div>
        <button
          onClick={() => setShowCustomAddon(!showCustomAddon)}
          className="btn-secondary text-xs"
        >
          Add Custom
        </button>
      </div>

      {showCustomAddon && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Custom Add-on
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Add-on Name</label>
              <input
                type="text"
                value={customAddon.name || ""}
                onChange={(e) =>
                  setCustomAddon({ ...customAddon, name: e.target.value })
                }
                className="form-input"
                placeholder="e.g., Premium Analytics"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input
                type="text"
                value={customAddon.description || ""}
                onChange={(e) =>
                  setCustomAddon({
                    ...customAddon,
                    description: e.target.value,
                  })
                }
                className="form-input"
                placeholder="Brief description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Pricing Model</label>
              <select
                value={customAddon.pricingModel || "flat_rate"}
                onChange={(e) =>
                  setCustomAddon({
                    ...customAddon,
                    pricingModel: e.target.value as any,
                  })
                }
                className="form-input"
              >
                <option value="flat_rate">Flat Rate</option>
                <option value="per_user">Per User</option>
                <option value="usage_based">Usage Based</option>
              </select>
            </div>
            <div>
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                value={customAddon.price || 0}
                onChange={(e) =>
                  setCustomAddon({
                    ...customAddon,
                    price: Number(e.target.value),
                  })
                }
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            {customAddon.pricingModel === "usage_based" && (
              <div>
                <label className="form-label">Usage Limit</label>
                <input
                  type="number"
                  value={customAddon.usageLimit || 0}
                  onChange={(e) =>
                    setCustomAddon({
                      ...customAddon,
                      usageLimit: Number(e.target.value),
                    })
                  }
                  className="form-input"
                  min="0"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={addCustomAddon}
              className="btn-primary text-xs"
              disabled={!customAddon.name || !customAddon.price}
            >
              Add Add-on
            </button>
            <button
              onClick={() => setShowCustomAddon(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {addons.map((addon) => {
          const isEnabled = enabledAddons.includes(addon.id);
          const monthlyRevenue = calculateMonthlyAddonRevenue(addon);
          const totalRevenue = calculateAddonRevenue(addon);
          const isCustom = addon.id.startsWith("custom-");

          return (
            <div
              key={addon.id}
              className={`border rounded-lg p-4 transition-colors ${
                isEnabled
                  ? "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleAddonToggle(addon.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {addon.name}
                      </h4>
                      {isCustom && (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {addon.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {addon.pricingModel === "flat_rate" &&
                          `$${addon.price}/month`}
                        {addon.pricingModel === "per_user" &&
                          `$${addon.price} per user/month`}
                        {addon.pricingModel === "usage_based" &&
                          `$${addon.price} per ${addon.usageLimit} units`}
                      </span>
                      {isEnabled && (
                        <span className="font-medium text-green-600 dark:text-green-400">
                          +${monthlyRevenue.toFixed(0)}/month
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isEnabled && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {projectionMonths} months
                      </div>
                    </div>
                  )}
                  {isCustom && (
                    <button
                      onClick={() => removeCustomAddon(addon.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove custom add-on"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {enabledAddons.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900 dark:text-white">
              Total Add-on Revenue ({projectionMonths} months):
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              ${getTotalAddonRevenue().toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${(getTotalAddonRevenue() / projectionMonths).toFixed(0)}/month
            average
          </div>
        </div>
      )}
    </div>
  );
}
