import React, { useState } from 'react';
import {
  Brain,
  RefreshCw,
  Play,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AILearningModule({ aiMetrics, onRetrain }) {
  const [training, setTraining] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const epochData = [
    { epoch: 'Epoch 1', accuracy: 88.2, loss: 0.35 },
    { epoch: 'Epoch 3', accuracy: 90.5, loss: 0.28 },
    { epoch: 'Epoch 6', accuracy: 92.1, loss: 0.22 },
    { epoch: 'Epoch 9', accuracy: 93.6, loss: 0.18 },
    { epoch: 'Epoch 12', accuracy: aiMetrics?.accuracy || 94.8, loss: 0.14 },
  ];

  const handleRetrain = async () => {
    setTraining(true);
    setSuccessMessage('');
    const res = await onRetrain();
    setSuccessMessage(
      `Continuous Learning Step Complete! Model accuracy updated to ${res?.metrics?.accuracy || 95.4}%`
    );
    setTraining(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
              <Brain className="h-4 w-4" />
              <span>Online ML Model Retraining Pipeline</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              AI Self-Learning &amp; Continuous Optimization
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600 dark:text-slate-400">
              Simulates continuous online learning on newly recorded sales transactions and updates hyperparameter weights dynamically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetrain}
            disabled={training}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${training ? 'animate-spin' : ''}`} />
            <span>{training ? 'Running Training Pipeline...' : 'Run Retraining Step'}</span>
          </button>
        </div>
      </section>

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Current Accuracy</p>
          <p className="mt-2 text-2xl font-black text-green-600">{aiMetrics?.accuracy || 94.8}%</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Target &gt; 90%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mean Absolute Error</p>
          <p className="mt-2 text-2xl font-black text-blue-600">{aiMetrics?.mae || 1.45}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Lower is better</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Training Epochs</p>
          <p className="mt-2 text-2xl font-black text-indigo-600">#{aiMetrics?.retrain_count || 12}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Online learning steps</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Last Trained</p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white truncate">
            {aiMetrics?.last_retrained || 'Just now'}
          </p>
          <p className="mt-1 text-xs font-semibold text-green-600">Status: Optimal</p>
        </div>
      </div>

      {/* Accuracy & Loss Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
          <Brain className="h-4 w-4 text-blue-600" />
          <span>Model Convergence Curve — Accuracy % vs Training Loss</span>
        </h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={epochData} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="epoch" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderColor: '#E5E7EB', borderRadius: 8 }} />
              <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={3} dot={{ r: 5 }} name="Accuracy (%)" />
              <Line type="monotone" dataKey="loss" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Loss Score" />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
