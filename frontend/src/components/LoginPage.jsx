import React, { useState } from 'react';

/* ─── Inline SVG icons — no lucide dependency ─────────────────────────── */
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── NeuroRetail Logo SVG (gradient NR + bar-chart) ──────────────────── */
const NeuroRetailLogo = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NeuroRetail logo">
    <defs>
      <linearGradient id="nr-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    {/* N stroke */}
    <path d="M10 54V18L30 42V18" stroke="url(#nr-grad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    {/* R stroke */}
    <path d="M36 18h12a8 8 0 0 1 0 16H36m0 0l14 20" stroke="url(#nr-grad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bar chart accent inside R bow */}
    <rect x="42" y="30" width="4" height="8" rx="1" fill="#3B82F6" opacity="0.85" />
    <rect x="48" y="26" width="4" height="12" rx="1" fill="#2563EB" opacity="0.85" />
    <rect x="54" y="22" width="4" height="16" rx="1" fill="#1D4ED8" opacity="0.85" />
  </svg>
);

/* ─── Decorative background blobs (matching the design) ──────────────── */
const BackgroundBlobs = () => (
  <>
    {/* Top-left large ring */}
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', top: '-80px', left: '-80px', width: '280px', height: '280px',
        borderRadius: '50%', border: '40px solid #D1D5DB', opacity: 0.45, pointerEvents: 'none',
      }}
    />
    {/* Bottom-right rounded blob */}
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', bottom: '-60px', right: '-60px', width: '260px', height: '260px',
        borderRadius: '50%', background: 'linear-gradient(135deg,#E5E7EB,#D1D5DB)', opacity: 0.55, pointerEvents: 'none',
      }}
    />
    {/* Top-right dot grid */}
    <svg
      aria-hidden="true"
      style={{ position: 'fixed', top: '24px', right: '32px', opacity: 0.35, pointerEvents: 'none' }}
      width="120" height="80" viewBox="0 0 120 80"
    >
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2.5" fill="#94A3B8" />
        ))
      )}
    </svg>
    {/* Bottom-left dot grid */}
    <svg
      aria-hidden="true"
      style={{ position: 'fixed', bottom: '32px', left: '24px', opacity: 0.35, pointerEvents: 'none' }}
      width="96" height="80" viewBox="0 0 96 80"
    >
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2.5" fill="#94A3B8" />
        ))
      )}
    </svg>
  </>
);

