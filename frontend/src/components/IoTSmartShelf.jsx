import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, MinusCircle, RefreshCw, Gauge } from 'lucide-react';
import { api } from '../api/client';

export default function IoTSmartShelf({ onShelfUpdated }) {
  const [shelves, setShelves] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchShelves = async () => {
    const data = await api.getIoTShelves();
    setShelves(data);
  };

  useEffect(() => {
    fetchShelves();
  }, []);

  const handleSimulatePick = async (shelfId) => {
    setUpdatingId(shelfId);
    await api.decrementShelf(shelfId, 1);
    await fetchShelves();
    onShelfUpdated();
    setUpdatingId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
              <Radio className="h-4 w-4 animate-pulse" />
              <span>Load Cell Weight Sensor Telemetry</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              IoT Smart Shelf Monitoring
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Real-time weight sensor telemetry detects physical stock removals on retail shelves and triggers instant restock signals.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchShelves}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            Ping Sensor Hub
          </button>
        </div>
      </section>

      {/* Shelves Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {shelves.map((shelf) => {
          const isCritical = shelf.status === 'CRITICAL_LOW' || shelf.status === 'LOW_STOCK';
          const fillPercentage = Math.round((shelf.current_units / shelf.capacity_units) * 100);

          return (
            <div key={shelf.shelf_id} className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              {/* Shelf Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {shelf.shelf_id}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                    isCritical
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 animate-pulse'
                      : 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                  }`}>
                    {shelf.status}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-black text-slate-950 dark:text-white">{shelf.product_name}</h3>
                <p className="text-xs font-medium text-slate-400">SKU: {shelf.product_id}</p>
              </div>

              {/* Metrics */}
              <div className="my-4 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Sensor Weight:</span>
                  <span className="font-black text-slate-950 dark:text-white">{shelf.current_weight_grams} g</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Physical Stock:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{shelf.current_units} / {shelf.capacity_units} units</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-slate-400">{fillPercentage}% full</p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSimulatePick(shelf.shelf_id)}
                disabled={updatingId === shelf.shelf_id || shelf.current_units <= 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                <MinusCircle className="h-4 w-4" />
                <span>{updatingId === shelf.shelf_id ? 'Sensor Updating...' : 'Simulate Customer Pick (−1)'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
