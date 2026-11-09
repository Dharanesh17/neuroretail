import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanId = (identifier || '').trim();
    if (!cleanId) { setErrorMsg('Please enter your username.'); return; }
    if (!password) { setErrorMsg('Please enter your password.'); return; }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await onLoginSuccess({
        username: cleanId,
        id: cleanId,
        email: cleanId,
        password,
        rememberMe
      });
      if (result && result.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the authentication server. Please check your network.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 transition-colors duration-200 p-4">
      {/* Login card */}
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Brand */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow">
            NR
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">NeuroRetail</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Enterprise AI Retail Intelligence</p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <div className="flex-1 font-semibold">{errorMsg}</div>
            <button type="button" onClick={() => setErrorMsg('')} className="text-xs font-black text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(identifier.includes('@') ? identifier : `${identifier}@neuroretail.demo`);
                  setForgotModalOpen(true);
                  setForgotSubmitted(false);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-3 pr-14 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 hover:text-slate-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              Remember me
            </label>
            <span className="text-[11px] font-medium text-slate-400">30-day session</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] font-medium text-slate-400">
          Protected by enterprise-grade authentication
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-slate-900">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute right-4 top-4 text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-slate-950 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-5">
              Contact your administrator to reset your password, or enter your email to receive a recovery link.
            </p>

            {forgotSubmitted ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                  <p className="font-bold">Recovery request submitted</p>
                  <p className="mt-0.5">
                    If <strong className="text-slate-950">{forgotEmail}</strong> is registered, a reset link will be sent.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.trim()) setForgotSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Send Link
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
