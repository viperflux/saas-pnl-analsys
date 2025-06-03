import React from 'react';
import { FinancialData, CalculationResults } from '@/types';
import { exportToCSV, downloadCSV } from '@/lib/calculations';

interface DownloadButtonProps {
  config: FinancialData;
  results: CalculationResults;
}

export default function DownloadButton({ config, results }: DownloadButtonProps) {
  const handleDownload = () => {
    try {
      const csvContent = exportToCSV(config, results);
      const filename = `saas-financial-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(filename, csvContent);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      alert('Failed to download the report. Please try again.');
    }
  };

  const isDataAvailable = results && results.monthlyData && results.monthlyData.length > 0;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📥 Export & Download</h2>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Export Options</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Download your complete financial analysis as a CSV file. The export includes:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
              <li className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                Monthly breakdown of all metrics
              </li>
              <li className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                Revenue, expenses, and profit calculations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                Client growth and churn data
              </li>
              <li className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                Cash flow projections
              </li>
              <li className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                Summary statistics and insights
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">CSV Report</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Compatible with Excel, Google Sheets, and other spreadsheet applications
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={!isDataAvailable}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors ${
                isDataAvailable
                  ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download CSV
            </button>
          </div>

          {!isDataAvailable && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400 dark:text-yellow-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    No data available for export. Please ensure your configuration is complete and calculations have been performed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}