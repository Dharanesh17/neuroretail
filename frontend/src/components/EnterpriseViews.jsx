import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bot, Boxes,
  BrainCircuit, Check, CheckCircle2, CircleAlert, ClipboardCheck, Database,
  Download, FileBarChart, FileText, Gauge, History, Lightbulb, LockKeyhole,
  PackageCheck, RefreshCw, ShieldCheck, SlidersHorizontal, Sparkles, Target,
  TrendingUp, UploadCloud, Users, WandSparkles
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { api } from '../api/client';

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const number = (value) => Number(value || 0).toLocaleString('en-IN');

const cardClass = 'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60';

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          {eyebrow && <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700"><Sparkles className="h-3.5 w-3.5" />{eyebrow}</p>}
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  };
  return (
    <article className={`${cardClass} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{note}</p>
    </article>
  );
}

const sampleTrend = [
  { period: 'Mon', revenue: 188000, forecast: 179000 }, { period: 'Tue', revenue: 204000, forecast: 198000 },
  { period: 'Wed', revenue: 194000, forecast: 207000 }, { period: 'Thu', revenue: 226000, forecast: 219000 },
  { period: 'Fri', revenue: 241000, forecast: 232000 }, { period: 'Sat', revenue: 276000, forecast: 267000 },
  { period: 'Sun', revenue: 239000, forecast: 248000 },
];

export function ExecutiveDashboard({ summary, onNavigate }) {
  const metrics = summary || {};
  const kpis = [
    ['Total revenue', currency(metrics.total_revenue), '+12.4% vs previous period', TrendingUp, 'blue'],
    ['Gross profit', currency(metrics.gross_profit || metrics.total_profit), `${metrics.profit_margin_pct || 0}% gross margin`, ArrowUpRight, 'green'],
    ['Profit margin', `${metrics.profit_margin_pct || 0}%`, 'Healthy operating margin', Gauge, 'indigo'],
    ['Units sold', number(metrics.units_sold || metrics.total_units_sold), 'Across active product range', Boxes, 'blue'],
    ['Inventory value', currency(metrics.inventory_value), `${metrics.low_stock_count || 0} SKU(s) need attention`, PackageCheck, 'amber'],
    ['Stockout rate', `${metrics.stockout_rate || 0}%`, 'SKUs at or below safety stock', CircleAlert, metrics.stockout_rate > 20 ? 'red' : 'amber'],
    ['Overstock rate', `${metrics.overstock_rate || 0}%`, 'Capital held above target', Database, 'amber'],
    ['Forecast accuracy', `${metrics.forecast_accuracy || metrics.ai_accuracy || 0}%`, 'Validated against recent actuals', Target, 'green'],
    ['Average selling price', currency(metrics.average_selling_price), 'Realised sales average', BarChart3, 'indigo'],
    ['Price change impact', `+${currency(metrics.price_change_impact)}`, 'Expected incremental gross profit', WandSparkles, 'green'],
  ];
  const decision = metrics.decision_summary || {};
  const recommendations = metrics.recommendations || [];

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Executive overview" title="Retail intelligence at a glance" description="A management view of what is happening, why it is happening, and which operational decision should be made next." action={<button type="button" className={buttonClass} onClick={() => onNavigate('recommendations')}><BrainCircuit className="h-4 w-4" />Review AI actions</button>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpis.map(([label, value, note, icon, tone]) => <MetricCard key={label} label={label} value={value} note={note} icon={icon} tone={tone} />)}</section>
      <section className="grid gap-5 xl:grid-cols-3">
        <div className={`${cardClass} p-5 xl:col-span-2`}>
          <div className="flex items-start justify-between"><div><h3 className="font-black text-slate-950 dark:text-white">Revenue and demand direction</h3><p className="mt-1 text-sm text-slate-500">Actual performance against the AI baseline.</p></div><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">7-day view</span></div>
          <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={sampleTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="period" fontSize={12} /><YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} /><Tooltip formatter={(v) => currency(v)} /><Legend /><Line type="monotone" dataKey="revenue" name="Actual revenue" stroke="#2563eb" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="forecast" name="AI forecast" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="6 4" dot={false} /></LineChart></ResponsiveContainer></div>
        </div>
        <div className={`${cardClass} p-5`}>
          <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-blue-600" /><h3 className="font-black text-slate-950 dark:text-white">Manager briefing</h3></div>
          <div className="mt-4 space-y-3">
            {[['What is happening?', decision.what || 'Revenue and gross margin remain within target range.'], ['Why is it happening?', decision.why || 'A small number of fast-moving SKUs have reached their reorder threshold.'], ['What should I do?', decision.action || 'Review the current pricing and replenishment actions.']].map(([title, detail], index) => <div key={title} className={`rounded-lg border p-3 ${index === 2 ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-800'}`}><p className="text-xs font-black text-slate-900 dark:text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{detail}</p></div>)}
          </div>
        </div>
      </section>
      <section className={`${cardClass} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black text-slate-950 dark:text-white">Priority decision queue</h3><p className="mt-1 text-sm text-slate-500">Explainable decisions prepared from demand, price, and inventory signals.</p></div><button type="button" onClick={() => onNavigate('recommendations')} className="text-sm font-bold text-blue-700 hover:text-blue-800">Open recommendation center <ArrowRight className="inline h-4 w-4" /></button></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">{recommendations.length ? recommendations.map((item) => <div key={item.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between gap-2"><span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${item.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.priority} priority</span><span className="text-xs font-bold text-slate-400">{item.confidence}% confidence</span></div><p className="mt-3 font-black text-slate-950 dark:text-white">{item.product}</p><p className="mt-1 text-sm font-semibold text-blue-700">{item.recommendation}</p><p className="mt-2 text-xs text-slate-500">Expected profit: {currency(item.expected_profit)}</p></div>) : <p className="text-sm text-slate-500">Decision recommendations will appear here when the API is online.</p>}</div>
      </section>
    </div>
  );
}

function ActionToast({ text }) {
  return text ? <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{text}</div> : null;
}

export function RecommendationCenter({ onChanged }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');
  const load = async () => { setLoading(true); const data = await api.getDecisionRecommendations(); setRecommendations(data.recommendations || []); setLoading(false); };
  useEffect(() => { load(); }, []);
  const apply = async (item) => {
    setBusy(item.id);
    await api.updatePrice(item.product_id, item.recommended_price);
    if (item.replenishment_units > 0) await api.reorderStock(item.product_id, item.replenishment_units);
    await onChanged?.();
    setToast(`AI action approved for ${item.product}. The audit trail has been updated.`);
    setBusy('');
    setTimeout(() => setToast(''), 3500);
  };
  return <div className="space-y-5">
    <PageHeader eyebrow="AI decision engine" title="Actionable recommendations, not black-box predictions" description="Every recommendation combines demand forecasting, pricing optimisation, inventory targets, and a plain-language explanation for the manager." action={<button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>} />
    {loading ? <div className={`${cardClass} p-10 text-center text-sm font-semibold text-slate-500`}>Generating explainable business actions…</div> : <section className="grid gap-4">{recommendations.map((item) => <article key={item.id} className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.priority} priority</span><span className="text-xs font-bold text-slate-400">{item.confidence}% confidence</span></div><h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">{item.product}</h3><p className="text-sm font-semibold text-blue-700">{item.recommendation}</p></div><button type="button" onClick={() => apply(item)} disabled={busy === item.id} className={buttonClass}>{busy === item.id ? 'Applying…' : <><Check className="h-4 w-4" />Approve action</>}</button></div></div>
      <div className="grid gap-4 p-4 lg:grid-cols-3"><div className="grid grid-cols-2 gap-3 lg:col-span-2">{[['Predicted demand', `${item.predicted_demand} units`], ['Current / target stock', `${item.current_stock} / ${item.recommended_stock}`], ['Current / recommended price', `${currency(item.current_price)} / ${currency(item.recommended_price)}`], ['Replenishment', `${item.replenishment_units} units`], ['Expected revenue', currency(item.expected_revenue)], ['Expected profit', currency(item.expected_profit)]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] font-black uppercase text-slate-400">{label}</p><p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p></div>)}</div><div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"><div className="flex items-center gap-2 text-sm font-black text-blue-900 dark:text-blue-200"><Lightbulb className="h-4 w-4" />Why this action?</div><ul className="mt-3 space-y-2">{item.reasons.map((reason) => <li key={reason} className="flex gap-2 text-xs leading-5 text-blue-900/80 dark:text-blue-100/80"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />{reason}</li>)}</ul></div></div>
    </article>)}{!recommendations.length && <div className={`${cardClass} p-10 text-center text-sm text-slate-500`}>No recommendations are available yet.</div>}</section>}<ActionToast text={toast} />
  </div>;
}

export function ScenarioSimulator({ products = [] }) {
  const selectedDefault = products[0]?.id || 'PROD-101';
  const [productId, setProductId] = useState(selectedDefault);
  const product = products.find((item) => item.id === productId) || products[0] || {};
  const [settings, setSettings] = useState({ price: product.current_price || 14999, promotion_pct: 0, inventory: product.stock || 50, competitor_price: product.competitor_price || 14499 });
  const [scenario, setScenario] = useState(null);
  const [baseline, setBaseline] = useState(null);
  useEffect(() => { if (product.id) setSettings({ price: product.current_price, promotion_pct: 0, inventory: product.stock, competitor_price: product.competitor_price }); }, [productId, product.id]);
  useEffect(() => { if (!product.id) return; const timer = setTimeout(async () => { const [now, current] = await Promise.all([api.simulateScenario({ product_id: product.id, ...settings }), api.simulateScenario({ product_id: product.id, price: product.current_price, promotion_pct: 0, inventory: product.stock, competitor_price: product.competitor_price })]); setScenario(now); setBaseline(current); }, 180); return () => clearTimeout(timer); }, [product.id, settings]);
  const update = (key, value) => setSettings((current) => ({ ...current, [key]: Number(value) }));
  const stats = [['Revenue', currency(baseline?.revenue), currency(scenario?.revenue)], ['Profit', currency(baseline?.profit), currency(scenario?.profit)], ['Demand', `${baseline?.demand || 0} units`, `${scenario?.demand || 0} units`], ['Ending inventory', `${baseline?.ending_inventory || 0} units`, `${scenario?.ending_inventory || 0} units`], ['Margin', `${baseline?.margin || 0}%`, `${scenario?.margin || 0}%`]];
  return <div className="space-y-5"><PageHeader eyebrow="Scenario analysis" title="Test a decision before it reaches the shelf" description="Change price, promotion, inventory, expected demand drivers, and competitor price to compare your scenario with the current operating plan." />
    <section className="grid gap-5 xl:grid-cols-5"><div className={`${cardClass} p-5 xl:col-span-2`}><label className="text-xs font-black uppercase text-slate-400">Product</label><select value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><div className="mt-6 space-y-5">{[['Price', 'price', Math.max(100, (product.unit_cost || 1000) * 0.9), (product.current_price || 15000) * 1.35, '₹'], ['Promotion', 'promotion_pct', 0, 30, '%'], ['Inventory quantity', 'inventory', 0, Math.max(200, (product.max_stock || 100) * 1.5), ' units'], ['Competitor price', 'competitor_price', Math.max(100, (product.current_price || 15000) * 0.6), (product.current_price || 15000) * 1.4, '₹']].map(([label, key, min, max, suffix]) => <label key={key} className="block"><div className="flex items-center justify-between text-sm"><span className="font-bold text-slate-700 dark:text-slate-200">{label}</span><span className="font-black text-blue-700">{suffix === '₹' ? currency(settings[key]) : `${settings[key]}${suffix}`}</span></div><input className="mt-2 h-2 w-full cursor-pointer accent-blue-600" type="range" min={min} max={max} step={key === 'price' || key === 'competitor_price' ? 100 : 1} value={settings[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></div>
    <div className={`${cardClass} p-5 xl:col-span-3`}><div className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-indigo-600" /><div><h3 className="font-black text-slate-950 dark:text-white">Current plan vs your scenario</h3><p className="text-sm text-slate-500">Projection accounts for price elasticity, promotional lift, competitive position, and available inventory.</p></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-400 dark:border-slate-800"><tr><th className="pb-3">Metric</th><th className="pb-3">Current</th><th className="pb-3 text-blue-700">Your scenario</th><th className="pb-3">Difference</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{stats.map(([label, before, after]) => <tr key={label}><td className="py-4 font-bold text-slate-700 dark:text-slate-200">{label}</td><td className="py-4 text-slate-500">{before}</td><td className="py-4 font-black text-blue-700">{after}</td><td className="py-4 font-bold text-emerald-600">{label === 'Demand' || label === 'Ending inventory' ? 'Projected' : <><ArrowUpRight className="inline h-4 w-4" /> {currency((scenario?.[label.toLowerCase()] || 0) - (baseline?.[label.toLowerCase()] || 0))}</>}</td></tr>)}</tbody></table></div><div className="mt-5 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-100"><span className="font-black">Decision signal: </span>{scenario?.unmet_demand ? `Your scenario could leave ${scenario.unmet_demand} units of demand unfulfilled; increase inventory before running this promotion.` : `This scenario can fulfil projected demand with ${scenario?.ending_inventory || 0} units remaining.`}</div></div></section>
  </div>;
}

export function ModelPerformanceCenter() {
  const [data, setData] = useState(null);
  useEffect(() => { api.getModelPerformance().then(setData); }, []);
  return <div className="space-y-5"><PageHeader eyebrow="Model governance" title="Forecast model performance center" description="Compare model quality, verify the current champion model, and inspect its performance against recent actual sales." /><section className="grid gap-4 sm:grid-cols-4"><MetricCard label="Champion model" value={data?.best_model || 'Loading…'} note="Selected by lowest MAPE" icon={BrainCircuit} tone="indigo" /><MetricCard label="Training date" value={data?.last_trained?.slice(0, 10) || '—'} note="Most recent model refresh" icon={History} tone="blue" /><MetricCard label="Dataset size" value={number(data?.dataset_size)} note="Validated historical rows" icon={Database} tone="green" /><MetricCard label="Model version" value={data?.model_version || '—'} note="Production candidate" icon={ShieldCheck} tone="amber" /></section><section className="grid gap-5 xl:grid-cols-5"><div className={`${cardClass} p-5 xl:col-span-3`}><h3 className="font-black text-slate-950 dark:text-white">Forecast versus actual</h3><p className="mt-1 text-sm text-slate-500">Weekly unit forecast back-test for the champion model.</p><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.forecast_vs_actual || []}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="period" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend /><Bar dataKey="actual" name="Actual units" fill="#2563eb" radius={[4, 4, 0, 0]} /><Bar dataKey="forecast" name="Forecast units" fill="#a5b4fc" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className={`${cardClass} p-5 xl:col-span-2`}><h3 className="font-black text-slate-950 dark:text-white">Selection rule</h3><div className="mt-4 space-y-3">{['MAPE is the primary accuracy metric.', 'RMSE is monitored to catch large misses.', 'R² validates trend capture across the period.', 'The lowest stable MAPE is promoted as champion.'].map((rule) => <div key={rule} className="flex gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{rule}</div>)}</div></div></section><section className={`${cardClass} overflow-x-auto p-5`}><h3 className="font-black text-slate-950 dark:text-white">Model comparison</h3><table className="mt-4 w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800"><tr><th className="pb-3">Model</th><th className="pb-3">Type</th><th className="pb-3">MAPE</th><th className="pb-3">RMSE</th><th className="pb-3">MAE</th><th className="pb-3">R²</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{(data?.algorithms || []).map((model) => <tr key={model.name}><td className="py-4 font-black text-slate-950 dark:text-white">{model.name}</td><td className="py-4 text-slate-500">{model.type}</td><td className="py-4 font-bold">{model.mape}%</td><td className="py-4">{model.rmse}</td><td className="py-4">{model.mae}</td><td className="py-4">{model.r2_score}</td><td className="py-4"><span className={`rounded px-2 py-1 text-xs font-black ${model.status === 'Best' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{model.status}</span></td></tr>)}</tbody></table></section></div>;
}

export function DataQualityMonitor({ onNavigate }) {
  const [report, setReport] = useState(null);
  useEffect(() => { api.getDataQuality().then(setReport); }, []);
  const score = report?.quality_score || 0;
  return <div className="space-y-5"><PageHeader eyebrow="Trusted inputs" title="Data quality monitor" description="Validate uploaded retail data before it reaches demand forecasting, pricing, or inventory optimisation." action={<button type="button" className={buttonClass} onClick={() => onNavigate('upload')}><UploadCloud className="h-4 w-4" />Upload dataset</button>} /><section className="grid gap-5 lg:grid-cols-3"><div className={`${cardClass} flex flex-col items-center justify-center p-7`}><div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-emerald-100 text-center dark:border-emerald-950"><div><p className="text-3xl font-black text-emerald-600">{score}%</p><p className="text-[10px] font-black uppercase text-slate-400">Quality score</p></div></div><p className="mt-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">{report?.status || 'Checking validation rules…'}</p></div><div className={`${cardClass} p-5 lg:col-span-2`}><h3 className="font-black text-slate-950 dark:text-white">Validation results</h3><p className="mt-1 text-sm text-slate-500">Last checked {report?.timestamp || '—'} {report?.filename ? `• ${report.filename}` : ''}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{(report?.checks || []).map((check) => <div key={check.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"><div className="flex items-center gap-2"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${check.status === 'pass' ? 'bg-emerald-50 text-emerald-600' : check.status === 'fail' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{check.status === 'pass' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}</span><span className="text-sm font-bold text-slate-700 dark:text-slate-200">{check.name}</span></div><span className="text-sm font-black text-slate-950 dark:text-white">{check.count}</span></div>)}</div></div></section><section className={`${cardClass} p-5`}><div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-blue-600" /><h3 className="font-black text-slate-950 dark:text-white">Issues requiring review</h3></div>{report?.issues?.length ? <ul className="mt-4 space-y-2">{report.issues.map((issue) => <li key={issue.message} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">{issue.message}</li>)}</ul> : <p className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">No material data-quality issues are currently open.</p>}</section></div>;
}

