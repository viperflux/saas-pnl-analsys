import React from 'react';
import { FinancialData } from '@/types';

interface GrowthPatternEditorProps {
  config: FinancialData;
  onChange: (config: FinancialData) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function GrowthPatternEditor({ config, onChange }: GrowthPatternEditorProps) {
  const updateSeasonalGrowth = (index: number, value: number) => {
    const newGrowth = [...config.seasonalGrowth];
    newGrowth[index] = value;
    onChange({ ...config, seasonalGrowth: newGrowth });
  };

  const updateCapitalPurchase = (index: number, value: number) => {
    const newPurchases = [...config.capitalPurchases];
    newPurchases[index] = value;
    onChange({ ...config, capitalPurchases: newPurchases });
  };

  const setGrowthPattern = (pattern: 'linear' | 'seasonal' | 'aggressive') => {
    let newGrowth: number[];
    
    switch (pattern) {
      case 'linear':
        newGrowth = Array(12).fill(8);
        break;
      case 'seasonal':
        newGrowth = [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3];
        break;
      case 'aggressive':
        newGrowth = [15, 18, 20, 12, 14, 16, 18, 20, 15, 12, 10, 8];
        break;
      default:
        return;
    }
    
    onChange({ ...config, seasonalGrowth: newGrowth });
  };

  const totalGrowth = config.seasonalGrowth.reduce((sum, growth) => sum + growth, 0);
  const avgGrowth = totalGrowth / 12;

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h2 className="card-title">📈 Growth Pattern & Capital Purchases</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setGrowthPattern('linear')}
              className="btn-secondary text-xs"
            >
              Linear
            </button>
            <button
              onClick={() => setGrowthPattern('seasonal')}
              className="btn-secondary text-xs"
            >
              Seasonal
            </button>
            <button
              onClick={() => setGrowthPattern('aggressive')}
              className="btn-secondary text-xs"
            >
              Aggressive
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {/* Growth Pattern Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Monthly New Clients</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold">{totalGrowth}</span> | 
              Avg: <span className="font-semibold">{avgGrowth.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {config.seasonalGrowth.map((growth, index) => (
              <div key={index} className="relative">
                <label className="form-label text-center">
                  {MONTH_NAMES[index]}
                </label>
                <input
                  type="number"
                  min="0"
                  value={growth}
                  onChange={(e) => updateSeasonalGrowth(index, parseInt(e.target.value) || 0)}
                  className="form-input text-center"
                />
                <div className="mt-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((growth / 25) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capital Purchases Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">One-time Capital Purchases ($)</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold">
                ${config.capitalPurchases.reduce((sum, purchase) => sum + purchase, 0).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {config.capitalPurchases.map((purchase, index) => (
              <div key={index} className="relative">
                <label className="form-label text-center">
                  {MONTH_NAMES[index]}
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={purchase}
                  onChange={(e) => updateCapitalPurchase(index, parseFloat(e.target.value) || 0)}
                  className="form-input text-center"
                  placeholder="0"
                />
                {purchase > 0 && (
                  <div className="mt-1 text-xs text-center text-primary-600 dark:text-primary-400 font-medium">
                    ${purchase.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 dark:text-yellow-400">💡</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Tips:</strong> Capital purchases are one-time expenses that affect cash flow but not ongoing profitability. 
                  Common examples include equipment, software licenses, office setup, or initial marketing campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}