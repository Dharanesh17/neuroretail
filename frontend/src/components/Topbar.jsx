import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Bell, 
  Mic, 
  MessageSquareBot, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Plus, 
  ChevronDown,
  User,
  Settings
} from 'lucide-react';

export default function Topbar({ 
  stores, 
  activeStore, 
  onSwitchStore, 
  onOpenStoreWizard,
  userRole, 
  onSwitchRole,
  isDark, 
  onToggleDark,
  onOpenVoice,
  onOpenChat,
  onOpenNotifications
}) {
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between shadow-card transition-colors duration-200">
      {/* Brand & Store Selector */}
      <div className="flex items-center space-x-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md">
            NR
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">NeuroRetail</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                2.0 Enterprise
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">AI Retail Intelligence</span>
          </div>
        </div>

        {/* Store Selector Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{activeStore?.name || 'ABC Supermarket'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Store Environment
              </div>
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSwitchStore(s.id);
                    setStoreDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeStore?.id === s.id
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.type}</div>
                  </div>
                  {activeStore?.id === s.id && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setStoreDropdownOpen(false);
                    onOpenStoreWizard();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center space-x-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Setup New Store</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Global Search */}
      <div className="hidden lg:flex items-center w-72 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search products, orders, reports (Ctrl+K)..."
          className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role Switcher Badge */}
        <select
          value={userRole}
          onChange={(e) => onSwitchRole(e.target.value)}
          className="hidden sm:block px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-blue-600 dark:text-blue-400 focus:outline-none"
        >
          <option value="Super Admin">Super Admin</option>
          <option value="Store Owner">Store Owner</option>
          <option value="Store Manager">Store Manager</option>
          <option value="Analyst">Analyst</option>
        </select>

        {/* AI Voice */}
        <button
          onClick={onOpenVoice}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="Voice AI Assistant"
        >
          <Mic className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </button>

        {/* AI Chatbot */}
        <button
          onClick={onOpenChat}
          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
          title="Open AI Conversational Assistant"
        >
          <MessageSquareBot className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile */}
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-extrabold text-xs">
          JD
        </div>
      </div>
    </header>
  );
}
