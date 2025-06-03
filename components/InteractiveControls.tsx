import React from 'react';
import { FinancialData } from '@/types';

interface InteractiveControlsProps {
  config: FinancialData;
  onChange: (config: FinancialData) => void;
}

export default function InteractiveControls({ config, onChange }: InteractiveControlsProps) {
  const updateConfig = (field: keyof FinancialData, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const updateGrowthRate = (rate: number) => {
    const newGrowth = Array(12).fill(rate);
    onChange({ ...config, seasonalGrowth: newGrowth });
  };

  const avgGrowthRate = config.seasonalGrowth.reduce((sum, growth) => sum + growth, 0) / 12;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🎛️ Interactive Controls</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Adjust key parameters to see real-time impact on your projections
        </p>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Per Client Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Price Per Client
              </label>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                ${config.pricePerClient}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="10"
                max="200"
                step="1"
                value={config.pricePerClient}
                onChange={(e) => updateConfig('pricePerClient', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((config.pricePerClient - 10) / (200 - 10)) * 100}%, #e5e7eb ${((config.pricePerClient - 10) / (200 - 10)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>$10</span>
                <span>$200</span>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Impact:</strong> Higher prices increase revenue but may affect client acquisition and retention.
              </div>
            </div>
          </div>

          {/* Churn Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Monthly Churn Rate
              </label>
              <span className="text-lg font-bold text-danger-600 dark:text-danger-400">
                {(config.churnRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.001"
                value={config.churnRate}
                onChange={(e) => updateConfig('churnRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(config.churnRate / 0.2) * 100}%, #e5e7eb ${(config.churnRate / 0.2) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-xs text-red-800 dark:text-red-200">
                <strong>Impact:</strong> Lower churn means more retained revenue and faster growth compound effect.
              </div>
            </div>
          </div>

          {/* Monthly Growth Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Avg Monthly Growth
              </label>
              <span className="text-lg font-bold text-success-600 dark:text-success-400">
                {avgGrowthRate.toFixed(0)} clients
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={avgGrowthRate}
                onChange={(e) => updateGrowthRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(avgGrowthRate / 50) * 100}%, #e5e7eb ${(avgGrowthRate / 50) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0</span>
                <span>50</span>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-xs text-green-800 dark:text-green-200">
                <strong>Impact:</strong> Higher growth accelerates revenue but may increase acquisition costs.
              </div>
            </div>
          </div>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Scenarios</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                updateConfig('pricePerClient', 39);
                updateConfig('churnRate', 0.05);
                updateGrowthRate(5);
              }}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              🐌 Conservative
            </button>
            <button
              onClick={() => {
                updateConfig('pricePerClient', 49);
                updateConfig('churnRate', 0.03);
                updateGrowthRate(8);
              }}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              📊 Realistic
            </button>
            <button
              onClick={() => {
                updateConfig('pricePerClient', 69);
                updateConfig('churnRate', 0.02);
                updateGrowthRate(15);
              }}
              className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              🚀 Optimistic
            </button>
            <button
              onClick={() => {
                updateConfig('pricePerClient', 99);
                updateConfig('churnRate', 0.01);
                updateGrowthRate(25);
              }}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              🌟 Aggressive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}