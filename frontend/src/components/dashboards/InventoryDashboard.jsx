import React, { useState, useEffect } from 'react';
import { PackageCheck, AlertTriangle, CheckCircle2, TrendingDown, RefreshCcw } from 'lucide-react';
import { api } from '../../api/client';

export default function InventoryDashboard({ products }) {
  const [inventoryList, setInventoryList] = useState([]);

  useEffect(() => {
    api.getInventoryStatus().then(setInventoryList);
  }, [products]);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="space-y-6">
      <div className="corp-card p-6 border-l-4 border-l-blue-600 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Inventory Intelligence & EOQ Analysis</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Stockout prediction models, Economic Order Quantity (EOQ), ABC Analysis, and automated purchase orders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="corp-card p-5 border-l-4 border-l-red-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase">Critical Low Stock</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">3 SKUs</div>
          <span className="text-xs text-red-500 font-bold">Stock-out risk in 7 days</span>
        </div>
        <div className="corp-card p-5 border-l-4 border-l-green-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase">Optimal Inventory</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">5 SKUs</div>
          <span className="text-xs text-green-600 font-bold">Healthy turnover velocity</span>
        </div>
        <div className="corp-card p-5 border-l-4 border-l-orange-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase">Overstock / Dead Stock</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1 SKU</div>
          <span className="text-xs text-orange-500 font-bold">High holding cost risk</span>
        </div>
      </div>

      <div className="corp-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">ABC Analysis & EOQ Reorder Recommendations</h3>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Safety Stock</th>
                <th className="p-3.5">EOQ (Units)</th>
                <th className="p-3.5">ABC Category</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {inventoryList.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="p-3.5 text-slate-500">{item.category}</td>
                  <td className="p-3.5 font-extrabold text-blue-600">{item.stock} units</td>
                  <td className="p-3.5 text-slate-500">{item.safety_stock || 25}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.eoq_units || 85} units</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-600">
                      {item.abc_classification || 'Class A'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-red-500">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
