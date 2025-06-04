import React from "react";
import { MonthlyData } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/calculations/calculations";

interface CashFlowTableProps {
  monthlyData: MonthlyData[];
}

export default function CashFlowTable({ monthlyData }: CashFlowTableProps) {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Monthly Cash Flow & P&L</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No data available. Please check your configuration.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Monthly Cash Flow & P&L</h2>
      </div>
      <div className="card-body p-0">
        <div className="table-container">
          <table className="data-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Month</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Users</th>
                <th className="table-header-cell">New</th>
                <th className="table-header-cell">Churned</th>
                <th className="table-header-cell">Revenue</th>
                <th className="table-header-cell">Expenses</th>
                <th className="table-header-cell">Profit</th>
                <th className="table-header-cell">Cash</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month) => (
                <tr key={month.month} className="table-row">
                  <td className="table-cell font-medium">{month.month}</td>
                  <td className="table-cell">{month.date}</td>
                  <td className="table-cell font-semibold text-primary-600 dark:text-primary-400">
                    {formatNumber(month.users)}
                  </td>
                  <td className="table-cell text-success-600 dark:text-success-400">
                    +{formatNumber(month.newUsers)}
                  </td>
                  <td className="table-cell text-danger-600 dark:text-danger-400">
                    -{formatNumber(month.churnedUsers)}
                  </td>
                  <td className="table-cell font-medium text-success-700 dark:text-success-300">
                    {formatCurrency(month.revenue)}
                  </td>
                  <td className="table-cell font-medium text-danger-700 dark:text-danger-300">
                    {formatCurrency(month.totalExpenses)}
                  </td>
                  <td
                    className={`table-cell font-bold ${
                      month.profit >= 0
                        ? "text-success-700 dark:text-success-300"
                        : "text-danger-700 dark:text-danger-300"
                    }`}
                  >
                    {formatCurrency(month.profit)}
                  </td>
                  <td
                    className={`table-cell font-bold ${
                      month.cashOnHand >= 0
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-danger-700 dark:text-danger-300"
                    }`}
                  >
                    {formatCurrency(month.cashOnHand)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cash Flow Alerts */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {monthlyData.some((month) => month.cashOnHand < 0) && (
            <div className="alert alert-danger mb-4">
              <div className="flex items-start">
                <span className="text-danger-600 dark:text-danger-400 mr-2">
                  ⚠️
                </span>
                <div>
                  <strong>Cash Flow Warning!</strong>
                  <p className="mt-1">
                    Your business will have negative cash flow in{" "}
                    {monthlyData
                      .filter((month) => month.cashOnHand < 0)
                      .map((month) => month.date)
                      .join(", ")}
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {monthlyData.some((month) => month.profit >= 0) && (
            <div className="alert alert-success">
              <div className="flex items-start">
                <span className="text-success-600 dark:text-success-400 mr-2">
                  ✅
                </span>
                <div>
                  <strong>Profitable Months Detected!</strong>
                  <p className="mt-1">
                    Your business shows profitability in{" "}
                    {monthlyData.filter((month) => month.profit >= 0).length}{" "}
                    out of 12 months.
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
