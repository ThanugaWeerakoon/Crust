import React, { useState } from 'react';
import { Order } from '../types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend } from
'recharts';
interface ReportsProps {
  orders: Order[];
}
export function Reports({ orders }: ReportsProps) {
  const [dateRange, setDateRange] = useState('This Week');
  // Mock data for charts
  const categorySales: Record<string, number> = {};

orders.forEach((order) => {
  if (order.status === "Refunded") return;

  order.items.forEach((item) => {
    const category = item.category || "Other";

    if (!categorySales[category]) {
      categorySales[category] = 0;
    }

    categorySales[category] += item.price * item.quantity;
  });
});

const categoryData = Object.entries(categorySales).map(([name, value]) => ({
  name,
  value
}));

const hourlyMap: Record<number, number> = {};

orders.forEach((order) => {
  if (order.status === "Refunded") return;

  const hour = new Date(order.date).getHours();

  if (!hourlyMap[hour]) {
    hourlyMap[hour] = 0;
  }

  hourlyMap[hour] += 1;
});

const hourlyData = Object.entries(hourlyMap)
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .map(([hour, count]) => ({
    time: `${hour}:00`,
    orders: count
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
  const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK')}`;
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Analytics & Reports
        </h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-2 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]">

          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>Custom Range</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Sales by Category
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value">

                  {categoryData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]} />

                  )}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }} />

                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Order Volume by Hour
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2} />

                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12
                  }}
                  dy={10} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12
                  }} />

                <Tooltip
                  cursor={{
                    fill: '#f1f5f9',
                    opacity: 0.1
                  }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }} />

                <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);

}