import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function DynamicPricing({ products, onPriceUpdated }) {
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || 'PROD-101');
  const [isPeakHour, setIsPeakHour] = useState(false);
  const [pricingResult, setPricingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0];
  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  const calculateMLPrice = async () => {
    if (!selectedProdId) return;
    setLoading(true);
    const res = await api.calculateDynamicPricing(selectedProdId, isPeakHour);
    setPricingResult(res);
    setLoading(false);
  };

  useEffect(() => {
    calculateMLPrice();
  }, [selectedProdId, isPeakHour]);

  const handleApplyPrice = async () => {
    if (!pricingResult) return;
    setLoading(true);
    await api.updatePrice(selectedProdId, pricingResult.recommended_price);
    setAppliedSuccess(true);
    onPriceUpdated();
    setTimeout(() => setAppliedSuccess(false), 2500);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
              <span>Multi-Variable Ridge Regression Engine</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Dynamic Pricing Engine</h2>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Calculates optimal price multipliers based on stock levels, competitor pricing, demand velocity, and cart abandonment risk.
            </p>
          </div>

          {/* Peak Hour Toggle */}
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Peak Hour Surge</p>
              <p className="text-[10px] text-slate-400">Triggers +5% demand factor</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPeakHour(!isPeakHour)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPeakHour ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPeakHour ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Product Selector */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Select Product SKU</h3>
          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {products.map((p) => {
              const isSelected = p.id === selectedProdId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProdId(p.id)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-10 w-10 rounded-lg object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <p className="max-w-[130px] truncate text-xs font-black text-slate-950 dark:text-white">{p.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400">Stock: {p.stock} · Base: ₹{formatINR(p.base_price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400">₹{formatINR(p.current_price)}</p>
                    <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-orange-600 dark:bg-orange-950/30">
                      Score: {p.demand_score}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Pricing Output Panel */}
        <div className="flex flex-col justify-between space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          {selectedProduct && (
            <>
              {/* Product Header */}
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="h-16 w-16 rounded-xl object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {selectedProduct.category}
                    </span>
                    <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{selectedProduct.name}</h3>
                    <p className="text-xs font-medium text-slate-400">SKU: {selectedProduct.id}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-lg border border-slate-200 px-3 py-2 text-center dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Competitor</p>
                    <p className="text-sm font-black text-slate-950 dark:text-white">₹{formatINR(selectedProduct.competitor_price)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-2 text-center dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Unit Cost</p>
                    <p className="text-sm font-black text-slate-950 dark:text-white">₹{formatINR(selectedProduct.unit_cost)}</p>
                  </div>
                </div>
              </div>

              {/* Price Comparison Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4 text-center dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500">Base Price (MRP)</p>
                  <p className="mt-1 text-xl font-black text-slate-700 dark:text-slate-300">₹{formatINR(pricingResult?.base_price || selectedProduct.base_price)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 text-center dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500">Current Catalog Price</p>
                  <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">₹{formatINR(pricingResult?.current_price || selectedProduct.current_price)}</p>
                </div>
                <div className="relative overflow-hidden rounded-lg border border-blue-300 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-950/40">
                  <Sparkles className="absolute right-2 top-2 h-4 w-4 animate-pulse text-blue-500" />
                  <p className="text-xs font-black uppercase text-blue-600 dark:text-blue-300">AI Optimal Price</p>
                  <p className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">₹{formatINR(pricingResult?.recommended_price || 0)}</p>
                  <p className="text-[10px] font-bold text-green-600">
                    {pricingResult?.price_delta >= 0
                      ? `+₹${formatINR(pricingResult?.price_delta)}`
                      : `-₹${formatINR(Math.abs(pricingResult?.price_delta))}`}
                  </p>
                </div>
              </div>

              {/* Strategy Details */}
              {pricingResult && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-slate-950 dark:text-white">Pricing Strategy</p>
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-black text-green-700 dark:bg-green-950 dark:text-green-300">
                      Confidence: {pricingResult.confidence_score}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">{pricingResult.strategy}</p>
                  <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
                    <div>
                      <p className="text-slate-500">Multiplier</p>
                      <p className="mt-0.5 font-black text-slate-950 dark:text-white">{pricingResult.multiplier}x</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Profit Margin</p>
                      <p className="mt-0.5 font-black text-green-600">{pricingResult.profit_margin_pct}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Stock Ratio</p>
                      <p className="mt-0.5 font-black text-slate-950 dark:text-white">{pricingResult.stock_ratio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                {appliedSuccess && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Price Updated &amp; Live!
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleApplyPrice}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
                >
                  <span>{loading ? 'Updating...' : 'Apply AI Price Recommendation (₹)'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
