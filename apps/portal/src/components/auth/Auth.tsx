import React, { createContext, useContext, useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import Icon from '../../lib/icons'
import { Avatar } from '../../lib/ui'

interface User {
  email: string
  password: string
  role: string
  name: string
  avatar: string
  customerId?: string
}

interface AuthContextValue {
  user: User | null
  signout: () => void
}

const MOCK_USERS: User[] = [
  { email: 'admin@1cngvps.com', password: 'admin@1234', role: 'Admin', name: 'Min Khant', avatar: 'Min Khant' },
  { email: 'sale@1cngvps.com', password: 'sale@1234', role: 'Sales', name: 'Su Su', avatar: 'Su Su' },
  { email: 'engineer@1cngvps.com', password: 'engineer@1234', role: 'Engineer', name: 'Ko Thein', avatar: 'Ko Thein' },
  { email: 'finance@1cngvps.com', password: 'finance@1234', role: 'Finance', name: 'Daw Aye', avatar: 'Daw Aye' },
  { email: 'customer@1cngvps.com', password: 'customer@1234', role: 'Customer', name: 'Thiri Ko', avatar: 'Thiri Ko', customerId: 'C-1043' },
]

const REG_KEY = '__vpsmm_users_v1'
const loadRegistered = () => {
  try { return JSON.parse(localStorage.getItem(REG_KEY) || '[]') } catch { return [] }
}
const saveRegistered = (list: User[]) => {
  try { localStorage.setItem(REG_KEY, JSON.stringify(list)) } catch {}
}
const getAllUsers = () => [...MOCK_USERS, ...loadRegistered()]
const registerUser = (u: User) => {
  const list = loadRegistered()
  list.push(u)
  saveRegistered(list)
}

const AuthContext = createContext<AuthContextValue | null>(null)
export const useAuth = () => useContext(AuthContext)

const AUTH_KEY = '__vpsmm_auth_v1'

interface AuthShellProps {
  children: React.ReactNode
  setRole: (role: string) => void
}

export const AuthShell: React.FC<AuthShellProps> = ({ children, setRole }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null') } catch { return null }
  })
  const [mode, setMode] = useState('login')
  const [signupComplete, setSignupComplete] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')

  useEffect(() => {
    if (user) setRole(user.role)
  }, [user, setRole])

  const handleLogin = (u: User) => {
    setUser(u)
    setRole(u.role)
    try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(u)) } catch {}
  }
  const handleSignout = () => {
    setUser(null)
    setMode('login')
    try { sessionStorage.removeItem(AUTH_KEY) } catch {}
  }
  const completeSignup = (email: string) => {
    setSignupEmail(email)
    setSignupComplete(true)
  }

  if (signupComplete) {
    return <SignupSuccess email={signupEmail} onContinue={() => { setSignupComplete(false); setMode('login') }}/>
  }
  if (!user) {
    return mode === 'login'
      ? <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setMode('signup')} prefillEmail={signupEmail}/>
      : <SignupScreen onComplete={completeSignup} onSwitchToLogin={() => setMode('login')}/>
  }
  return (
    <AuthContext.Provider value={{ user, signout: handleSignout }}>
      {children}
    </AuthContext.Provider>
  )
}

