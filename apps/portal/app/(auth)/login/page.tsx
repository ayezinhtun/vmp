'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-client';
import { useAuth } from '@/lib/store';

/* ─── Inline SVG helpers ──────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function EyeIcon({ crossed }: { crossed?: boolean }) {
  return crossed ? (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ─── Avatar (hue from name, same algorithm as ui.jsx) ─────────────── */
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const hue = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.36,
      background: `oklch(0.85 0.06 ${hue})`,
      color: `oklch(0.32 0.1 ${hue})`,
      fontWeight: 700, fontSize: size * 0.38,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
}

/* ─── Demo accounts ─────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  { name: 'Aung Kyaw Zin', email: 'aung@example.com', password: 'demo123', company: 'Standard' },
  { name: 'Thin Zar Hlaing', email: 'thin@example.com', password: 'demo123', company: 'Trial' },
];

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router     = useRouter();
  const setSession = useAuth(s => s.setSession);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const doLogin = async (e: string, p: string) => {
    setError(''); setLoading(true);
    try {
      const data = await authApi.login(e, p);
      setSession(data.accessToken, data.customer);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleSubmit = (ev: React.FormEvent) => { ev.preventDefault(); doLogin(email, password); };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>

      {/* ── Brand panel (left) ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, oklch(0.25 0.05 250) 50%, oklch(0.58 0.13 250) 100%)',
        color: 'oklch(0.99 0 0)',
        padding: '56px 72px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-18%', right: '-20%', width: 480, height: 480, borderRadius: '50%', background: 'oklch(1 0 0 / 0.04)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '-25%', left: '-12%', width: 380, height: 380, borderRadius: '50%', background: 'oklch(1 0 0 / 0.03)', pointerEvents: 'none' }}/>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: 'oklch(1 0 0 / 0.14)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17, backdropFilter: 'blur(8px)' }}>V</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>VPS Myanmar</div>
            <div style={{ fontSize: 10.5, opacity: 0.65, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Cloud infrastructure</div>
          </div>
        </div>

        {/* Tagline + features */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Cloud servers,<br/>simplified.
          </h2>
          <p style={{ fontSize: 14.5, opacity: 0.8, lineHeight: 1.65, marginTop: 14 }}>
            High-performance VPS from Yangon — predictable pricing, daily backups, 24/7 local support.
          </p>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {([
              ['Deploy in minutes',    'Instant provisioning from request to running'],
              ['Local infrastructure', 'Yangon DC1 / DC2 · low latency for SE Asia'],
              ['Pay in MMK',           'KBZ, AYA, CB, Yoma Bank accepted'],
            ] as [string, string][]).map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'oklch(1 0 0 / 0.15)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                  <CheckIcon/>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, opacity: 0.55 }}>
          © 2026 VPS Myanmar Co., Ltd · vpsmm.co
        </div>
      </div>

      {/* ── Form panel (right) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        <div style={{ width: 'min(400px, 100%)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, fontWeight: 800, fontSize: 22,
              background: 'var(--accent)', color: '#fff',
              display: 'grid', placeItems: 'center', margin: '0 auto 14px',
            }}>V</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>Welcome back</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>Sign in to your VPS Myanmar account</p>
          </div>

          {/* Card form */}
          <form onSubmit={handleSubmit} className="card">
            <div className="card-body" style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {error && (
                <div style={{
                  padding: '9px 12px', background: 'var(--bad-soft)', color: 'var(--bad)',
                  borderRadius: 6, fontSize: 12.5, display: 'flex', gap: 8, alignItems: 'flex-start',
                  border: '1px solid color-mix(in oklch, var(--bad) 25%, transparent)',
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="field">
                <label>Email address</label>
                <input type="email" autoFocus required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" autoComplete="email"/>
              </div>

              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ marginBottom: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: 11, color: 'var(--accent-strong)', fontWeight: 600, textDecoration: 'none' }}
                    onClick={e => e.preventDefault()}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    style={{ paddingRight: 36, width: '100%', boxSizing: 'border-box' }}/>
                  <button type="button" className="icon-btn" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28 }}>
                    <EyeIcon crossed={showPw}/>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn primary"
                disabled={!email || !password || loading}
                style={{ justifyContent: 'center', padding: '9px 16px', marginTop: 2 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Demo accounts */}
          {DEMO_ACCOUNTS.length > 0 && (
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-body" style={{ padding: '14px 20px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Demo accounts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {DEMO_ACCOUNTS.map(acc => (
                    <button key={acc.email}
                      className="btn ghost sm"
                      style={{ justifyContent: 'flex-start', gap: 8, padding: '6px 10px' }}
                      onClick={() => { setEmail(acc.email); setPassword(acc.password); doLogin(acc.email, acc.password); }}>
                      <Avatar name={acc.name} size={22}/>
                      <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.name.split(' ')[0]}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>{acc.company}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--ink-2)' }}>
            No account?{' '}
            <a href="#" style={{ color: 'var(--accent-strong)', fontWeight: 600, textDecoration: 'none' }}
              onClick={e => e.preventDefault()}>
              Contact your account manager
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
