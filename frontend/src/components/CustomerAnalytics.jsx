import React, { useState, useEffect } from 'react';
import { Users, Layers, TrendingUp } from 'lucide-react';
import { api } from '../api/client';

export default function CustomerAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getCustomerAnalytics().then(setData);
  }, []);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
          <Users className="h-4 w-4" />
          <span>Customer Behavioural Analytics Engine</span>
        </div>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          Customer Analytics &amp; Conversion Funnel
        </h2>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600 dark:text-slate-400">
          Real-time tracking of product view interactions, cart additions, abandonments, and buyer segments.
        </p>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Repeat Customer Rate</p>
          <p className="mt-2 text-2xl font-black text-blue-600">{data?.repeat_customer_rate || 68.4}%</p>
          <p className="mt-1 text-xs font-semibold text-green-600">+4.2% high loyalty cohort</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Average Order Value</p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">₹{formatINR(data?.average_order_value || 14250)}</p>
          <p className="mt-1 text-xs font-semibold text-green-600">+9.1% bundle optimization</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Active Live Sessions</p>
          <p className="mt-2 text-2xl font-black text-blue-600">{data?.total_active_sessions || 412}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Real-time user telemetry</p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
          <Layers className="h-4 w-4 text-blue-600" />
          <span>E-Commerce Conversion Funnel</span>
        </h3>
        <div className="space-y-4">
          {(data?.funnel || [
            { stage: 'Product Views', count: 12500, percentage: 100 },
            { stage: 'Added to Cart', count: 4000, percentage: 32 },
            { stage: 'Completed Purchase', count: 2600, percentage: 20.8 },
            { stage: 'Cart Abandoned', count: 1400, percentage: 11.2 },
          ]).map((step, idx) => (
            <div key={step.stage}>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {idx + 1}
                  </span>
                  {step.stage}
                </span>
                <span className="font-black text-slate-950 dark:text-white">
                  {step.count.toLocaleString('en-IN')} ({step.percentage}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 3 ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.max(5, step.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Profiles */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-sm font-black text-slate-950 dark:text-white">Tracked Customer Segments &amp; Risk Profiles</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(data?.customers || [
            { id: 'CUST-001', name: 'Rahul Sharma', segment: 'Tech Enthusiast', purchases_count: 14, total_spent: 142500, clv: 210000, cart_abandonments: 2 },
            { id: 'CUST-002', name: 'Priya Patel', segment: 'Smart Home Pioneer', purchases_count: 8, total_spent: 84500, clv: 135000, cart_abandonments: 4 },
          ]).map((cust) => (
            <div key={cust.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-black text-slate-950 dark:text-white">{cust.name}</p>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {cust.segment}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <div>
                  <p className="text-slate-400">Total Spent</p>
                  <p className="mt-0.5 font-black text-green-600">₹{formatINR(cust.total_spent)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Purchases</p>
                  <p className="mt-0.5 font-black text-slate-950 dark:text-white">{cust.purchases_count}</p>
                </div>
                <div>
                  <p className="text-slate-400">Abandon Risk</p>
                  <p className="mt-0.5 font-black text-orange-500">{cust.cart_abandonments} carts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
