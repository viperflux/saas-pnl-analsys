import React from 'react';
import { FinancialData } from '@/types';

interface ClientInputFormProps {
  config: FinancialData;
  onChange: (config: FinancialData) => void;
}

export default function ClientInputForm({ config, onChange }: ClientInputFormProps) {
  const updateConfig = (field: keyof FinancialData, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const updateFixedCosts = (field: keyof FinancialData['monthlyFixedCosts'], value: number) => {
    onChange({
      ...config,
      monthlyFixedCosts: {
        ...config.monthlyFixedCosts,
        [field]: value
      }
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">💼 Basic Configuration</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Starting Cash */}
          <div>
            <label htmlFor="startingCash" className="form-label">
              Starting Cash Balance ($)
            </label>
            <input
              id="startingCash"
              type="number"
              value={config.startingCash}
              onChange={(e) => updateConfig('startingCash', parseFloat(e.target.value) || 0)}
              className="form-input"
              placeholder="0"
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="form-label">
              Starting Date
            </label>
            <input
              id="startDate"
              type="date"
              value={config.startDate}
              onChange={(e) => updateConfig('startDate', e.target.value)}
              className="form-input"
            />
          </div>

          {/* Initial Clients */}
          <div>
            <label htmlFor="initialUsers" className="form-label">
              Initial Users
            </label>
            <input
              id="initialUsers"
              type="number"
              min="0"
              value={config.initialUsers}
              onChange={(e) => updateConfig('initialUsers', parseInt(e.target.value) || 0)}
              className="form-input"
              placeholder="5"
            />
          </div>

          {/* Price Per Client */}
          <div>
            <label htmlFor="pricePerUser" className="form-label">
              Monthly Price per User ($)
            </label>
            <input
              id="pricePerUser"
              type="number"
              min="0"
              step="0.01"
              value={config.pricePerUser}
              onChange={(e) => updateConfig('pricePerUser', parseFloat(e.target.value) || 0)}
              className="form-input"
              placeholder="49"
            />
          </div>

          {/* Churn Rate */}
          <div>
            <label htmlFor="churnRate" className="form-label">
              Monthly Churn Rate (%)
            </label>
            <input
              id="churnRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={config.churnRate * 100}
              onChange={(e) => updateConfig('churnRate', (parseFloat(e.target.value) || 0) / 100)}
              className="form-input"
              placeholder="3"
            />
          </div>

          {/* OpenAI Cost */}
          <div>
            <label htmlFor="marketingSpend" className="form-label">
              Monthly Marketing Spend ($)
            </label>
            <input
              id="marketingSpend"
              type="number"
              min="0"
              step="50"
              value={config.monthlyFixedCosts.marketing || 0}
              onChange={(e) => updateConfig('monthlyFixedCosts', {...config.monthlyFixedCosts, marketing: parseFloat(e.target.value) || 0})}
              className="form-input"
              placeholder="2000"
            />
          </div>
        </div>

        {/* Fixed Costs Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">🏢 Monthly Fixed Costs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="infraCost" className="form-label">
                Infrastructure ($)
              </label>
              <input
                id="infraCost"
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.infra}
                onChange={(e) => updateFixedCosts('infra', parseFloat(e.target.value) || 0)}
                className="form-input"
                placeholder="1588.60"
              />
            </div>

            <div>
              <label htmlFor="salaryCost" className="form-label">
                Salaries ($)
              </label>
              <input
                id="salaryCost"
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.salary}
                onChange={(e) => updateFixedCosts('salary', parseFloat(e.target.value) || 0)}
                className="form-input"
                placeholder="3000"
              />
            </div>

            <div>
              <label htmlFor="supportCost" className="form-label">
                Support Team ($)
              </label>
              <input
                id="supportCost"
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.support}
                onChange={(e) => updateFixedCosts('support', parseFloat(e.target.value) || 0)}
                className="form-input"
                placeholder="500"
              />
            </div>

            <div>
              <label htmlFor="wagesCost" className="form-label">
                Other Wages ($)
              </label>
              <input
                id="wagesCost"
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.wages}
                onChange={(e) => updateFixedCosts('wages', parseFloat(e.target.value) || 0)}
                className="form-input"
                placeholder="1000"
              />
            </div>

            <div>
              <label htmlFor="hostingCost" className="form-label">
                Hosting & Services ($)
              </label>
              <input
                id="hostingCost"
                type="number"
                min="0"
                step="0.01"
                value={config.monthlyFixedCosts.hosting}
                onChange={(e) => updateFixedCosts('hosting', parseFloat(e.target.value) || 0)}
                className="form-input"
                placeholder="1600"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Fixed Costs</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${(
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