export function AlertsCenter() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { api.getOperationalAlerts().then((data) => setAlerts(data.alerts || [])); }, []);
  const tone = { critical: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100', high: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100', medium: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100', healthy: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100', info: 'border-blue-200 bg-blue-50 text-blue-800' };
  return <div className="space-y-5"><PageHeader eyebrow="Operational alerts" title="Inventory signals with a reason" description="Critical stock, low stock, overstock, reorder recommendations, and healthy inventory are surfaced with a clear explanation." /><section className="grid gap-3">{alerts.map((alert) => <article key={alert.id} className={`rounded-xl border p-4 ${tone[alert.severity] || tone.info}`}><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><div className="flex items-center gap-2"><h3 className="font-black">{alert.title}</h3><span className="rounded bg-white/70 px-2 py-0.5 text-[10px] font-black uppercase">{alert.status || alert.type}</span></div><p className="mt-1 text-sm leading-6 opacity-90">{alert.message}</p></div></div><span className="text-xs font-bold opacity-70">{alert.timestamp || 'Live'}</span></div></article>)}{!alerts.length && <div className={`${cardClass} p-10 text-center text-sm text-slate-500`}>Loading current inventory signals…</div>}</section></div>;
}

export function AuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.getAuditLogs().then((data) => setLogs(data.logs || [])); }, []);
  return <div className="space-y-5"><PageHeader eyebrow="Governance" title="Audit trail" description="A chronological, accountable record of changes to prices, inventory, model operations, and validated data." /><section className={`${cardClass} overflow-x-auto p-5`}><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800"><tr><th className="pb-3">Date / time</th><th className="pb-3">User</th><th className="pb-3">Action</th><th className="pb-3">Product / scope</th><th className="pb-3">Previous value</th><th className="pb-3">New value</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{logs.map((log) => <tr key={log.id}><td className="py-4 font-semibold text-slate-500">{log.timestamp}</td><td className="py-4"><p className="font-black text-slate-900 dark:text-white">{log.user}</p><p className="text-xs text-slate-400">{log.role}</p></td><td className="py-4"><span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{log.action}</span></td><td className="py-4 font-semibold text-slate-700 dark:text-slate-200">{log.product}</td><td className="py-4 text-slate-500">{log.previous_value}</td><td className="py-4 font-bold text-blue-700">{log.new_value}</td></tr>)}</tbody></table></section></div>;
}

