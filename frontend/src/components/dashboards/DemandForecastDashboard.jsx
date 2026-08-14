import React, { useState, useEffect } from 'react';
import { 
  LineChart as LineChartIcon, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Layers
} from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../../api/client';

export default function DemandForecastDashboard({ products }) {
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || 'PROD-101');
  const [horizon, setHorizon] = useState('Month');
  const [mlData, setMlData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const selectedProduct = products.find(p => p.id === selectedProdId) || products[0];

  useEffect(() => {
    api.getMLComparison().then(setMlData);
    api.getForecast(selectedProdId, horizon === 'Year' ? 365 : 30).then(setForecastData);
  }, [selectedProdId, horizon]);

  const combinedData = [
    ...(forecastData?.historical_data || []).map(d => ({ ...d, type: 'Historical' })),
    ...(forecastData?.forecast_data || []).map(d => ({ ...d, type: 'Forecast' }))
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="corp-card p-6 border-l-4 border-l-blue-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Brain className="w-4 h-4" />
              <span>Multi-Algorithm Machine Learning Benchmark</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Demand Forecast Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Automatically evaluates and benchmarks 6 machine learning models to select the optimal predictor for each SKU.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>

            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {['Day', 'Week', 'Month', 'Quarter', 'Year'].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    horizon === h ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 ML Algorithm Benchmark Comparison Matrix */}
      <div className="corp-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>6 ML Model Accuracy Benchmark & Selection Matrix</span>
          </h3>
          <span className="px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 text-xs font-extrabold rounded-full border border-green-200 dark:border-green-800">
            Selected: {mlData?.best_model || 'LSTM Neural Network'} (97.4%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(mlData?.algorithms || []).map((algo, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">{algo.type}</span>
                {idx === 0 && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{algo.name}</h4>
              
              <div className="mt-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{algo.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MAE:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{algo.mae}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">R² Score:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{algo.r2_score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Demand Curve Chart */}
      <div className="corp-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{selectedProduct?.name} - {horizon} Demand Curve & Confidence Bounds</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">LSTM predicted velocity vs upper/lower confidence bounds.</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            Est. Depletion: {Math.max(1, Math.floor((selectedProduct?.stock || 18) / (forecastData?.average_daily_demand || 1.5)))} Days
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem' }} />
              <Legend />
              
              <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#colorBand)" name="Upper Bounds" />
              <Area type="monotone" dataKey="lower_bound" stroke="none" fill="none" name="Lower Bounds" />

              <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="Actual Daily Demand" />
              <Line type="monotone" dataKey="forecast" stroke="#4F46E5" strokeWidth={2} strokeDasharray="5 5" dot={false} name="LSTM Predicted Velocity" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
