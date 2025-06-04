import React from "react";
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
  Cell,
} from "recharts";
import { ChartDataPoint } from "@/types";
import { formatCurrency } from "@/lib/calculations/calculations";

interface ChartsDashboardProps {
  chartData: ChartDataPoint[];
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
            {entry.name === "Users"
              ? entry.value.toLocaleString()
              : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsDashboard({ chartData }: ChartsDashboardProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Financial Charts</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No data available for charts.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue vs Expenses Line Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Revenue vs Expenses
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
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={3}
              name="Revenue"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={3}
              name="Expenses"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Profit Bar Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          💰 Monthly Profit
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
            <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Area Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🏦 Cash Flow
          </h3>
          <ResponsiveContainer width="100%" height={250}>
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

        {/* Client Growth Line Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            👥 Client Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Users"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            Peak Revenue
          </div>
          <div className="text-xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(Math.max(...chartData.map((d) => d.revenue)))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Peak Users
          </div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {Math.max(...chartData.map((d) => d.users)).toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
            Best Month
          </div>
          <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(Math.max(...chartData.map((d) => d.profit)))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Cash Range
          </div>
          <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
            {formatCurrency(
              Math.max(...chartData.map((d) => d.cash)) -
                Math.min(...chartData.map((d) => d.cash)),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
