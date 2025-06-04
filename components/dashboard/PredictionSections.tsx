import React from "react";
import { CalculationResults, FinancialData } from "@/types";
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
  ReferenceLine,
  Cell,
} from "recharts";

interface PredictionSectionsProps {
  results: CalculationResults;
  config: FinancialData;
}

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

export default function PredictionSections({
  results,
  config,
}: PredictionSectionsProps) {
  if (!results || !results.monthlyData) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-body text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              No prediction data available.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare break-even chart data
  const breakEvenChartData = results.monthlyData.map((month, index) => {
    const breakEvenData = results.breakEvenData[index];
    return {
      month: month.date,
      actualUsers: month.users,
      requiredUsers: breakEvenData?.requiredUsers || 0,
      profit: month.profit,
      isBreakEven: month.profit >= 0,
    };
  });

  // Prepare $1M revenue chart data
  const revenueChartData = results.monthlyData.map((month, index) => {
    const cumulativeRevenue = results.monthlyData
      .slice(0, index + 1)
      .reduce((sum, m) => sum + m.revenue, 0);

    const goalProgress = (1000000 / 12) * (index + 1);

    return {
      month: month.date,
      monthlyRevenue: month.revenue,
      cumulativeRevenue,
      goalProgress,
      targetMonthly: 1000000 / 12,
    };
  });

  const breakEvenMonth = results.breakEvenMonth;
  const timeToMillion = results.revenueGoalData.monthsToReachGoal;
  const progressToMillion = results.revenueGoalData.progressPercentage;

  return (
    <div className="space-y-8">
      {/* When Will I Break Even Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 When Will I Break Even?</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Break-even Summary */}
            <div className="space-y-6">
              <div
                className={`p-6 rounded-lg border-2 ${
                  breakEvenMonth
                    ? "bg-success-50 dark:bg-success-900/20 border-success-300 dark:border-success-700"
                    : "bg-danger-50 dark:bg-danger-900/20 border-danger-300 dark:border-danger-700"
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {breakEvenMonth ? "🎉" : "⚠️"}
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      breakEvenMonth
                        ? "text-success-800 dark:text-success-200"
                        : "text-danger-800 dark:text-danger-200"
                    }`}
                  >
                    {breakEvenMonth
                      ? `Month ${breakEvenMonth}`
                      : "Not Achieved"}
                  </h3>
                  <p
                    className={`text-sm ${
                      breakEvenMonth
                        ? "text-success-700 dark:text-success-300"
                        : "text-danger-700 dark:text-danger-300"
                    }`}
                  >
                    {breakEvenMonth
                      ? `You'll break even in ${breakEvenMonth} month${breakEvenMonth > 1 ? "s" : ""}`
                      : "Break-even not achieved within 12 months"}
                  </p>
                </div>
              </div>

              {/* Break-even Key Metrics */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Avg Required Users/Month
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatNumber(
                        Math.round(
                          results.breakEvenData.reduce(
                            (sum, m) => sum + m.requiredUsers,
                            0,
                          ) / 12,
                        ),
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Profitable Months
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {
                        results.breakEvenData.filter((m) => m.isBreakEven)
                          .length
                      }
                      /12
                    </span>
                  </div>
                </div>

                {breakEvenMonth && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Users Needed at Break-even
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatNumber(
                          results.breakEvenData[breakEvenMonth - 1]
                            ?.actualUsers || 0,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Quick Improvements
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <div>
                    • Increase price by $10 → Break-even ~
                    {Math.max(1, (breakEvenMonth || 13) - 2)} months earlier
                  </div>
                  <div>
                    • Reduce churn by 1% →{" "}
                    {formatNumber(Math.round(results.maxUsers * 0.01 * 12))}{" "}
                    more retained Users/year
                  </div>
                  <div>
                    • Add 5 users/month →{" "}
                    {formatCurrency(5 * config.pricePerUser * 12)} extra annual
                    revenue
                  </div>
                </div>
              </div>
            </div>

            {/* Break-even Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📊 Actual vs Required Users
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={breakEvenChartData}>
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
                    stroke="#64748b"
                    className="dark:stroke-gray-400"
                    fontSize={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="requiredUsers"
                    fill="#ef4444"
                    name="Required Users"
                    opacity={0.7}
                  />
                  <Bar dataKey="actualUsers" name="Actual Users">
                    {breakEvenChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isBreakEven ? "#22c55e" : "#f59e0b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* When Will I Reach $1M Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">💰 When Will I Reach $1M Revenue?</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* $1M Summary */}
            <div className="space-y-6">
              <div
                className={`p-6 rounded-lg border-2 ${
                  progressToMillion >= 100
                    ? "bg-success-50 dark:bg-success-900/20 border-success-300 dark:border-success-700"
                    : progressToMillion >= 50
                      ? "bg-warning-50 dark:bg-warning-900/20 border-warning-300 dark:border-warning-700"
                      : "bg-danger-50 dark:bg-danger-900/20 border-danger-300 dark:border-danger-700"
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {progressToMillion >= 100
                      ? "🏆"
                      : progressToMillion >= 50
                        ? "📈"
                        : "🎯"}
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      progressToMillion >= 100
                        ? "text-success-800 dark:text-success-200"
                        : progressToMillion >= 50
                          ? "text-warning-800 dark:text-warning-200"
                          : "text-danger-800 dark:text-danger-200"
                    }`}
                  >
                    {progressToMillion >= 100
                      ? "Goal Achieved!"
                      : timeToMillion
                        ? `${timeToMillion} months`
                        : "Goal Not Reached"}
                  </h3>
                  <p
                    className={`text-sm ${
                      progressToMillion >= 100
                        ? "text-success-700 dark:text-success-300"
                        : progressToMillion >= 50
                          ? "text-warning-700 dark:text-warning-300"
                          : "text-danger-700 dark:text-danger-300"
                    }`}
                  >
                    {progressToMillion >= 100
                      ? `You've exceeded $1M with ${formatCurrency(results.revenueGoalData.currentAnnualRevenue)}`
                      : `${progressToMillion.toFixed(1)}% of the way to $1M goal`}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Revenue Progress
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(
                      results.revenueGoalData.currentAnnualRevenue,
                    )}{" "}
                    / $1M
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      progressToMillion >= 100
                        ? "bg-success-600 dark:bg-success-500"
                        : progressToMillion >= 50
                          ? "bg-warning-500 dark:bg-warning-400"
                          : "bg-danger-500 dark:bg-danger-400"
                    }`}
                    style={{ width: `${Math.min(progressToMillion, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* $1M Key Metrics */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Monthly Target Revenue
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(
                        results.revenueGoalData.monthlyGoalRevenue,
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Users Needed for Goal
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatNumber(
                        results.revenueGoalData.requiredUsersForGoal,
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Additional Users Needed
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      +
                      {formatNumber(
                        results.revenueGoalData.additionalUsersNeeded,
                      )}
                      /month
                    </span>
                  </div>
                </div>
              </div>

              {/* Acceleration Strategies */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                  <span className="mr-2">🚀</span>
                  Acceleration Strategies
                </h4>
                <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                  <div>
                    • Double price to ${config.pricePerUser * 2} → Reach goal{" "}
                    {timeToMillion
                      ? Math.max(1, Math.round(timeToMillion / 2))
                      : 6}{" "}
                    months faster
                  </div>
                  <div>
                    • Reduce churn to 1% → Keep{" "}
                    {formatNumber(
                      Math.round(
                        results.maxUsers * (config.churnRate - 0.01) * 12,
                      ),
                    )}{" "}
                    more Users/year
                  </div>
                  <div>
                    • Add enterprise tier at $200/month → Need fewer total Users
                  </div>
                </div>
              </div>
            </div>

            {/* $1M Revenue Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📈 Revenue Trajectory vs $1M Goal
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
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
                    stroke="#64748b"
                    className="dark:stroke-gray-400"
                    fontSize={10}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Goal line */}
                  <Line
                    type="monotone"
                    dataKey="goalProgress"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="$1M Goal Track"
                    dot={false}
                  />

                  {/* Actual cumulative revenue */}
                  <Line
                    type="monotone"
                    dataKey="cumulativeRevenue"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Cumulative Revenue"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />

                  {/* Reference line at $1M */}
                  <ReferenceLine
                    y={1000000}
                    stroke="#ef4444"
                    strokeDasharray="2 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