export function CompetitorAnalysis() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.getCompetitorAnalysis().then(setItems); }, []);
  return <div className="space-y-5"><PageHeader eyebrow="Market intelligence" title="Competitor price analysis" description="Track each active SKU against its nearest observed competitor and identify conversion risk before it affects sales." /><section className={`${cardClass} overflow-x-auto p-5`}><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800"><tr><th className="pb-3">Product</th><th className="pb-3">Category</th><th className="pb-3">Our price</th><th className="pb-3">Competitor</th><th className="pb-3">Gap</th><th className="pb-3">Position</th><th className="pb-3">Signal</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{items.map((item) => <tr key={item.product_id}><td className="py-4 font-black text-slate-950 dark:text-white">{item.product}</td><td className="py-4 text-slate-500">{item.category}</td><td className="py-4 font-bold">{currency(item.our_price)}</td><td className="py-4">{currency(item.competitor_price)}</td><td className={`py-4 font-black ${item.price_gap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{item.price_gap > 0 ? '+' : ''}{currency(item.price_gap)}</td><td className="py-4">{item.position}</td><td className="py-4"><span className={`rounded px-2 py-1 text-xs font-black ${item.signal === 'Conversion risk' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{item.signal}</span></td></tr>)}</tbody></table></section></div>;
}

