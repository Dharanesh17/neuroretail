import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Store,
  TrendingUp,
  Cpu,
  Users,
  KeyRound,
  X,
  Zap,
  Activity,
  LineChart,
  Tags,
  PackageCheck,
  Moon,
  Sun,
  LockKeyhole
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      setErrorMsg('Please enter your User Name.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await onLoginSuccess({
        username: cleanId,
        id: cleanId,
        email: cleanId,
        password,
        role: selectedRole,
        rememberMe
      });
      if (result && result.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('Unable to connect to authentication server. Please check your network.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-200 selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      {/* Top Header Bar strictly matching Website Navbar.jsx */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          {/* Brand Logo & Monogram */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-sm">
              NR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white font-heading">
                  NeuroRetail
                </h1>
                <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  Enterprise
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                AI retail intelligence workspace
              </p>
            </div>
          </div>

          {/* Right Header Navigation Badges */}
          <div className="flex items-center gap-2.5">
            <div className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:flex">
              <Store className="h-4 w-4 text-blue-600" />
              <span>ABC Supermarket</span>
            </div>

            <div className="hidden h-10 items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI core online (v2.4)</span>
            </div>

            {/* Dark/Light Theme Switcher matching Website */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              title="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6">
        {/* Breadcrumb line strictly matching App.jsx layout */}
        <div className="mb-5 flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>NeuroRetail</span>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">Access Control</span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400">Sign In</span>
        </div>

        {/* Dual-column content */}
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Website-Styled Capability Showcase */}
          <section className="space-y-5 lg:col-span-7">
            {/* Top Page Header matching PageHeader in EnterpriseViews.jsx */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                Autonomous Retail Intelligence
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl font-heading">
                Dynamic Pricing & Predictive Demand Operations
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">
                Welcome to the NeuroRetail unified operational workspace. Sign in to access real-time price elasticity calculations, multi-horizon demand forecasting, and automated replenishment for store networks.
              </p>
            </div>

            {/* 4 KPI Metric Cards strictly matching MetricCard in EnterpriseViews.jsx */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Forecast Accuracy</p>
                    <p className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white font-heading">
                      96.8%
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ↑ 2.4% over baseline
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Daily Revenue</p>
                    <p className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white font-heading">
                      ₹12,40,000
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Activity className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Real-time monitored GMV
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Catalog SKUs</p>
                    <p className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white font-heading">
                      1,420+
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <Cpu className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Sanitized & cleaned
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Decision Engine</p>
                    <p className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white font-heading">
                      15s Pulse
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                    <Zap className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Live background sync
                </p>
              </div>
            </div>

            {/* Core Architectural Pillars */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-black text-slate-950 dark:text-white text-sm uppercase tracking-wider text-slate-400 mb-3">
                Integrated Capabilities
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Tags className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dynamic Pricing Engine</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Automated surge and clearance algorithms with margin guardrails.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">EOQ Smart Replenishment</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Purchase order dispatch triggered before stock breaches safety levels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                    <LineChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Demand Forecast Modeling</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Explainable multi-horizon demand curves and season elasticity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Role-Based Access Control</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Discrete views for Admin, Store Manager, Analyst, and Supplier.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security footnote */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                256-Bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Zero-Trust Session
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Explainable Decision Audits
              </span>
            </div>
          </section>

          {/* Right Column: Clean White Login Card matching Website */}
          <section className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">
                    Sign In
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Access your retail operations command center
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <LockKeyhole className="h-4 w-4" />
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1 font-semibold">{errorMsg}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg('')}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Form Controls */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    User Name
                  </label>
                  <div className="relative mt-1.5">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="User Name"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(identifier.includes('@') ? identifier : `${identifier}@neuroretail.demo`);
                        setForgotModalOpen(true);
                        setForgotSubmitted(false);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 accent-blue-600 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span>Remember credentials</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">30-day session</span>
                </div>

                {/* Primary Button matching Website style */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Authenticating session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Note */}
              <div className="mt-5 text-center">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Protected by enterprise encryption & automated audit trail
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
              <KeyRound className="h-6 w-6" />
            </div>

            <h3 className="font-heading text-xl font-bold text-slate-950 dark:text-white">
              Reset Security Credentials
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your enterprise work email. A secure, one-time verification recovery link will be sent to your inbox.
            </p>

            {forgotSubmitted ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-bold">Recovery link dispatched!</p>
                    <p className="mt-0.5 text-emerald-700 dark:text-emerald-400/90">
                      Check your inbox for <strong className="text-slate-950 dark:text-white">{forgotEmail}</strong>. Valid for 15 minutes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.trim()) {
                    setForgotSubmitted(true);
                  }
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Registered Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@neuroretail.demo"
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
