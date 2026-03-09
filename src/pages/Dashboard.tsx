
import { Order } from '../types';
import {
  BanknoteIcon,
  ShoppingCartIcon,
  UsersIcon,
  TrendingUpIcon } from
'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
interface DashboardProps {
  orders: Order[];
}
export function Dashboard({ orders }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(
    (o) => o.date.startsWith(today) && o.status !== 'Refunded'
  );
  
  const totalSalesToday = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const activeTables = new Set(
    todaysOrders.
    filter((o) => !o.isTakeaway && o.status === 'Pending').
    map((o) => o.tableNumber)
  ).size;
  const avgOrderValue =
  todaysOrders.length > 0 ? totalSalesToday / todaysOrders.length : 0;
  const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', {
    maximumFractionDigits: 0
  })}`;

  

  // Calculate best selling items
  const itemSales: Record<
    string,
    {
      name: string;
      qty: number;
      rev: number;
    }> =
  {};
  orders.forEach((order) => {
    if (order.status === 'Refunded') return;
    order.items.forEach((item) => {
      if (!itemSales[item.id]) {
        itemSales[item.id] = {
          name: item.name,
          qty: 0,
          rev: 0
        };
      }
      itemSales[item.id].qty += item.quantity;
      itemSales[item.id].rev += item.price * item.quantity;
    });
  });
  const bestSellers = Object.values(itemSales).
  sort((a, b) => b.qty - a.qty).
  slice(0, 5);
  const stats = [
  {
    label: 'Total Sales Today',
    value: formatCurrency(totalSalesToday),
    icon: BanknoteIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-500/10'
  },
  {
    label: 'Total Orders Today',
    value: todaysOrders.length.toString(),
    icon: ShoppingCartIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-500/10'
  },
  {
    label: 'Active Tables',
    value: activeTables.toString(),
    icon: UsersIcon,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10'
  },
  {
    label: 'Avg Order Value',
    value: formatCurrency(avgOrderValue),
    icon: TrendingUpIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-500/10'
  }];


const chartData = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));

  const dateStr = date.toISOString().split("T")[0];

  const sales = orders
    .filter(
      (o) =>
        o.date.startsWith(dateStr) &&
        o.status !== "Refunded"
    )
    .reduce((sum, o) => sum + o.total, 0);

  return {
    name: date.toLocaleDateString("en-US", { weekday: "short" }),
    sales
  };
});

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">

              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>

                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>);

        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Revenue Summary (Last 7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0
                }}>

                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2} />

                <XAxis
                  dataKey="name"
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
                  }}
                  tickFormatter={(val) => `LKR ${val / 1000}k`} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{
                    color: '#f59e0b'
                  }}
                  formatter={(value: number) => [
                  `LKR ${value.toLocaleString()}`,
                  'Revenue']
                  } />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)" />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Best Selling Items
          </h3>
          <div className="space-y-4">
            {bestSellers.map((item, i) =>
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center font-bold text-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.qty} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {formatCurrency(item.rev)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Time</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {orders.slice(0, 5).map((order) =>
              <tr
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">

                  <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(order.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    items
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="p-4">
                    <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' : order.status === 'Refunded' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'}
                    `}>

                      {order.status}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}