export function ProductManagement({ products = [], onNavigate }) {
  return <div className="space-y-5"><PageHeader eyebrow="Catalogue management" title="Products and inventory controls" description="Maintain the managed product catalogue and move directly into pricing, forecasting, or inventory decisions for each SKU." /><section className={`${cardClass} overflow-x-auto p-5`}><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800"><tr><th className="pb-3">Product</th><th className="pb-3">Category</th><th className="pb-3">Price</th><th className="pb-3">Stock / target</th><th className="pb-3">Demand</th><th className="pb-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{products.map((product) => <tr key={product.id}><td className="py-4"><p className="font-black text-slate-950 dark:text-white">{product.name}</p><p className="text-xs text-slate-400">{product.id}</p></td><td className="py-4 text-slate-500">{product.category}</td><td className="py-4 font-black text-blue-700">{currency(product.current_price)}</td><td className="py-4"><span className={`font-black ${product.stock <= product.min_stock ? 'text-red-600' : product.stock >= product.max_stock ? 'text-amber-600' : 'text-emerald-600'}`}>{product.stock}</span><span className="text-slate-400"> / {product.min_stock}–{product.max_stock}</span></td><td className="py-4"><div className="flex items-center gap-2"><span className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><span className="block h-full rounded-full bg-blue-600" style={{ width: `${product.demand_score}%` }} /></span>{product.demand_score}/100</div></td><td className="py-4"><div className="flex gap-2"><button type="button" onClick={() => onNavigate('pricing')} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200">Price</button><button type="button" onClick={() => onNavigate('inventory')} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200">Stock</button></div></td></tr>)}</tbody></table></section></div>;
}

