import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  PackageCheck, 
  DollarSign, 
  Brain, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  UploadCloud,
  FileText,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function HomeDashboard({ summary, products, onNavigate }) {
  const salesData = [
    { day: 'Mon', revenue: 184000, forecast: 190000 },
    { day: 'Tue', revenue: 212000, forecast: 205000 },
    { day: 'Wed', revenue: 198000, forecast: 210000 },
    { day: 'Thu', revenue: 245000, forecast: 238000 },
    { day: 'Fri', revenue: 289000, forecast: 275000 },
    { day: 'Sat', revenue: 342000, forecast: 330000 },
    { day: 'Sun', revenue: 310000, forecast: 325000 }
  ];

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Health & Performance Banner */}
      <div className="corp-card p-6 border-l-4 border-l-blue-600 bg-gradient-to-r from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Business Health Telemetry</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {summary?.store?.name || 'ABC Supermarket'} Executive Control Center
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Real-time monitoring across 1,420 transactions. LSTM neural model predicts +14.2% revenue growth next quarter.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('upload')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Data</span>
            </button>
            <button
              onClick={() => onNavigate('forecast')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center space-x-1.5"
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Forecast</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Row - 6 Modular KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Business Health Score */}
        <div className="corp-card corp-card-hover p-4 border-l-4 border-l-green-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Health Score</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.business_health_score || 96}/100
          </div>
          <span className="text-[10px] text-green-600 font-bold">Optimal Turnover</span>
        </div>

        {/* Revenue */}
        <div className="corp-card corp-card-hover p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{formatINR(summary?.total_revenue || 1489200)}
          </div>
          <span className="text-[10px] text-green-600 font-bold flex items-center mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +14.2% YoY
          </span>
        </div>

        {/* Profit */}
        <div className="corp-card corp-card-hover p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            ₹{formatINR(summary?.total_profit || 425600)}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">28.5% Net Margin</span>
        </div>

        {/* Orders */}
        <div className="corp-card corp-card-hover p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Orders</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.total_orders || 1420}
          </div>
          <span className="text-[10px] text-indigo-600 font-bold">+8.6% Velocity</span>
        </div>

        {/* Inventory Value */}
        <div className="corp-card corp-card-hover p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Value</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{formatINR(summary?.inventory_value || 850000)}
          </div>
          <span className="text-[10px] text-orange-500 font-bold">{summary?.low_stock_count || 3} Low Stock SKUs</span>
        </div>

        {/* AI Accuracy */}
        <div className="corp-card corp-card-hover p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">LSTM Accuracy</span>
          <div className="text-xl font-extrabold text-green-600 mt-1">
            {summary?.ai_accuracy || 96.8}%
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">MAE: 0.85 units</span>
        </div>
      </div>

      {/* Second Row - Revenue Trend vs Forecast & AI Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 corp-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Weekly Revenue Trend vs AI Prediction (₹)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Solid line: actual revenue. Dashed line: LSTM forecast curve.</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem' }}
                  formatter={(v) => [`₹${formatINR(v)}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fill="url(#colorRev)" name="Actual Revenue (₹)" />
                <Area type="monotone" dataKey="forecast" stroke="#4F46E5" strokeWidth={2} strokeDasharray="4 4" fill="none" name="LSTM Forecast (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Summary Card with Natural Language Summaries */}
        <div className="corp-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              <Brain className="w-4 h-4" />
              <span>AI Executive Insights</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Business Health & Demand Outlook</h3>
            
            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                💡 <span className="font-bold">Demand Outlook:</span> Demand for Wearables & Smart Home is expected to rise by 16% next month. Consider increasing stock by 14% to prevent stockouts.
              </div>

              <div className="p-3.5 rounded-xl bg-green-50/60 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-xs text-green-900 dark:text-green-200">
                📈 <span className="font-bold">Profit Opportunity:</span> Competitor price for ANC Headphones increased by 4%. AI suggests adjusting price to ₹14,299 for +₹45,000 extra profit.
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-xs text-orange-900 dark:text-orange-200">
                ⚠️ <span className="font-bold">Inventory Risk:</span> 3 SKUs below minimum safety stock limit. Auto replenishment order PO-901 suggested.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('insights')}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-extrabold text-xs flex items-center justify-center space-x-1"
          >
            <span>View All AI Recommendations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
