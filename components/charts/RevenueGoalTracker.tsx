import React from "react";
import { RevenueGoalData, MonthlyData } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/calculations/calculations";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface RevenueGoalTrackerProps {
  revenueGoalData: RevenueGoalData;
  monthlyData: MonthlyData[];
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
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueGoalTracker({
  revenueGoalData,
  monthlyData,
}: RevenueGoalTrackerProps) {
  if (!revenueGoalData || !monthlyData) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 $1M Revenue Goal Tracker</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No revenue goal data available.
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data with cumulative revenue and goal line
  const chartData = monthlyData.map((month, index) => {
    const cumulativeRevenue = monthlyData
      .slice(0, index + 1)
      .reduce((sum, m) => sum + m.revenue, 0);

    const goalProgress =
      (revenueGoalData.requiredAnnualRevenue / 12) * (index + 1);

    return {
      month: month.date,
      monthlyRevenue: month.revenue,
      cumulativeRevenue,
      goalProgress,
      projectedRevenue:
        (revenueGoalData.projectedAnnualRevenue / 12) * (index + 1),
    };
  });

  const progressColor =
    revenueGoalData.progressPercentage >= 100
      ? "success"
      : revenueGoalData.progressPercentage >= 75
        ? "warning"
        : "danger";

  return (
    <div className="space-y-6">
      {/* Goal Overview Cards */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 $1M Revenue Goal Tracker</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    Current Annual Revenue
                  </p>
                  <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                    {formatCurrency(revenueGoalData.currentAnnualRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Projected Annual
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(revenueGoalData.projectedAnnualRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Clients Needed for Goal
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {formatNumber(revenueGoalData.requiredClientsForGoal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Months to Goal
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {revenueGoalData.monthsToReachGoal || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Progress to $1M Goal
              </h3>
              <span
                className={`text-sm font-medium ${
                  progressColor === "success"
                    ? "text-success-600 dark:text-success-400"
                    : progressColor === "warning"
                      ? "text-warning-600 dark:text-warning-400"
                      : "text-danger-600 dark:text-danger-400"
                }`}
              >
                {revenueGoalData.progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  progressColor === "success"
                    ? "bg-success-600 dark:bg-success-500"
                    : progressColor === "warning"
                      ? "bg-warning-500 dark:bg-warning-400"
                      : "bg-danger-500 dark:bg-danger-400"
                }`}
                style={{
                  width: `${Math.min(revenueGoalData.progressPercentage, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>$0</span>
              <span>$1,000,000</span>
            </div>
          </div>

          {/* Additional Clients Needed */}
          {revenueGoalData.additionalClientsNeeded > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">
                    📈
                  </span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Growth Required
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You need{" "}
                    <strong>
                      {formatNumber(revenueGoalData.additionalClientsNeeded)}{" "}
                      additional clients per month
                    </strong>{" "}
                    on average to reach your $1M annual revenue goal.
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Monthly revenue target:{" "}
                    <strong>
                      {formatCurrency(revenueGoalData.monthlyGoalRevenue)}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Trajectory Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Revenue Trajectory vs $1M Goal
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f4f8"
              className="dark:stroke-gray-600"
            />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              className="dark:stroke-gray-400"
              fontSize={12}
            />
            <YAxis
              stroke="#64748b"
              className="dark:stroke-gray-400"
              fontSize={12}
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
              name="Actual Cumulative"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Projected revenue */}
            <Line
              type="monotone"
              dataKey="projectedRevenue"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="3 3"
              name="Projected Track"
              dot={false}
            />

            {/* Reference line at $1M */}
            <ReferenceLine y={1000000} stroke="#ef4444" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Revenue vs Goal Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          💰 Monthly Revenue vs Goal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
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

            <Area
              type="monotone"
              dataKey="monthlyRevenue"
              stroke="#8b5cf6"
              fill="#ddd6fe"
              fillOpacity={0.6}
              name="Monthly Revenue"
              strokeWidth={2}
            />

            <ReferenceLine
              y={revenueGoalData.monthlyGoalRevenue}
              stroke="#ef4444"
              strokeDasharray="2 2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="card">
        <div className="card-body">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              $1M Revenue Goal Insights
            </h4>
            <div className="space-y-3 text-sm">
              {revenueGoalData.progressPercentage >= 100 && (
                <div className="flex items-start">
                  <span className="text-success-500 dark:text-success-400 mr-2 mt-0.5">
                    •
                  </span>
                  <span className="text-blue-800 dark:text-blue-200">
                    Congratulations! You've already achieved your $1M annual
                    revenue goal with{" "}
                    {formatCurrency(revenueGoalData.currentAnnualRevenue)}.
                  </span>
                </div>
              )}

              {revenueGoalData.progressPercentage < 100 &&
                revenueGoalData.progressPercentage >= 75 && (
                  <div className="flex items-start">
                    <span className="text-success-500 dark:text-success-400 mr-2 mt-0.5">
                      •
                    </span>
                    <span className="text-blue-800 dark:text-blue-200">
                      Great progress! You're{" "}
                      {revenueGoalData.progressPercentage.toFixed(1)}% of the
                      way to your $1M goal. Only{" "}
                      {formatCurrency(
                        1000000 - revenueGoalData.currentAnnualRevenue,
                      )}{" "}
                      to go.
                    </span>
                  </div>
                )}

              {revenueGoalData.progressPercentage < 75 &&
                revenueGoalData.progressPercentage >= 25 && (
                  <div className="flex items-start">
                    <span className="text-warning-500 dark:text-warning-400 mr-2 mt-0.5">
                      •
                    </span>
                    <span className="text-blue-800 dark:text-blue-200">
                      You're making steady progress at{" "}
                      {revenueGoalData.progressPercentage.toFixed(1)}% of your
                      $1M goal. Focus on client acquisition and retention to
                      accelerate growth.
                    </span>
                  </div>
                )}

              {revenueGoalData.progressPercentage < 25 && (
                <div className="flex items-start">
                  <span className="text-danger-500 dark:text-danger-400 mr-2 mt-0.5">
                    •
                  </span>
                  <span className="text-blue-800 dark:text-blue-200">
                    You need significant growth to reach $1M. Consider
                    strategies like pricing optimization, market expansion, or
                    product enhancement.
                  </span>
                </div>
              )}

              {revenueGoalData.monthsToReachGoal &&
                revenueGoalData.monthsToReachGoal <= 24 && (
                  <div className="flex items-start">
                    <span className="text-primary-500 dark:text-primary-400 mr-2 mt-0.5">
                      •
                    </span>
                    <span className="text-blue-800 dark:text-blue-200">
                      Based on current trajectory, you could reach $1M in
                      approximately {revenueGoalData.monthsToReachGoal} months
                      if growth continues at this pace.
                    </span>
                  </div>
                )}

              <div className="flex items-start">
                <span className="text-purple-500 dark:text-purple-400 mr-2 mt-0.5">
                  •
                </span>
                <span className="text-blue-800 dark:text-blue-200">
                  To hit your monthly target of{" "}
                  {formatCurrency(revenueGoalData.monthlyGoalRevenue)}, you need
                  approximately {revenueGoalData.requiredClientsForGoal} clients
                  per month.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
