import React from 'react';
import { HybridMonthlyData } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/hybridCalculations';

interface HybridPricingTableProps {
  monthlyData: HybridMonthlyData[];
}

export default function HybridPricingTable({ monthlyData }: HybridPricingTableProps) {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Hybrid Pricing Projections</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hybrid pricing data available. Please configure your pricing model.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Hybrid Pricing Monthly Projections</h2>
      </div>
      <div className="card-body p-0">
        <div className="table-container">
          <table className="data-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Month</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Tenants</th>
                <th className="table-header-cell">New</th>
                <th className="table-header-cell">Churned</th>
                <th className="table-header-cell">Total Users</th>
                <th className="table-header-cell">Base Revenue</th>
                <th className="table-header-cell">User Revenue</th>
                <th className="table-header-cell">AI Revenue</th>
                <th className="table-header-cell">Add-on Revenue</th>
                <th className="table-header-cell">Total Revenue</th>
                <th className="table-header-cell">MRR</th>
                <th className="table-header-cell">Expenses</th>
                <th className="table-header-cell">Profit</th>
                <th className="table-header-cell">Cash</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {monthlyData.map((month) => (
                <tr key={month.month} className="table-row">
                  <td className="table-cell font-medium">{month.month}</td>
                  <td className="table-cell">{month.date}</td>
                  <td className="table-cell font-semibold text-primary-600 dark:text-primary-400">
                    {formatNumber(month.tenants)}
                  </td>
                  <td className="table-cell text-success-600 dark:text-success-400">
                    +{month.newTenants}
                  </td>
                  <td className="table-cell text-danger-600 dark:text-danger-400">
                    -{month.churnedTenants}
                  </td>
                  <td className="table-cell font-medium text-blue-600 dark:text-blue-400">
                    {formatNumber(month.totalUsers)}
                  </td>
                  <td className="table-cell text-blue-700 dark:text-blue-300">
                    {formatCurrency(month.baseRevenue)}
                  </td>
                  <td className="table-cell text-green-700 dark:text-green-300">
                    {formatCurrency(month.userRevenue)}
                  </td>
                  <td className="table-cell text-orange-700 dark:text-orange-300">
                    {formatCurrency(month.aiRevenue)}
                  </td>
                  <td className="table-cell text-purple-700 dark:text-purple-300">
                    {formatCurrency(month.addonRevenue)}
                  </td>
                  <td className="table-cell font-bold text-success-700 dark:text-success-300">
                    {formatCurrency(month.totalRevenue)}
                  </td>
                  <td className="table-cell font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(month.mrr)}
                  </td>
                  <td className="table-cell text-danger-700 dark:text-danger-300">
                    {formatCurrency(month.totalExpenses)}
                  </td>
                  <td className={`table-cell font-bold ${
                    month.profit >= 0 ? 'text-success-700 dark:text-success-300' : 'text-danger-700 dark:text-danger-300'
                  }`}>
                    {formatCurrency(month.profit)}
                  </td>
                  <td className={`table-cell font-bold ${
                    month.cashOnHand >= 0 ? 'text-primary-700 dark:text-primary-300' : 'text-danger-700 dark:text-danger-300'
                  }`}>
                    {formatCurrency(month.cashOnHand)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Revenue Composition Summary */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Base Revenue</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.baseRevenue, 0))}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600 dark:text-green-400">User Revenue</div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.userRevenue, 0))}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">AI Revenue</div>
              <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.aiRevenue, 0))}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Add-on Revenue</div>
              <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.addonRevenue, 0))}
              </div>
            </div>
          </div>

          {/* Growth Insights */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Monthly Growth Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Tenant Growth:</span>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {monthlyData[0]?.tenants} → {monthlyData[monthlyData.length - 1]?.tenants} 
                  ({(((monthlyData[monthlyData.length - 1]?.tenants || 0) / (monthlyData[0]?.tenants || 1) - 1) * 100).toFixed(1)}%)
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Revenue Growth:</span>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(monthlyData[0]?.totalRevenue || 0)} → {formatCurrency(monthlyData[monthlyData.length - 1]?.totalRevenue || 0)}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Peak MRR:</span>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(Math.max(...monthlyData.map(m => m.mrr)))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}