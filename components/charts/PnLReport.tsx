import React from 'react';
import { CalculationResults } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/calculations';

interface PnLReportProps {
  results: CalculationResults;
}

export default function PnLReport({ results }: PnLReportProps) {
  if (!results || !results.monthlyData) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📈 P&L Summary Report</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No results available. Please check your configuration.
          </div>
        </div>
      </div>
    );
  }

  const profitableMonths = results.monthlyData.filter(month => month.profit > 0).length;
  const positiveMargin = results.totalRevenue > 0 ? (results.totalProfit / results.totalRevenue) * 100 : 0;
  const runwayMonths = results.finalCash < 0 ? 
    results.monthlyData.findIndex(month => month.cashOnHand < 0) + 1 : 
    null;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📈 P&L Summary Report</h2>
      </div>
      <div className="card-body">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Revenue</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {formatCurrency(results.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 p-4 rounded-lg border border-danger-200 dark:border-danger-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💸</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-danger-600 dark:text-danger-400">Total Expenses</p>
                <p className="text-2xl font-bold text-danger-900 dark:text-danger-100">
                  {formatCurrency(results.totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-r p-4 rounded-lg border ${
            results.totalProfit >= 0 
              ? 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700' 
              : 'from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-danger-200 dark:border-danger-700'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{results.totalProfit >= 0 ? '📈' : '📉'}</span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  results.totalProfit >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                }`}>
                  Net Profit
                </p>
                <p className={`text-2xl font-bold ${
                  results.totalProfit >= 0 ? 'text-success-900 dark:text-success-100' : 'text-danger-900 dark:text-danger-100'
                }`}>
                  {formatCurrency(results.totalProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-r p-4 rounded-lg border ${
            results.finalCash >= 0 
              ? 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700' 
              : 'from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-danger-200 dark:border-danger-700'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{results.finalCash >= 0 ? '🏦' : '🚨'}</span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  results.finalCash >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-danger-600 dark:text-danger-400'
                }`}>
                  Final Cash
                </p>
                <p className={`text-2xl font-bold ${
                  results.finalCash >= 0 ? 'text-primary-900 dark:text-primary-100' : 'text-danger-900 dark:text-danger-100'
                }`}>
                  {formatCurrency(results.finalCash)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Profitability</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Profitable Months:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{profitableMonths}/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Profit Margin:</span>
                <span className={`font-semibold ${positiveMargin >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                  {positiveMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Avg Monthly Profit:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(results.avgMonthlyProfit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Growth Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Max Clients:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatNumber(results.maxClients)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Break-even Month:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {results.breakEvenMonth ? `Month ${results.breakEvenMonth}` : 'Not achieved'}
                </span>
              </div>
              {runwayMonths && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Cash Runway:</span>
                  <span className="font-semibold text-danger-600 dark:text-danger-400">{runwayMonths} months</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Financial Health</h4>
            <div className="space-y-2">
              {results.totalProfit >= 0 ? (
                <div className="flex items-center text-success-600 dark:text-success-400">
                  <span className="mr-2">✅</span>
                  <span className="text-sm">Profitable overall</span>
                </div>
              ) : (
                <div className="flex items-center text-danger-600 dark:text-danger-400">
                  <span className="mr-2">❌</span>
                  <span className="text-sm">Loss-making overall</span>
                </div>
              )}
              
              {results.finalCash >= 0 ? (
                <div className="flex items-center text-success-600 dark:text-success-400">
                  <span className="mr-2">✅</span>
                  <span className="text-sm">Positive cash flow</span>
                </div>
              ) : (
                <div className="flex items-center text-danger-600 dark:text-danger-400">
                  <span className="mr-2">⚠️</span>
                  <span className="text-sm">Negative cash flow</span>
                </div>
              )}
              
              {profitableMonths >= 6 ? (
                <div className="flex items-center text-success-600 dark:text-success-400">
                  <span className="mr-2">✅</span>
                  <span className="text-sm">Mostly profitable</span>
                </div>
              ) : (
                <div className="flex items-center text-warning-600 dark:text-warning-400">
                  <span className="mr-2">⚠️</span>
                  <span className="text-sm">Inconsistent profitability</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Key Insights & Recommendations
          </h4>
          <div className="space-y-3 text-sm">
            {results.totalProfit < 0 && (
              <div className="flex items-start">
                <span className="text-danger-500 dark:text-danger-400 mr-2 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  Your business shows a net loss of {formatCurrency(Math.abs(results.totalProfit))} over 12 months. 
                  Consider increasing prices, reducing costs, or improving client retention.
                </span>
              </div>
            )}
            
            {results.breakEvenMonth && results.breakEvenMonth <= 6 && (
              <div className="flex items-start">
                <span className="text-success-500 dark:text-success-400 mr-2 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  Great! You achieve break-even by month {results.breakEvenMonth}, which is relatively quick.
                </span>
              </div>
            )}
            
            {results.breakEvenMonth && results.breakEvenMonth > 6 && (
              <div className="flex items-start">
                <span className="text-warning-500 dark:text-warning-400 mr-2 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  Break-even occurs in month {results.breakEvenMonth}. Consider strategies to accelerate profitability.
                </span>
              </div>
            )}
            
            {!results.breakEvenMonth && (
              <div className="flex items-start">
                <span className="text-danger-500 dark:text-danger-400 mr-2 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  Break-even is not achieved within 12 months. Review your business model fundamentals.
                </span>
              </div>
            )}
            
            {results.finalCash < 0 && (
              <div className="flex items-start">
                <span className="text-danger-500 dark:text-danger-400 mr-2 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  You'll need additional funding or cost reduction to maintain operations beyond month {runwayMonths}.
                </span>
              </div>
            )}
            
            {positiveMargin > 20 && (
              <div className="flex items-start">
                <span className="text-success-500 dark:text-success-400 mr-2 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  Excellent profit margin of {positiveMargin.toFixed(1)}%! Your unit economics are strong.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}