export function ReportsCenter() {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => { api.getReports().then(setReport); }, []);
  const exportPdf = () => {
    const pdf = new jsPDF();
    const metrics = report?.metrics || {};
    pdf.setFontSize(20); pdf.text('NeuroRetail Executive Decision Report', 16, 20);
    pdf.setFontSize(10); pdf.setTextColor(90); pdf.text(`Generated ${report?.generated_at || new Date().toLocaleString()}`, 16, 28);
    pdf.setTextColor(20); pdf.setFontSize(13); pdf.text('Executive KPI snapshot', 16, 42);
    const entries = [['Total revenue', currency(metrics.total_revenue)], ['Gross profit', currency(metrics.gross_profit)], ['Profit margin', `${metrics.profit_margin_pct || 0}%`], ['Inventory value', currency(metrics.inventory_value)], ['Forecast accuracy', `${metrics.forecast_accuracy || 0}%`]];
    entries.forEach(([label, value], index) => pdf.text(`${label}: ${value}`, 18, 52 + index * 9));
    pdf.setFontSize(13); pdf.text('Priority AI recommendations', 16, 105);
    (report?.recommendations || []).slice(0, 4).forEach((item, index) => { pdf.setFontSize(10); pdf.text(`${index + 1}. ${item.product}: ${item.recommendation}`, 18, 115 + index * 14, { maxWidth: 175 }); });
    pdf.save('neuroretail-executive-report.pdf'); setMessage('PDF report downloaded.'); setTimeout(() => setMessage(''), 2500);
  };
  const exportCsv = () => { const rows = [['Product', 'Recommendation', 'Expected Revenue', 'Expected Profit'], ...(report?.recommendations || []).map((item) => [item.product, item.recommendation, item.expected_revenue, item.expected_profit])]; const blob = new Blob([rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'neuroretail-ai-actions.csv'; link.click(); URL.revokeObjectURL(link.href); setMessage('CSV export downloaded.'); setTimeout(() => setMessage(''), 2500); };
  return <div className="space-y-5"><PageHeader eyebrow="Management reporting" title="Export decision-ready reports" description="Share a concise KPI summary and explainable AI decisions with managers, suppliers, or project evaluators." action={<div className="flex gap-2"><button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200" onClick={exportCsv}><Download className="h-4 w-4" />CSV</button><button type="button" className={buttonClass} onClick={exportPdf}><FileText className="h-4 w-4" />Export PDF</button></div>} /><section className="grid gap-4 md:grid-cols-3"><MetricCard label="Report status" value="Ready" note={report?.generated_at || 'Preparing data'} icon={CheckCircle2} tone="green" /><MetricCard label="Included KPI groups" value="10" note="Revenue, margin, stock, accuracy & impact" icon={FileBarChart} tone="blue" /><MetricCard label="AI actions" value={report?.recommendations?.length || 0} note="Prioritised business recommendations" icon={BrainCircuit} tone="indigo" /></section><section className={`${cardClass} p-5`}><h3 className="font-black text-slate-950 dark:text-white">Report preview</h3><p className="mt-1 text-sm text-slate-500">The export includes the KPI snapshot and priority actions below.</p><div className="mt-5 grid gap-3">{(report?.recommendations || []).map((item) => <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div><p className="font-black text-slate-950 dark:text-white">{item.product}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.recommendation}</p></div><p className="font-black text-emerald-600">{currency(item.expected_profit)} profit</p></div>)}</div></section><ActionToast text={message} /></div>;
}

export function UsersRoles() {
  const [data, setData] = useState({ users: [], roles: [], current_user: {} });
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.getUsers().then(setData); }, []);
  const selectRole = async (role) => { setSaving(true); const response = await api.switchRole(role); setData((current) => ({ ...current, current_user: response.current_user || current.current_user })); setSaving(false); };
  const permissions = { Admin: 'Users, settings, models, data, audit logs', 'Store Manager': 'Dashboard, pricing, inventory, forecasts, reports', Analyst: 'Data, forecasting, model performance, scenarios', Supplier: 'Limited inventory and reorder visibility' };
  return <div className="space-y-5"><PageHeader eyebrow="Access control" title="Users and roles" description="A focused role model for a retail organisation—enough governance for a professional prototype without unnecessary authentication complexity." /><section className="grid gap-5 xl:grid-cols-3"><div className={`${cardClass} p-5`}><div className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-blue-600" /><h3 className="font-black text-slate-950 dark:text-white">Demo session</h3></div><p className="mt-4 text-lg font-black text-slate-950 dark:text-white">{data.current_user?.name || 'Loading…'}</p><p className="text-sm text-slate-500">{data.current_user?.email}</p><label className="mt-5 block text-xs font-black uppercase text-slate-400">Active role</label><select disabled={saving} value={data.current_user?.role || ''} onChange={(event) => selectRole(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950">{(data.roles || []).map((role) => <option key={role}>{role}</option>)}</select><p className="mt-3 text-xs leading-5 text-slate-500">Role switching is enabled for the demo so the relevant workspace can be reviewed.</p></div><div className={`${cardClass} p-5 xl:col-span-2`}><h3 className="font-black text-slate-950 dark:text-white">Role permissions</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(permissions).map(([role, detail]) => <div key={role} className={`rounded-lg border p-4 ${data.current_user?.role === role ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800'}`}><p className="font-black text-slate-950 dark:text-white">{role}</p><p className="mt-1 text-sm leading-5 text-slate-500">{detail}</p></div>)}</div></div></section><section className={`${cardClass} overflow-x-auto p-5`}><h3 className="font-black text-slate-950 dark:text-white">Registered users</h3><table className="mt-4 w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-400 dark:border-slate-800"><tr><th className="pb-3">User</th><th className="pb-3">Role</th><th className="pb-3">Last login</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.users.map((user) => <tr key={user.id}><td className="py-4"><p className="font-black text-slate-950 dark:text-white">{user.name}</p><p className="text-xs text-slate-400">{user.email}</p></td><td className="py-4 font-bold text-blue-700">{user.role}</td><td className="py-4 text-slate-500">{user.last_login}</td><td className="py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Active</span></td></tr>)}</tbody></table></section></div>;
}

export function SettingsView() {
  return <div className="space-y-5"><PageHeader eyebrow="System" title="Platform settings" description="Configure the operational defaults used by the NeuroRetail demonstration workspace." /><section className="grid gap-5 lg:grid-cols-2">{[['Decision alerts', 'Send notifications when a stock or pricing threshold is crossed.'], ['Daily model monitoring', 'Validate forecast accuracy against actual sales each day.'], ['Audit retention', 'Retain management decisions and model events for project review.'], ['Report footer', 'Include data quality and model version in every export.']].map(([title, detail], index) => <div key={title} className={`${cardClass} flex items-start justify-between gap-5 p-5`}><div><h3 className="font-black text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p></div><input type="checkbox" defaultChecked={index !== 2} className="mt-1 h-5 w-5 accent-blue-600" /></div>)}</section></div>;
}