interface LoginScreenProps {
  onLogin: (user: User) => void
  onSwitchToSignup: () => void
  prefillEmail: string
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToSignup, prefillEmail }) => {
  const { toast } = useStore()
  const [f, setF] = useState({ email: prefillEmail || '', password: '', remember: true })
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e?.preventDefault()
    setErr('')
    setLoading(true)
    setTimeout(() => {
      const all = getAllUsers()
      const user = all.find(u => u.email.toLowerCase() === f.email.toLowerCase().trim() && u.password === f.password)
      if (user) {
        toast(`Welcome back, ${user.name}`, 'ok')
        onLogin(user)
      } else {
        setErr('Invalid email or password. Try one of the demo accounts below.')
        setLoading(false)
      }
    }, 400)
  }

  const quickLogin = (u: User) => {
    setF({ ...f, email: u.email, password: u.password })
    setTimeout(() => {
      toast(`Logged in as ${u.role}`, 'ok')
      onLogin(u)
    }, 100)
  }

  return (
    <AuthLayout>
      <div style={{ width: 'min(420px, 100%)' }}>
        <div className="text-center mb-4">
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: 22, margin: '0 auto 16px', borderRadius: 12 }}>V</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p className="text-sm text-mute mt-2">Sign in to your VPS Myanmar account</p>
        </div>

        <form onSubmit={submit} className="card">
          <div className="card-body" style={{ padding: 24 }}>
            <div className="flex col gap-3">
              {err && (
                <div style={{ padding: '10px 12px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 6, fontSize: 12.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="alert" size={14} style={{ marginTop: 1, flexShrink: 0 }}/>
                  <div>{err}</div>
                </div>
              )}
              <div className="field">
                <label>Email</label>
                <input type="email" autoFocus required value={f.email} onChange={e => setF({...f, email: e.target.value})} placeholder="you@company.com"/>
              </div>
              <div className="field">
                <div className="flex center between">
                  <label style={{ marginBottom: 0 }}>Password</label>
                  <a onClick={() => toast('Password reset link sent', 'info')} style={{ fontSize: 11, color: 'var(--accent-strong)', cursor: 'pointer', fontWeight: 600 }}>Forgot?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} required value={f.password} onChange={e => setF({...f, password: e.target.value})} style={{ paddingRight: 36, width: '100%' }} placeholder="••••••••"/>
                  <button type="button" className="icon-btn" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28 }}>
                    <Icon name="eye" size={13}/>
                  </button>
                </div>
              </div>
              <label className="flex center gap-2 text-sm" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={f.remember} onChange={e => setF({...f, remember: e.target.checked})}/>
                Remember me for 30 days
              </label>
              <button type="submit" className="btn primary" disabled={!f.email || !f.password || loading} style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 13 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center text-sm text-mute mt-3">
          New to VPS Myanmar? <a onClick={onSwitchToSignup} style={{ color: 'var(--accent-strong)', cursor: 'pointer', fontWeight: 600 }}>Create an account</a>
        </div>

        <div className="card mt-4" style={{ background: 'var(--surface-2)' }}>
          <div className="card-body" style={{ padding: 14 }}>
            <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Demo accounts — click to sign in instantly</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {MOCK_USERS.map(u => (
                <button key={u.email} type="button" onClick={() => quickLogin(u)}
                  style={{
                    padding: '8px 10px', textAlign: 'left',
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 6, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit', color: 'var(--ink)',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}>
                  <Avatar name={u.name} size={22}/>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="fw-6 text-xs">{u.role}</div>
                    <div className="text-xs text-mute mono" style={{ fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

interface SignupScreenProps {
  onComplete: (email: string) => void
  onSwitchToLogin: () => void
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onComplete, onSwitchToLogin }) => {
  const { toast } = useStore()
  const [f, setF] = useState({ name: '', email: '', company: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e?.preventDefault()
    setErr('')
    if (f.password !== f.confirmPassword) {
      setErr('Passwords do not match')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const newUser: User = {
        email: f.email,
        password: f.password,
        role: 'Customer',
        name: f.name,
        avatar: f.name,
      }
      registerUser(newUser)
      toast('Account created successfully', 'ok')
      onComplete(f.email)
    }, 500)
  }

  return (
    <AuthLayout>
      <div style={{ width: 'min(420px, 100%)' }}>
        <div className="text-center mb-4">
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: 22, margin: '0 auto 16px', borderRadius: 12 }}>V</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Create account</h1>
          <p className="text-sm text-mute mt-2">Join VPS Myanmar</p>
        </div>

        <form onSubmit={submit} className="card">
          <div className="card-body" style={{ padding: 24 }}>
            <div className="flex col gap-3">
              {err && (
                <div style={{ padding: '10px 12px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 6, fontSize: 12.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="alert" size={14} style={{ marginTop: 1, flexShrink: 0 }}/>
                  <div>{err}</div>
                </div>
              )}
              <div className="field">
                <label>Full name</label>
                <input type="text" required value={f.name} onChange={e => setF({...f, name: e.target.value})} placeholder="Thiri Ko"/>
              </div>
              <div className="field">
                <label>Company</label>
                <input type="text" required value={f.company} onChange={e => setF({...f, company: e.target.value})} placeholder="Yangon Fintech Group"/>
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" required value={f.email} onChange={e => setF({...f, email: e.target.value})} placeholder="you@company.com"/>
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" required value={f.password} onChange={e => setF({...f, password: e.target.value})} placeholder="••••••••"/>
              </div>
              <div className="field">
                <label>Confirm password</label>
                <input type="password" required value={f.confirmPassword} onChange={e => setF({...f, confirmPassword: e.target.value})} placeholder="••••••••"/>
              </div>
              <button type="submit" className="btn primary" disabled={!f.name || !f.email || !f.password || loading} style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 13 }}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center text-sm text-mute mt-3">
          Already have an account? <a onClick={onSwitchToLogin} style={{ color: 'var(--accent-strong)', cursor: 'pointer', fontWeight: 600 }}>Sign in</a>
        </div>
      </div>
    </AuthLayout>
  )
}

interface SignupSuccessProps {
  email: string
  onContinue: () => void
}

const SignupSuccess: React.FC<SignupSuccessProps> = ({ email, onContinue }) => (
  <AuthLayout>
    <div style={{ width: 'min(420px, 100%)', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ok-soft)', color: 'var(--ok)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
        <Icon name="check" size={32}/>
      </div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Account created!</h1>
      <p className="text-mute mt-2">We've sent a confirmation email to <strong>{email}</strong></p>
      <button className="btn primary mt-4" onClick={onContinue} style={{ justifyContent: 'center' }}>Continue to sign in</button>
    </div>
  </AuthLayout>
)

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>
    <div style={{
      background: 'linear-gradient(135deg, var(--ink) 0%, oklch(0.25 0.05 250) 50%, var(--accent) 100%)',
      color: 'oklch(0.99 0 0)',
      padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: 500, height: 500, borderRadius: '50%', background: 'oklch(1 0 0 / 0.04)' }}/>
      <div style={{ position: 'absolute', bottom: '-30%', left: '-15%', width: 400, height: 400, borderRadius: '50%', background: 'oklch(1 0 0 / 0.03)' }}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'oklch(1 0 0 / 0.15)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, backdropFilter: 'blur(8px)' }}>V</div>
          <div>
            <div className="fw-7" style={{ fontSize: 15 }}>VPS Myanmar</div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cloud infrastructure</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
          Cloud servers, simplified.
        </h2>
        <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.6, marginTop: 16 }}>
          High-performance VPS hosting from Yangon, with predictable pricing, daily backups, and 24/7 local support.
        </p>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Deploy in minutes', 'Instant provisioning from request to running'],
            ['Local infrastructure', 'Yangon DC1/DC2 · low latency for SE Asia'],
            ['Pay in MMK', 'KBZ, AYA, CB, Yoma Bank accepted'],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3" style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'oklch(1 0 0 / 0.15)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                <Icon name="check" size={12}/>
              </div>
              <div>
                <div className="fw-6 text-sm">{t}</div>
                <div className="text-xs" style={{ opacity: 0.7 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, fontSize: 11, opacity: 0.6 }}>
        © 2026 VPS Myanmar Co., Ltd · vpsmm.co
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
      {children}
    </div>
  </div>
)

export { MOCK_USERS, registerUser, getAllUsers, AuthLayout }