/* ─── Main LoginPage component ────────────────────────────────────────── */
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
        rememberMe,
      });
      if (result && result.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      }
      // On success, App.jsx re-renders past the gate; no need to clear isLoading
    } catch (err) {
      setErrorMsg('Unable to connect to the authentication server. Please check your network.');
      setIsLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(identifier.includes('@') ? identifier : identifier ? `${identifier}@neuroretail.demo` : '');
    setForgotModalOpen(true);
    setForgotSubmitted(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F1F5F9 0%, #E8EDF5 50%, #EEF2FA 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackgroundBlobs />

      {/* ── Login card ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(30,64,175,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '40px 40px 32px',
        }}
      >
        {/* ── Brand ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <NeuroRetailLogo />
          <h1
            style={{
              marginTop: '12px', marginBottom: 0,
              fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2,
              color: '#0F172A',
            }}
          >
            <span style={{ color: '#0F172A' }}>Neuro</span>
            <span style={{ color: '#2563EB' }}>Retail</span>
          </h1>
        </div>

        {/* ── Error banner ─────────────────────────────────────────── */}
        {errorMsg && (
          <div
            role="alert"
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px',
              marginBottom: '20px', padding: '12px 14px',
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
              color: '#B91C1C', fontSize: '13px', fontWeight: 600,
            }}
          >
            <span style={{ flex: 1 }}>{errorMsg}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setErrorMsg('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#EF4444', fontSize: '14px', fontWeight: 900, padding: '0 2px', lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Username field */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="nr-username"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}
            >
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                }}
              >
                <UserIcon />
              </span>
              <input
                id="nr-username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username"
                style={{
                  width: '100%', height: '52px', boxSizing: 'border-box',
                  paddingLeft: '46px', paddingRight: '16px',
                  fontSize: '15px', fontWeight: 500, color: '#0F172A',
                  background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                  borderRadius: '12px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label
                htmlFor="nr-password"
                style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '13px', fontWeight: 700, color: '#2563EB',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#1D4ED8')}
                onMouseLeave={(e) => (e.target.style.color = '#2563EB')}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                }}
              >
                <LockIcon />
              </span>
              <input
                id="nr-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%', height: '52px', boxSizing: 'border-box',
                  paddingLeft: '46px', paddingRight: '52px',
                  fontSize: '15px', fontWeight: 500, color: '#0F172A',
                  background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                  borderRadius: '12px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: '#94A3B8', display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Remember me row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <label
              htmlFor="nr-remember"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#334155',
                userSelect: 'none',
              }}
            >
              {/* Custom checkbox */}
              <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                <input
                  id="nr-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    appearance: 'none', WebkitAppearance: 'none',
                    width: '20px', height: '20px', borderRadius: '5px', cursor: 'pointer',
                    border: rememberMe ? 'none' : '2px solid #CBD5E1',
                    background: rememberMe ? '#2563EB' : '#FFFFFF',
                    transition: 'background 0.15s, border 0.15s',
                    flexShrink: 0,
                  }}
                />
                {rememberMe && (
                  <svg
                    aria-hidden="true"
                    style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                    }}
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                  >
                    <polyline points="2,6 5,9 10,3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Remember me
            </label>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>30-day session</span>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', height: '54px',
              background: isLoading ? '#93C5FD' : '#2563EB',
              border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.2px',
              boxShadow: isLoading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
              transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(29,78,216,0.40)'; } }}
            onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; } }}
            onMouseDown={(e) => { if (!isLoading) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isLoading ? (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF', borderRadius: '50%',
                    animation: 'nr-spin 0.7s linear infinite',
                    display: 'inline-block', flexShrink: 0,
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRightIcon />
              </>
            )}
          </button>
        </form>

        {/* Protection note */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '20px', color: '#94A3B8', fontSize: '12px', fontWeight: 500,
          }}
        >
          <ShieldIcon />
          <span>Protected by enterprise-grade authentication</span>
        </div>
      </div>

      {/* ── Forgot Password Modal ─────────────────────────────────── */}
      {forgotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setForgotModalOpen(false); }}
        >
          <div
            style={{
              position: 'relative', width: '100%', maxWidth: '380px',
              background: '#FFFFFF', borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              padding: '28px 28px 24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setForgotModalOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '15px', fontWeight: 900, color: '#94A3B8',
                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none'; }}
            >
              ✕
            </button>

            <h3
              id="forgot-modal-title"
              style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}
            >
              Reset Password
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: 1.5 }}>
              Contact your administrator to reset your password, or enter your email to receive a recovery link.
            </p>

            {forgotSubmitted ? (
              <div>
                <div
                  style={{
                    padding: '14px 16px', borderRadius: '10px',
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    color: '#166534', fontSize: '13px', marginBottom: '14px',
                  }}
                >
                  <p style={{ fontWeight: 700, marginBottom: '4px' }}>Recovery request submitted</p>
                  <p style={{ lineHeight: 1.45 }}>
                    If <strong style={{ color: '#0F172A' }}>{forgotEmail}</strong> is registered, a reset link will be sent.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  style={{
                    width: '100%', height: '42px', borderRadius: '10px',
                    background: '#F1F5F9', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 700, color: '#475569',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
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
              >
                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="forgot-email"
                    style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '7px' }}
                  >
                    Work Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{
                      width: '100%', height: '44px', boxSizing: 'border-box',
                      padding: '0 14px', fontSize: '14px', color: '#0F172A',
                      background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                      borderRadius: '10px', outline: 'none', transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
                    onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    style={{
                      flex: 1, height: '42px', borderRadius: '10px',
                      background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#475569',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1, height: '42px', borderRadius: '10px',
                      background: '#2563EB', border: 'none',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.25)', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes nr-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
