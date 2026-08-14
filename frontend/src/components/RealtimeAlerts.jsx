import React from 'react';
import { Bell, X, AlertTriangle, TrendingUp, Radio, Brain } from 'lucide-react';

export default function RealtimeAlerts({ isOpen, onClose, alerts }) {
  if (!isOpen) return null;

  const displayAlerts = alerts.length
    ? alerts
    : [
        { id: 'a1', severity: 'high', type: 'STOCK_CRITICAL', timestamp: 'Just now', title: 'Critical Stock: SmartWatch Pro', message: 'Stock (18) is below safety threshold (25). Auto PO suggested.' },
        { id: 'a2', severity: 'info', type: 'PRICE_SURGE', timestamp: '5m ago', title: 'Pricing Opportunity', message: 'Competitor raised ANC Headphone price by 4%. You can lift to ₹14,299.' },
      ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-950 dark:text-white">Alerts &amp; Notifications</h3>
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
              {displayAlerts.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:text-slate-700 dark:border-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto space-y-3 p-5">
          {displayAlerts.map((alt) => {
            const isHigh = alt.severity === 'high';
            return (
              <div
                key={alt.id}
                className={`flex items-start gap-3 rounded-lg border p-4 ${
                  isHigh
                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {alt.type?.includes('STOCK') && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  {alt.type?.includes('PRICE') && <TrendingUp className="h-5 w-5 text-blue-500" />}
                  {alt.type?.includes('IOT') && <Radio className="h-5 w-5 text-amber-500" />}
                  {alt.type?.includes('AI') && <Brain className="h-5 w-5 text-indigo-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-950 dark:text-white">{alt.title}</h4>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">{alt.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-600 dark:text-slate-400">{alt.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
