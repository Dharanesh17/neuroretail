import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Users } from 'lucide-react';
import { api } from '../api/client';

export default function RecommendationEngine() {
  const [recs, setRecs] = useState(null);
  const [activeUserId, setActiveUserId] = useState('CUST-001');

  useEffect(() => {
    api.getRecommendations(activeUserId).then(setRecs);
  }, [activeUserId]);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>Hybrid Recommendation Architecture</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              AI Product Recommendation System
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Combines TF-IDF Content Filtering with Collaborative Affinity vectors for personalised product suggestions.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Customer:</span>
            <select
              value={activeUserId}
              onChange={(e) => setActiveUserId(e.target.value)}
              className="border-0 bg-transparent text-xs font-bold text-slate-900 focus:outline-none dark:text-white"
            >
              <option value="CUST-001">Rahul Sharma</option>
              <option value="CUST-002">Priya Patel</option>
              <option value="CUST-003">Ananya Iyer</option>
            </select>
          </div>
        </div>
      </section>

      {/* Dual column cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Content-Based Filtering */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-black text-slate-950 dark:text-white">Content-Based Filtering</h3>
                <p className="text-xs font-medium text-slate-400">Item tag &amp; specification similarity vector</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Cosine Similarity
            </span>
          </div>
          <div className="space-y-3">
            {(recs?.content_based || []).map((item, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-950 dark:text-white">{item.product?.name}</h4>
                      <p className="text-xs font-medium text-slate-400">₹{formatINR(item.product?.current_price)} · {item.product?.category}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {item.similarity_score}% Match
                  </span>
                </div>
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
                  💡 <span className="font-bold">AI Reason:</span> {item.match_reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collaborative Filtering */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-black text-slate-950 dark:text-white">Collaborative Filtering</h3>
                <p className="text-xs font-medium text-slate-400">User segment affinity &amp; co-purchase behaviour</p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              User Matrix
            </span>
          </div>
          <div className="space-y-3">
            {(recs?.collaborative || []).map((item, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-950 dark:text-white">{item.product?.name}</h4>
                      <p className="text-xs font-medium text-slate-400">₹{formatINR(item.product?.current_price)} · Rating: {item.product?.rating} ⭐</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Affinity: {item.affinity_score}
                  </span>
                </div>
                <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
                  🤝 <span className="font-bold">Behaviour Insight:</span> {item.match_reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
