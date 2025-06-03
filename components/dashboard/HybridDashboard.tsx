import React from "react";
import { HybridCalculationResults, HybridMonthlyData } from "@/types";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/lib/calculations/hybridCalculations";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";

interface HybridDashboardProps {
  results: HybridCalculationResults;
  chartData: any[];
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

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
            {entry.name.includes("Tenants") || entry.name.includes("Users")
              ? formatNumber(entry.value)
              : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function HybridDashboard({
  results,
  chartData,
}: HybridDashboardProps) {
  if (!results || !results.monthlyData) {
    return (
      <div className="card">
        <div className="card-body text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            No hybrid pricing data available.
          </div>
        </div>
      </div>
    );
  }

  // Prepare revenue composition data for pie chart
  const revenueCompositionData = [
    {
      name: "Base Revenue",
      value: results.revenueComposition.base,
      color: "#3b82f6",
    },
    {
      name: "User Revenue",
      value: results.revenueComposition.users,
      color: "#22c55e",
    },
    {
      name: "AI Revenue",
      value: results.revenueComposition.ai,
      color: "#f59e0b",
    },
    {
      name: "Add-on Revenue",
      value: results.revenueComposition.addons,
      color: "#8b5cf6",
    },
  ].filter((item) => item.value > 0);

  // Prepare stacked revenue data
  const stackedRevenueData = chartData.map((month) => ({
    month: month.month,
    baseRevenue: month.baseRevenue,
    userRevenue: month.userRevenue,
    aiRevenue: month.aiRevenue,
    addonRevenue: month.addonRevenue,
    totalRevenue: month.totalRevenue,
  }));

  return (
    <div className="space-y-8">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(results.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Peak MRR
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(results.peakMRR)}
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
                Max Tenants
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatNumber(results.maxTenants)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`bg-gradient-to-r p-4 rounded-lg border ${
            results.totalProfit >= 0
              ? "from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700"
              : "from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-danger-200 dark:border-danger-700"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">
                {results.totalProfit >= 0 ? "✅" : "❌"}
              </span>
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  results.totalProfit >= 0
                    ? "text-success-600 dark:text-success-400"
                    : "text-danger-600 dark:text-danger-400"
                }`}
              >
                Net Profit
              </p>
              <p
                className={`text-2xl font-bold ${
                  results.totalProfit >= 0
                    ? "text-success-900 dark:text-success-100"
                    : "text-danger-900 dark:text-danger-100"
                }`}
              >
                {formatCurrency(results.totalProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Revenue Composition
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueCompositionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                labelLine={false}
              >
                {revenueCompositionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Growth Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tenant Growth Rate
              </span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatPercentage(results.growthMetrics.tenantGrowthRate)}/mo
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User Growth Rate
              </span>
              <span className="text-lg font-bold text-success-600 dark:text-success-400">
                {formatPercentage(results.growthMetrics.userGrowthRate)}/mo
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Churn Rate
              </span>
              <span className="text-lg font-bold text-danger-600 dark:text-danger-400">
                {formatPercentage(results.growthMetrics.churnRate)}/mo
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                LTV
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(results.growthMetrics.ltv)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                CAC
              </span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(results.growthMetrics.cac)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Revenue Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Monthly Revenue Breakdown (Stacked)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stackedRevenueData}>
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
            <Bar
              dataKey="baseRevenue"
              stackId="revenue"
              fill="#3b82f6"
              name="Base Revenue"
            />
            <Bar
              dataKey="userRevenue"
              stackId="revenue"
              fill="#22c55e"
              name="User Revenue"
            />
            <Bar
              dataKey="aiRevenue"
              stackId="revenue"
              fill="#f59e0b"
              name="AI Revenue"
            />
            <Bar
              dataKey="addonRevenue"
              stackId="revenue"
              fill="#8b5cf6"
              name="Add-on Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit vs Revenue Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            💰 Profit vs Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#22c55e"
                strokeWidth={3}
                name="Total Revenue"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Profit"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tenant and User Growth */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            👥 Tenant & User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
                fontSize={10}
              />
              <YAxis
                yAxisId="tenants"
                orientation="left"
                stroke="#64748b"
                className="dark:stroke-gray-400"
                fontSize={10}
              />
              <YAxis
                yAxisId="users"
                orientation="right"
                stroke="#64748b"
                className="dark:stroke-gray-400"
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="tenants"
                type="monotone"
                dataKey="tenants"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Tenants"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="users"
                type="monotone"
                dataKey="users"
                stroke="#06b6d4"
                strokeWidth={2}
                name="Total Users"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Area Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🏦 Cash Flow Progression
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
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" />
            <Area
              type="monotone"
              dataKey="cash"
              stroke="#3b82f6"
              fill="#dbeafe"
              fillOpacity={0.6}
              name="Cash on Hand"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MRR Growth */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🎯 MRR (Monthly Recurring Revenue) Growth
        </h3>
        <ResponsiveContainer width="100%" height={300}>
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
              fontSize={10}
            />
            <YAxis
              stroke="#64748b"
              className="dark:stroke-gray-400"
              fontSize={10}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="#22c55e"
              strokeWidth={4}
              name="MRR"
              dot={{ r: 5, fill: "#22c55e" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Break-even Analysis */}
      {results.breakEvenMonth && (
        <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-6">
          <h4 className="font-medium text-success-900 dark:text-success-100 mb-4 flex items-center">
            <span className="mr-2">🎉</span>
            Break-Even Achievement
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-success-600 dark:text-success-400">
                Break-Even Month
              </div>
              <div className="text-2xl font-bold text-success-800 dark:text-success-200">
                Month {results.breakEvenMonth}
              </div>
            </div>
            <div>
              <div className="text-sm text-success-600 dark:text-success-400">
                Tenants at Break-Even
              </div>
              <div className="text-2xl font-bold text-success-800 dark:text-success-200">
                {formatNumber(
                  results.monthlyData[results.breakEvenMonth - 1]?.tenants || 0,
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-success-600 dark:text-success-400">
                MRR at Break-Even
              </div>
              <div className="text-2xl font-bold text-success-800 dark:text-success-200">
                {formatCurrency(
                  results.monthlyData[results.breakEvenMonth - 1]?.mrr || 0,
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* $1M Revenue Goal Progress */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          $1M Annual Revenue Goal
        </h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 dark:text-blue-300">
              Current Annual Run Rate
            </span>
            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(results.peakMRR * 12)}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-4">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((results.peakMRR * 12) / 1000000) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
            <span>$0</span>
            <span>
              ${(((results.peakMRR * 12) / 1000000) * 100).toFixed(1)}% of $1M
              goal
            </span>
            <span>$1,000,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
