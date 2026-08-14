import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, DollarSign, Layers, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SalesDashboard({ products }) {
  const [filterPeriod, setFilterPeriod] = useState('Month');

  const branchData = [
    { branch: 'Branch North (Mumbai)', sales: 540000 },
    { branch: 'Branch South (Bengaluru)', sales: 480000 },
    { branch: 'Branch Central (Delhi)', sales: 320000 },
    { branch: 'Branch West (Pune)', sales: 149200 }
  ];

  const paymentData = [
    { name: 'UPI & GPay', value: 58, color: '#2563EB' },
    { name: 'Credit / Debit Cards', value: 24, color: '#4F46E5' },
    { name: 'Net Banking', value: 12, color: '#06B6D4' },
    { name: 'Cash on Delivery', value: 6, color: '#F59E0B' }
  ];

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="space-y-6">
      <div className="corp-card p-6 border-l-4 border-l-blue-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sales & Channel Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze daily, weekly, monthly, and yearly sales performance across store branches and payment channels.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          {['Today', 'Weekly', 'Month', 'Yearly'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                filterPeriod === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 corp-card p-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Branch Revenue Comparison (₹)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="branch" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '0.75rem' }} formatter={(v) => [`₹${formatINR(v)}`, 'Sales']} />
                <Bar dataKey="sales" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="corp-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Payment Method Split</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {paymentData.map(p => (
              <div key={p.name} className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
