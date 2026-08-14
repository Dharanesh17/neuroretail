import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileText,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const salesData = [
  { day: 'Mon', revenue: 184000, forecast: 190000, orders: 180 },
  { day: 'Tue', revenue: 212000, forecast: 205000, orders: 220 },
  { day: 'Wed', revenue: 198000, forecast: 210000, orders: 205 },
  { day: 'Thu', revenue: 245000, forecast: 238000, orders: 248 },
  { day: 'Fri', revenue: 289000, forecast: 275000, orders: 315 },
  { day: 'Sat', revenue: 342000, forecast: 330000, orders: 370 },
  { day: 'Sun', revenue: 310000, forecast: 325000, orders: 332 },
];

const categoryData = [
  { category: 'Wearables', sales: 420 },
  { category: 'Audio', sales: 380 },
  { category: 'Smart Home', sales: 310 },
  { category: 'Electronics', sales: 180 },
  { category: 'Accessories', sales: 290 },
];

const donutData = [
  { name: 'Available', value: 68, color: '#22C55E' },
  { name: 'Low Stock', value: 22, color: '#F59E0B' },
  { name: 'Risk', value: 10, color: '#EF4444' },
];

const uploadHistory = [
  { file: 'historical_sales_reference.csv', status: 'Validated', time: '12 min ago' },
  { file: 'inventory_snapshot_q3.csv', status: 'Mapped', time: '1 hr ago' },
  { file: 'pricing_rules_august.csv', status: 'Synced', time: 'Yesterday' },
];

const heatmap = [
  ['Mon', 48, 62, 71, 54],
  ['Tue', 52, 68, 79, 58],
  ['Wed', 47, 65, 82, 61],
  ['Thu', 59, 72, 86, 67],
  ['Fri', 64, 78, 91, 73],
];

const formatINR = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0);

