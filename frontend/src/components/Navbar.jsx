import React, { useEffect, useState } from 'react';
import {
  Bell,
  Bot,
  ChevronDown,
  Globe2,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Store,
  Sun,
  UserCircle,
} from 'lucide-react';

export default function Navbar({ onOpenVoice, onTriggerRetrain, aiMetrics, alertCount, onOpenAlerts }) {
  const [retraining, setRetraining] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleRetrain = async () => {
    setRetraining(true);
    await onTriggerRetrain();
    setTimeout(() => setRetraining(false), 900);
  };

  const toggleMenu = (menu) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-sm">
            NR
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">
                NeuroRetail
              </h1>
              <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                Enterprise
              </span>
            </div>
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              AI retail intelligence workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleMenu('stores')}
          className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 md:flex"
          title="Switch store"
        >
          <Store className="h-4 w-4 text-blue-600" />
          <span>ABC Supermarket</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        <div className="relative ml-auto hidden w-full max-w-xl lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search products, reports, orders, customers..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-24 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-950"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-950">
            Ctrl K
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={handleRetrain}
            disabled={retraining}
            className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 md:flex"
            title="Retrain AI models"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-600 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Training' : `${aiMetrics?.accuracy || 94.8}% AI`}</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoice}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
            title="AI assistant"
          >
            <Bot className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => toggleMenu('messages')}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:inline-flex"
            title="Messages"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onOpenAlerts}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                {alertCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleMenu('language')}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 xl:inline-flex"
            title="Language"
          >
            <Globe2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDark((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => toggleMenu('settings')}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 xl:inline-flex"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => toggleMenu('profile')}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 transition hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            title="User profile"
          >
            <UserCircle className="h-5 w-5 text-slate-500" />
            <span className="hidden text-xs font-bold md:inline">Admin</span>
          </button>
        </div>
      </div>

      {activeMenu && (
        <div className="absolute right-4 top-[calc(100%+8px)] w-72 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {activeMenu === 'stores' && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Store selector</p>
              {['ABC Supermarket', 'XYZ Fashion Outlet', 'Fresh Mart Express'].map((store, index) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => setActiveMenu(null)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-bold transition ${
                    index === 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{store}</span>
                  {index === 0 && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          )}

          {activeMenu === 'messages' && (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Messages</p>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="font-black text-slate-900 dark:text-white">Pricing review complete</p>
                <p className="mt-1 text-xs font-medium text-slate-500">AI has prepared 2 recommended price changes.</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="font-black text-slate-900 dark:text-white">Inventory queue updated</p>
                <p className="mt-1 text-xs font-medium text-slate-500">1 purchase order is ready for approval.</p>
              </div>
            </div>
          )}

          {activeMenu === 'language' && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Language</p>
              {['English', 'Hindi', 'Tamil'].map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setActiveMenu(null)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span>{language}</span>
                  {language === 'English' && <span className="text-xs text-blue-600">Active</span>}
                </button>
              ))}
            </div>
          )}

          {activeMenu === 'settings' && (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Settings</p>
              <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span>Email alerts</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
              </label>
              <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span>Auto-refresh</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
              </label>
            </div>
          )}

          {activeMenu === 'profile' && (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">User profile</p>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="font-black text-slate-900 dark:text-white">Admin User</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Retail operations manager</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu(null)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
