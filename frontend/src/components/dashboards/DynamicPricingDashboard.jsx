import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

export default function DynamicPricingDashboard({ products, onPriceUpdated }) {
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || 'PROD-101');
  const [isPeak, setIsPeak] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProdId) || products[0];
  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val || 0);

  const calculate = async () => {
    setLoading(true);
    const res = await api.calculateDynamicPricing(selectedProdId, isPeak);
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    calculate();
  }, [selectedProdId, isPeak]);

  const handleApply = async () => {
    if (!result) return;
    setLoading(true);
    await api.updatePrice(selectedProdId, result.recommended_price);
    setSuccess(true);
    onPriceUpdated();
    setLoading(false);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="corp-card p-6 border-l-4 border-l-blue-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dynamic Pricing Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            AI calculates optimal selling prices, competitor gaps, price elasticity, and festival surge pricing recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Peak Hour / Festival Demand Surge:</span>
          <button
            onClick={() => setIsPeak(!isPeak)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPeak ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPeak ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="corp-card p-5 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Select Product SKU</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProdId(p.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between ${
                  selectedProdId === p.id
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 font-bold text-blue-600 dark:text-blue-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-slate-400">Stock: {p.stock} units</div>
                </div>
                <div className="text-xs font-extrabold text-blue-600">₹{formatINR(p.current_price)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 corp-card p-6 flex flex-col justify-between space-y-6">
          {selectedProduct && (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-600 rounded-md">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{selectedProduct.name}</h3>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Competitor Price: </span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{formatINR(selectedProduct.competitor_price)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-xs font-semibold text-slate-500">Base Price</span>
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">₹{formatINR(selectedProduct.base_price)}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-xs font-semibold text-slate-500">Current Catalog Price</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">₹{formatINR(selectedProduct.current_price)}</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-500 text-center relative">
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-300 uppercase">AI Optimal Price</span>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">₹{formatINR(result?.recommended_price || 0)}</div>
                </div>
              </div>

              {result && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-bold text-blue-600 dark:text-blue-400">Strategy: {result.strategy}</div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div>Multiplier: <span className="font-bold text-slate-900 dark:text-white">{result.multiplier}x</span></div>
                    <div>Profit Margin: <span className="font-bold text-green-600">{result.profit_margin_pct}%</span></div>
                    <div>Confidence: <span className="font-bold text-blue-600">{result.confidence_score}%</span></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                {success && <span className="text-xs text-green-600 font-bold flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Applied!</span>}
                <button
                  onClick={handleApply}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg"
                >
                  {loading ? 'Updating...' : 'Apply AI Price Recommendation'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