function KpiCard({ icon: Icon, label, value, change, tone = 'blue', trend = 'up' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    green: 'bg-green-50 text-green-700 ring-green-100',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
  };
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${colorMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value}</div>
      <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${trend === 'down' ? 'text-red-600' : 'text-green-600'}`}>
        <TrendIcon className="h-4 w-4" />
        <span>{change}</span>
      </div>
    </article>
  );
}

function ChartHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
          <Icon className="h-4 w-4 text-blue-600" />
          <span>{title}</span>
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export default function DashboardOverview({ summary, products, onNavigate }) {
  const productRows = products.length
    ? products.slice(0, 5)
    : [
        { id: 1, name: 'NeuroPulse SmartWatch Pro', category: 'Wearables', stock: 18, current_price: 21499, demand_score: 92 },
        { id: 2, name: 'AcousticSense ANC Headphones', category: 'Audio', stock: 62, current_price: 14299, demand_score: 89 },
        { id: 3, name: 'CogniHome Ambient Smart Hub', category: 'Smart Home', stock: 12, current_price: 10499, demand_score: 90 },
      ];

  const recentAlerts = summary?.recent_alerts?.length
    ? summary.recent_alerts.slice(0, 3)
    : [
        { id: 'a1', severity: 'high', timestamp: 'Now', title: 'Stock risk detected', message: '3 fast-moving SKUs are below safety stock.' },
        { id: 'a2', severity: 'medium', timestamp: '8m', title: 'Pricing opportunity', message: 'Audio category can absorb a 3.5% price lift.' },
        { id: 'a3', severity: 'low', timestamp: '24m', title: 'Forecast updated', message: 'Weekend demand revised upward by 14%.' },
      ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span>Executive Intelligence</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              ABC Supermarket Performance Command Center
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">
              Sales, demand, inventory, pricing, and AI recommendations are organized for fast retail decisions with export-ready reporting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('reference')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Dataset</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recommendations')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard icon={CheckCircle2} label="Business Health" value={`${summary?.business_health_score || 96}/100`} change="Stable operating range" tone="green" />
        <KpiCard icon={CircleDollarSign} label="Revenue" value={`Rs. ${formatINR(summary?.total_revenue || 1489200)}`} change="+14.2% vs last week" tone="blue" />
        <KpiCard icon={TrendingUp} label="Profit" value={`Rs. ${formatINR(summary?.total_profit || 425600)}`} change="+8.9% margin lift" tone="indigo" />
        <KpiCard icon={ShoppingBag} label="Orders" value={summary?.total_orders || 1420} change="+8.6% velocity" tone="blue" />
        <KpiCard icon={PackageCheck} label="Inventory Value" value={`Rs. ${formatINR(summary?.inventory_value || 850000)}`} change={`${summary?.low_stock_count || 3} SKUs need action`} tone="orange" trend="down" />
        <KpiCard icon={Users} label="Customers" value={summary?.customer_count || 6840} change="+11.4% repeat buyers" tone="green" />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <ChartHeader
            icon={TrendingUp}
            title="Revenue Trend and Demand Forecast"
            subtitle="Actual revenue compared with the AI forecast curve."
            action={<span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Interactive</span>}
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `Rs.${value / 1000}k`} />
                <Tooltip contentStyle={{ borderColor: '#E5E7EB', borderRadius: 8 }} formatter={(value) => [`Rs. ${formatINR(value)}`, '']} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} fill="url(#revenueFill)" />
                <Line type="monotone" dataKey="forecast" name="AI Forecast" stroke="#4F46E5" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ChartHeader icon={Bot} title="AI Summary" subtitle="Natural-language decision support." />
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-medium leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
              Demand for dairy and smart home products is expected to increase by 14% next month. Increase inventory by 12% to avoid stock shortages.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-bold uppercase text-slate-400">Growth</p>
                <p className="mt-1 text-lg font-black text-green-600">+16%</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-bold uppercase text-slate-400">Risk</p>
                <p className="mt-1 text-lg font-black text-orange-500">Medium</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('recommendations')}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
            >
              <span>Open AI actions</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ChartHeader icon={BarChart3} title="Sales by Category" subtitle="Volume contribution by category." />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ borderColor: '#E5E7EB', borderRadius: 8 }} />
                <Bar dataKey="sales" name="Units Sold" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ChartHeader icon={PackageCheck} title="Inventory Status" subtitle="Available, low-stock, and risk allocation." />
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" innerRadius={48} outerRadius={74} paddingAngle={4}>
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderColor: '#E5E7EB', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                  <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-black text-slate-950 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ChartHeader icon={TrendingUp} title="Demand Heatmap" subtitle="Peak demand by weekday and channel." />
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold uppercase text-slate-400">
              <span />
              <span>Store</span>
              <span>Web</span>
              <span>App</span>
              <span>Partner</span>
            </div>
            {heatmap.map(([day, ...values]) => (
              <div key={day} className="grid grid-cols-5 gap-2">
                <span className="py-2 text-xs font-black text-slate-500">{day}</span>
                {values.map((value, index) => (
                  <span
                    key={`${day}-${index}`}
                    className="rounded-md px-2 py-2 text-center text-xs font-black text-blue-950"
                    style={{ backgroundColor: `rgba(37, 99, 235, ${0.12 + value / 130})` }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <ChartHeader icon={PackageCheck} title="Top Products and Demand Scores" subtitle="Active catalog items ranked by AI demand." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-black uppercase text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {productRows.map((product) => (
                  <tr key={product.id || product.name} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-3 pr-4 font-black text-slate-950 dark:text-white">{product.name}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-500">{product.category}</td>
                    <td className="py-3 pr-4 font-bold text-slate-700 dark:text-slate-200">{product.stock} units</td>
                    <td className="py-3 pr-4 font-black text-blue-700">Rs. {formatINR(product.current_price)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${product.demand_score || 82}%` }} />
                        </div>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{product.demand_score || 82}/100</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ChartHeader icon={AlertTriangle} title="Notifications" subtitle="Operational signals requiring review." />
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-black uppercase ${alert.severity === 'high' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                      {alert.timestamp}
                    </span>
                    <span className="text-[11px] font-bold uppercase text-slate-400">{alert.severity}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{alert.title}</h4>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ChartHeader icon={FileText} title="Recent Uploads" subtitle="Latest files processed by AI validation." />
            <div className="space-y-2">
              {uploadHistory.map((upload) => (
                <div key={upload.file} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-800 dark:text-slate-100">{upload.file}</p>
                    <p className="text-[11px] font-bold text-slate-400">{upload.time}</p>
                  </div>
                  <span className="rounded-md bg-green-50 px-2 py-1 text-[11px] font-black text-green-700">
                    {upload.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
