import React from "react";
import { BreakEvenData } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/calculations/calculations";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {entry.name.includes("Users") || entry.name.includes("users")
              ? formatNumber(entry.value)
              : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface BreakEvenAnalysisProps {
  breakEvenData: BreakEvenData[];
}

export default function BreakEvenAnalysis({
  breakEvenData,
}: BreakEvenAnalysisProps) {
  if (!breakEvenData || breakEvenData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Break-Even Analysis</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No break-even data available.
          </div>
        </div>
      </div>
    );
  }

  const breakEvenAchievedMonths = breakEvenData.filter(
    (month) => month.isBreakEven,
  ).length;
  const firstBreakEvenMonth =
    breakEvenData.find((month) => month.isBreakEven)?.month || null;
  const avgRequiredUsers =
    breakEvenData.reduce((sum, month) => sum + month.requiredUsers, 0) / 12;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Break-Even Analysis</h2>
      </div>
      <div className="card-body">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  First Break-Even
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {firstBreakEvenMonth
                    ? `Month ${firstBreakEvenMonth}`
                    : "Not achieved"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 p-4 rounded-lg border border-success-200 dark:border-success-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-success-600 dark:text-success-400">
                  Profitable Months
                </p>
                <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                  {breakEvenAchievedMonths}/12
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Avg Required Users
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatNumber(Math.round(avgRequiredUsers))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Break-Even Point Chart */}
        <div className="chart-container mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Break-Even Point Analysis
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={breakEvenData.map((month) => ({
                month: `Month ${month.month}`,
                actualUsers: month.actualUsers,
                requiredUsers: month.requiredUsers,
                actualRevenue: month.actualRevenue,
                breakEvenRevenue: month.breakEvenRevenue,
                profit: month.isBreakEven ? 1 : 0,
              }))}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f4f8"
                className="dark:stroke-gray-600"
              />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                className="dark:stroke-gray-400"
                fontSize={10}
              />
              <YAxis
                yAxisId="users"
                orientation="left"
                stroke="#64748b"
                className="dark:stroke-gray-400"
                fontSize={10}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                stroke="#64748b"
                className="dark:stroke-gray-400"
                fontSize={10}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Break-even threshold line */}
              <Line
                yAxisId="users"
                type="monotone"
                dataKey="requiredUsers"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Required Users"
                dot={false}
              />

              {/* Actual users line */}
              <Line
                yAxisId="users"
                type="monotone"
                dataKey="actualUsers"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Actual Users"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Revenue lines */}
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="breakEvenRevenue"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Break-Even Revenue"
                dot={false}
              />

              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="actualRevenue"
                stroke="#22c55e"
                strokeWidth={3}
                name="Actual Revenue"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Break-Even Table */}
        <div className="table-container">
          <table className="data-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Month</th>
                <th className="table-header-cell">Actual Users</th>
                <th className="table-header-cell">Required Users</th>
                <th className="table-header-cell">User Gap</th>
                <th className="table-header-cell">Actual Revenue</th>
                <th className="table-header-cell">Break-Even Revenue</th>
                <th className="table-header-cell">Progress</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {breakEvenData.map((month) => (
                <tr key={month.month} className="table-row">
                  <td className="table-cell font-medium">{month.month}</td>
                  <td className="table-cell font-semibold text-primary-600 dark:text-primary-400">
                    {formatNumber(month.actualUsers)}
                  </td>
                  <td className="table-cell font-semibold text-orange-600 dark:text-orange-400">
                    {formatNumber(month.requiredUsers)}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`font-medium ${
                        month.actualUsers >= month.requiredUsers
                          ? "text-success-600 dark:text-success-400"
                          : "text-danger-600 dark:text-danger-400"
                      }`}
                    >
                      {month.actualUsers >= month.requiredUsers
                        ? `+${month.actualUsers - month.requiredUsers}`
                        : `${month.actualUsers - month.requiredUsers}`}
                    </span>
                  </td>
                  <td className="table-cell font-medium text-success-700 dark:text-success-300">
                    {formatCurrency(month.actualRevenue)}
                  </td>
                  <td className="table-cell text-gray-600 dark:text-gray-400">
                    {formatCurrency(month.breakEvenRevenue)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              month.percentToBreakEven >= 100
                                ? "bg-success-600 dark:bg-success-500"
                                : month.percentToBreakEven >= 75
                                  ? "bg-yellow-500 dark:bg-yellow-400"
                                  : "bg-danger-500 dark:bg-danger-400"
                            }`}
                            style={{
                              width: `${Math.min(month.percentToBreakEven, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12">
                        {month.percentToBreakEven.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        month.isBreakEven
                          ? "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                          : "bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400"
                      }`}
                    >
                      {month.isBreakEven ? "✅ Profitable" : "❌ Loss"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Break-Even Insights
          </h4>
          <div className="space-y-3 text-sm">
            {firstBreakEvenMonth && (
              <div className="flex items-start">
                <span className="text-success-500 dark:text-success-400 mr-2 mt-0.5">
                  •
                </span>
                <span className="text-blue-800 dark:text-blue-200">
                  Your business first achieves break-even in month{" "}
                  {firstBreakEvenMonth}. This is{" "}
                  {firstBreakEvenMonth <= 6
                    ? "relatively quick"
                    : "taking some time"}
                  .
                </span>
              </div>
            )}

            {!firstBreakEvenMonth && (
              <div className="flex items-start">
                <span className="text-danger-500 dark:text-danger-400 mr-2 mt-0.5">
                  •
                </span>
                <span className="text-blue-800 dark:text-blue-200">
                  Break-even is not achieved within 12 months. Consider
                  increasing prices, reducing costs, or accelerating client
                  acquisition.
                </span>
              </div>
            )}

            <div className="flex items-start">
              <span className="text-primary-500 dark:text-primary-400 mr-2 mt-0.5">
                •
              </span>
              <span className="text-blue-800 dark:text-blue-200">
                On average, you need {Math.round(avgRequiredUsers)} users
                per month to break even. Your current trajectory shows{" "}
                {breakEvenAchievedMonths} profitable months out of 12.
              </span>
            </div>

            {breakEvenAchievedMonths < 6 && (
              <div className="flex items-start">
                <span className="text-warning-500 dark:text-warning-400 mr-2 mt-0.5">
                  •
                </span>
                <span className="text-blue-800 dark:text-blue-200">
                  Less than half of your months are profitable. Focus on client
                  retention (reducing churn) and optimizing your pricing
                  strategy.
                </span>
              </div>
            )}

            {breakEvenAchievedMonths >= 8 && (
              <div className="flex items-start">
                <span className="text-success-500 dark:text-success-400 mr-2 mt-0.5">
                  •
                </span>
                <span className="text-blue-800 dark:text-blue-200">
                  Strong performance! Most of your months are profitable.
                  Consider strategies for scaling and growth acceleration.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
