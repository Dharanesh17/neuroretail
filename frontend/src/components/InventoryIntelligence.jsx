import React, { useState, useEffect } from 'react';
import { PackageCheck, AlertTriangle, TrendingDown, CheckCircle2, RefreshCcw } from 'lucide-react';
import { api } from '../api/client';

export default function InventoryIntelligence({ products, onReorderSuccess }) {
  const [inventoryList, setInventoryList] = useState([]);
  const [reorderingId, setReorderingId] = useState(null);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState('');

  const fetchInventory = async () => {
    const data = await api.getInventoryStatus();
    setInventoryList(data);
  };

  useEffect(() => {
    fetchInventory();
  }, [products]);

  const handleApproveReorder = async (prodId, qty) => {
    setReorderingId(prodId);
    const res = await api.reorderStock(prodId, qty || 50);
    setReorderSuccessMsg(`Order ${res.po_number} placed for ${qty || 50} units!`);
    await fetchInventory();
    onReorderSuccess();
    setReorderingId(null);
    setTimeout(() => setReorderSuccessMsg(''), 4000);
  };

  const lowStockItems = inventoryList.filter((item) => item.status === 'LOW_STOCK');
  const overstockItems = inventoryList.filter((item) => item.status === 'OVERSTOCK');
  const optimalItems = inventoryList.filter((item) => item.status === 'OPTIMAL');

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
          <PackageCheck className="h-4 w-4" />
          <span>Autonomous Inventory Control System</span>
        </div>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          Inventory Intelligence &amp; Auto-Replenishment
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Monitors real-time stock thresholds, generates automated purchase orders, and prevents stockout risks.
        </p>
      </section>

      {/* Success Alert */}
      {reorderSuccessMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{reorderSuccessMsg}</span>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Critical Low Stock</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{lowStockItems.length} SKUs</p>
          <p className="mt-0.5 text-xs font-semibold text-red-500">Below safety stock threshold</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Optimal Inventory</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{optimalItems.length} SKUs</p>
          <p className="mt-0.5 text-xs font-semibold text-green-600">Healthy turnover velocity</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Overstocked Items</span>
            <TrendingDown className="h-5 w-5 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{overstockItems.length} SKUs</p>
          <p className="mt-0.5 text-xs font-semibold text-orange-500">High holding cost risk</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-950 dark:text-white">Stock Level Monitoring &amp; Replenishment Queue</h3>
          <button
            type="button"
            onClick={fetchInventory}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-blue-600"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                {['Product', 'Category', 'Current Stock', 'Min / Max', 'Status', 'Reorder Qty', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3.5 font-black uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {inventoryList.map((item) => {
                const isLow = item.status === 'LOW_STOCK';
                const isOver = item.status === 'OVERSTOCK';
                return (
                  <tr key={item.product_id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-black text-slate-950 dark:text-white">{item.name}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-500">{item.category}</td>
                    <td className="px-4 py-3.5 text-sm font-extrabold">
                      <span className={isLow ? 'text-red-600' : isOver ? 'text-orange-500' : 'text-green-600'}>
                        {item.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-500">{item.min_stock} – {item.max_stock}</td>
                    <td className="px-4 py-3.5">
                      {isLow && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-700 dark:bg-red-950/30 dark:text-red-300">
                          CRITICAL LOW
                        </span>
                      )}
                      {isOver && (
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
                          OVERSTOCK
                        </span>
                      )}
                      {!isLow && !isOver && (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-green-700 dark:bg-green-950/30 dark:text-green-300">
                          OPTIMAL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold">
                      {item.suggested_reorder_qty > 0
                        ? <span className="text-blue-600 dark:text-blue-400">+{item.suggested_reorder_qty} units</span>
                        : <span className="text-slate-400">None</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.suggested_reorder_qty > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleApproveReorder(item.product_id, item.suggested_reorder_qty)}
                          disabled={reorderingId === item.product_id}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-70"
                        >
                          {reorderingId === item.product_id ? 'Placing PO...' : 'Approve Reorder'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Stock OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
