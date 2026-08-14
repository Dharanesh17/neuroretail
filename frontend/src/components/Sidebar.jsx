import React, { useState } from 'react';
import {
  AlertTriangle, Bot, BrainCircuit, ChartNoAxesCombined, ChevronLeft, ChevronRight,
  CircleGauge, ClipboardCheck, FileBarChart, History, LayoutDashboard, LineChart,
  Package, PackageCheck, Settings, ShieldCheck, SlidersHorizontal, Tags, UploadCloud,
  Users
} from 'lucide-react';

const groups = [
  { label: 'Overview', items: [{ id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard }] },
  { label: 'Intelligence', items: [
    { id: 'forecast', label: 'Demand Forecast', icon: LineChart },
    { id: 'pricing', label: 'Dynamic Pricing', icon: Tags },
    { id: 'inventory', label: 'Inventory Optimization', icon: PackageCheck },
    { id: 'recommendations', label: 'AI Recommendations', icon: BrainCircuit, badge: 'New' },
  ] },
  { label: 'Analysis', items: [
    { id: 'scenario', label: 'What-if Simulator', icon: SlidersHorizontal },
    { id: 'competitors', label: 'Competitor Analysis', icon: ChartNoAxesCombined },
    { id: 'models', label: 'Model Performance', icon: CircleGauge },
    { id: 'quality', label: 'Data Quality', icon: ClipboardCheck },
  ] },
  { label: 'Management', items: [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ] },
  { label: 'System', items: [
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'upload', label: 'Data Upload', icon: UploadCloud },
  ] },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-r ${collapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'}`}>
      <div className="flex h-full flex-col p-3 lg:p-4">
        <div className="mb-3 hidden items-center justify-between lg:flex">
          {!collapsed && <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Workspace</p><p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">Retail operations</p></div>}
          <button type="button" onClick={() => setCollapsed((value) => !value)} title={collapsed ? 'Expand navigation' : 'Collapse navigation'} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600 dark:border-slate-800"><>{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</></button>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:overflow-visible lg:pb-0">
          {groups.map((group) => <div key={group.label} className="mb-3 lg:mb-4">
            {!collapsed && <p className="mb-1.5 hidden px-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 lg:block">{group.label}</p>}
            <div className="flex gap-1.5 lg:block lg:space-y-1">{group.items.map((item) => {
              const Icon = item.icon; const active = activeTab === item.id;
              return <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} title={item.label} className={`group flex min-w-max items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition lg:w-full lg:min-w-0 ${collapsed ? 'lg:justify-center lg:px-2' : 'lg:justify-between'} ${active ? 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white'}`}>
                <span className="flex min-w-0 items-center gap-3"><Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />{!collapsed && <span className="truncate">{item.label}</span>}</span>
                {!collapsed && item.badge && <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{item.badge}</span>}
              </button>;
            })}</div>
          </div>)}
        </nav>
        <div className={`mt-auto hidden rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30 lg:block ${collapsed ? 'p-2 text-center' : ''}`}>
          <div className={`flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300 ${collapsed ? 'justify-center' : ''}`}><span className="h-2 w-2 rounded-full bg-emerald-500" />{!collapsed && 'AI core online'}</div>
          {!collapsed && <p className="mt-1 text-[11px] leading-4 text-emerald-700/80 dark:text-emerald-300/80">Decision engine refreshes data every 15 seconds.</p>}
        </div>
        <button type="button" onClick={() => setActiveTab('assistant')} className={`mt-3 hidden items-center gap-3 rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 lg:flex ${collapsed ? 'justify-center px-2' : ''}`} title="NeuroRetail Assistant"><Bot className="h-4 w-4" />{!collapsed && 'NeuroRetail Assistant'}</button>
      </div>
    </aside>
  );
}
