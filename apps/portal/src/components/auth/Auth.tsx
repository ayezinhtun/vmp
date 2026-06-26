import React, { createContext, useContext, useState, useEffect } from 'react'
import useCustomerStore from '../../store/customerStore'
import useUIStore from '../../store/uiStore'
import Icon from '../../lib/icons'
import { Avatar } from '../ui/ui'

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
  const initialRoleSetRef = React.useRef(false)

  useEffect(() => {
    if (user && !initialRoleSetRef.current) {
      setRole(user.role)
      initialRoleSetRef.current = true
    }
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
  const { toast } = useUIStore()
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

interface IaaSCardProps {
  selected: boolean
  onClick: () => void
  padding?: number
  children: React.ReactNode
}

const IaaSCard: React.FC<IaaSCardProps> = ({ selected, onClick, padding = 14, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: `${padding}px`,
      textAlign: 'left',
      background: selected ? 'var(--accent-soft)' : 'var(--surface)',
      border: '1.5px solid',
      borderColor: selected ? 'var(--accent)' : 'var(--line)',
      borderRadius: 10,
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: 'var(--ink)',
      boxShadow: selected ? '0 0 0 3px var(--accent-soft)' : 'none',
      transition: 'all 0.15s',
    }}
  >
    {children}
  </button>
)

// ── Step 1 — Account ────────────────────────────────────────────────────
const SignupStepAccount: React.FC<{ f: any; set: (k: string, v: any) => void }> = ({ f, set }) => (
  <div className="flex col gap-3">
    <div className="field"><label>Full name</label><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="As it appears on your ID" autoFocus/></div>
    <div className="field"><label>Email</label><input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com"/></div>
    <div className="grid-2" style={{ gap: 10 }}>
      <div className="field"><label>Password</label><input type="password" value={f.password} onChange={e => set('password', e.target.value)} placeholder="At least 8 characters"/></div>
      <div className="field"><label>Confirm password</label><input type="password" value={f.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}/></div>
    </div>
    <div className="field">
      <label>Account type</label>
      <div className="grid-2" style={{ gap: 10 }}>
        {[
          { id: 'Individual', title: 'Individual', desc: 'Personal use · single contact · simple KYC', icon: 'users', accent: 'oklch(0.6 0.13 250)' },
          { id: 'Organization', title: 'Organization', desc: 'Company · multiple contacts · full KYC + docs', icon: 'building', accent: 'oklch(0.55 0.18 285)' },
        ].map(o => (
          <IaaSCard key={o.id} selected={f.type === o.id} onClick={() => set('type', o.id)} padding={14}>
            <div className="flex center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${o.accent}1a`, color: o.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={o.icon} size={15}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fw-7 text-sm">{o.title}</div>
                <div className="text-xs text-mute mt-1" style={{ lineHeight: 1.4 }}>{o.desc}</div>
              </div>
              {f.type === o.id && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)', flexShrink: 0 }}/>}
            </div>
          </IaaSCard>
        ))}
      </div>
    </div>
  </div>
)

// ── Step 2 (Individual) ─────────────────────────────────────────────────
const SignupStepIndividual: React.FC<{ f: any; set: (k: string, v: any) => void }> = ({ f, set }) => (
  <div className="flex col gap-3">
    <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Personal information</div>
    <div className="grid-2" style={{ gap: 10 }}>
      <div className="field"><label>Phone number</label><input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+95 9 ..." style={{ fontFamily: 'var(--mono)' }} autoFocus/></div>
      <div className="field"><label>Alternate phone (optional)</label><input value={f.altPhone} onChange={e => set('altPhone', e.target.value)} placeholder="+95 9 ..." style={{ fontFamily: 'var(--mono)' }}/></div>
    </div>
    <div className="field">
      <label>Preferred contact method</label>
      <div className="flex gap-2">
        {['Email', 'Phone call', 'WhatsApp', 'Viber'].map(m => (
          <button key={m} type="button" className="filter-chip" onClick={() => {}} style={{ borderColor: 'var(--line)' }}>{m}</button>
        ))}
      </div>
      <div className="hint">We'll use this for renewal and provisioning notifications.</div>
    </div>
  </div>
)

// ── Step 2 (Organization) ───────────────────────────────────────────────
const SignupStepOrganization: React.FC<{ f: any; set: (k: string, v: any) => void }> = ({ f, set }) => (
  <div className="flex col gap-3">
    <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Organization details</div>
    <div className="field"><label>Organization name</label><input value={f.orgName} onChange={e => set('orgName', e.target.value)} placeholder="Mandalay Logistics Co., Ltd" autoFocus/></div>
    <div className="grid-2" style={{ gap: 10 }}>
      <div className="field"><label>Registration number</label><input value={f.orgRegNo} onChange={e => set('orgRegNo', e.target.value)} placeholder="e.g. 12345678" style={{ fontFamily: 'var(--mono)' }}/></div>
      <div className="field"><label>Organization type</label>
        <select value={f.orgType} onChange={e => set('orgType', e.target.value)}>
          <option>Private Limited</option><option>Public Limited</option><option>Partnership</option><option>Sole Proprietorship</option><option>NGO / Non-profit</option><option>Government</option>
        </select>
      </div>
    </div>
    <div className="grid-2" style={{ gap: 10 }}>
      <div className="field"><label>Industry</label>
        <select value={f.orgIndustry} onChange={e => set('orgIndustry', e.target.value)}>
          <option>Technology</option><option>Finance</option><option>Retail / E-commerce</option><option>Manufacturing</option><option>Logistics</option><option>Healthcare</option><option>Education</option><option>Hospitality</option><option>Media</option><option>Other</option>
        </select>
      </div>
      <div className="field"><label>Employees</label>
        <select value={f.orgEmployees} onChange={e => set('orgEmployees', e.target.value)}>
          <option>1-10</option><option>11-50</option><option>51-200</option><option>201-1000</option><option>1000+</option>
        </select>
      </div>
    </div>
    <div className="grid-2" style={{ gap: 10 }}>
      <div className="field"><label>Your title</label><input value={f.orgRepTitle} onChange={e => set('orgRepTitle', e.target.value)} placeholder="e.g. CTO, IT Manager"/></div>
      <div className="field"><label>Website (optional)</label><input value={f.orgWebsite} onChange={e => set('orgWebsite', e.target.value)} placeholder="example.com"/></div>
    </div>
    <div className="grid-2" style={{ gap: 10 }}>
      <div className="field"><label>Phone</label><input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+95 9 ..." style={{ fontFamily: 'var(--mono)' }}/></div>
      <div className="field"><label>Alternate phone</label><input value={f.altPhone} onChange={e => set('altPhone', e.target.value)} placeholder="+95 9 ..." style={{ fontFamily: 'var(--mono)' }}/></div>
    </div>
  </div>
)

// ── Step 3 (Address) ────────────────────────────────────────────────────
const SignupStepAddress: React.FC<{ f: any; set: (k: string, v: any) => void }> = ({ f, set }) => (
  <div className="flex col gap-3">
    <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Address</div>
    <div className="field"><label>Street address</label><input value={f.address} onChange={e => set('address', e.target.value)} placeholder="Building, street, township" autoFocus/></div>
    <div className="grid-3" style={{ gap: 10 }}>
      <div className="field"><label>City</label><input value={f.city} onChange={e => set('city', e.target.value)}/></div>
      <div className="field"><label>State / Region</label>
        <select value={f.state} onChange={e => set('state', e.target.value)}>
          <option>Yangon Region</option><option>Mandalay Region</option><option>Naypyidaw</option><option>Sagaing Region</option><option>Bago Region</option><option>Magway Region</option><option>Tanintharyi Region</option><option>Ayeyarwady Region</option><option>Shan State</option><option>Kachin State</option><option>Kayah State</option><option>Kayin State</option><option>Mon State</option><option>Rakhine State</option><option>Chin State</option>
        </select>
      </div>
      <div className="field"><label>Postal code</label><input value={f.postalCode} onChange={e => set('postalCode', e.target.value)} style={{ fontFamily: 'var(--mono)' }}/></div>
    </div>
    <div className="field">
      <label>Country</label>
      <input value={f.country} onChange={e => set('country', e.target.value)} disabled style={{ background: 'var(--surface-3)' }}/>
      <div className="hint">VPS Myanmar currently serves customers within Myanmar.</div>
    </div>
  </div>
)

// ── Step 4 (KYC) ────────────────────────────────────────────────────────
const SignupStepKYC: React.FC<{ f: any; set: (k: string, v: any) => void }> = ({ f, set }) => {
  const uploadField = (key: string, label: string, hint: string) => (
    <button type="button" onClick={() => set(key, !f[key])}
      style={{
        padding: '14px 16px',
        border: `1.5px dashed ${f[key] ? 'var(--ok)' : 'var(--line-strong)'}`,
        background: f[key] ? 'var(--ok-soft)' : 'var(--surface-2)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', width: '100%',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, background: f[key] ? 'var(--ok)' : 'var(--surface-3)', color: f[key] ? 'white' : 'var(--ink-3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={f[key] ? 'check' : 'attach'} size={14}/>
      </div>
      <div style={{ flex: 1 }}>
        <div className="fw-6 text-sm" style={{ color: f[key] ? 'var(--ok)' : 'var(--ink)' }}>{f[key] ? 'Uploaded ✓' : label}</div>
        <div className="text-xs text-mute">{hint}</div>
      </div>
      {f[key] && <span className="text-xs text-mute" style={{ cursor: 'pointer' }}>Replace</span>}
    </button>
  )

  return (
    <div className="flex col gap-3">
      <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Know your customer (KYC)</div>
      <div style={{ padding: 12, background: 'var(--info-soft)', borderRadius: 6, fontSize: 12, color: 'var(--info)', display: 'flex', gap: 8 }}>
        <Icon name="lock" size={14} style={{ marginTop: 1, flexShrink: 0 }}/>
        <div>Documents are encrypted, used solely for verification, and reviewed within 1 business day. We meet Myanmar AML / KYC requirements.</div>
      </div>

      <div className="field">
        <label>{f.type === 'Individual' ? 'NRC / National ID number' : 'Representative\'s NRC / ID number'}</label>
        <input value={f.nrcOrId} onChange={e => set('nrcOrId', e.target.value)} placeholder="e.g. 12/XXXXX(N)123456" style={{ fontFamily: 'var(--mono)' }} autoFocus/>
      </div>

      <div className="text-xs text-mute fw-6 mt-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Identity documents</div>
      <div className="grid-2" style={{ gap: 10 }}>
        {uploadField('nrcFrontUploaded', 'Upload NRC front', 'JPG or PDF · max 5 MB')}
        {uploadField('nrcBackUploaded', 'Upload NRC back', 'JPG or PDF · max 5 MB')}
      </div>

      {f.type === 'Organization' && (
        <>
          <div className="text-xs text-mute fw-6 mt-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Organization documents</div>
          <div className="grid-2" style={{ gap: 10 }}>
            {uploadField('orgCertUploaded', 'Company registration certificate', 'Form 26 / DICA / MyCO printout')}
            {uploadField('orgTaxIdUploaded', 'Tax registration document', 'IRD letter or TIN certificate')}
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            {uploadField('dirIdUploaded', 'Director\'s ID (optional)', 'Required for amounts > MMK 5M/mo')}
            <div/>
          </div>
        </>
      )}
    </div>
  )
}

// ── Step 5 (Payment) ────────────────────────────────────────────────────
const SignupStepPayment: React.FC<{ f: any; set: (k: string, v: any) => void }> = ({ f, set }) => (
  <div className="flex col gap-3">
    <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Preferred payment method</div>
    <div className="text-xs text-mute" style={{ marginTop: -4 }}>You won't be charged now — you'll select & pay when you deploy your first VM.</div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {[
        { id: 'KBZ Pay', logo: 'K', accent: 'oklch(0.55 0.18 30)', desc: 'Mobile wallet · QR scan' },
        { id: 'AYA Bank', logo: 'A', accent: 'oklch(0.55 0.16 230)', desc: 'Direct bank transfer' },
        { id: 'CB Bank', logo: 'C', accent: 'oklch(0.55 0.17 285)', desc: 'Direct bank transfer' },
        { id: 'Yoma Bank', logo: 'Y', accent: 'oklch(0.55 0.15 155)', desc: 'Direct bank transfer' },
      ].map(p => (
        <IaaSCard key={p.id} selected={f.paymentMethod === p.id} onClick={() => set('paymentMethod', p.id)} padding={14}>
          <div className="flex center gap-2">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${p.accent}1a`, color: p.accent, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15 }}>{p.logo}</div>
            <div style={{ flex: 1 }}>
              <div className="fw-7 text-sm">{p.id}</div>
              <div className="text-xs text-mute">{p.desc}</div>
            </div>
            {f.paymentMethod === p.id && <Icon name="check" size={14} style={{ color: 'var(--accent-strong)' }}/>}
          </div>
        </IaaSCard>
      ))}
    </div>

    <div className="grid-2 mt-2" style={{ gap: 10 }}>
      <div className="field"><label>Payer name (on account)</label><input value={f.payerName} onChange={e => set('payerName', e.target.value)} placeholder={f.name || 'Account holder'}/></div>
      <div className="field"><label>Payer phone</label><input value={f.payerPhone} onChange={e => set('payerPhone', e.target.value)} placeholder={f.phone || '+95 9 ...'} style={{ fontFamily: 'var(--mono)' }}/></div>
    </div>

    <div className="divider"/>
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
      <input type="checkbox" checked={f.agreedToTerms} onChange={e => set('agreedToTerms', e.target.checked)} style={{ marginTop: 3 }}/>
      <div className="text-sm">
        I agree to the <a style={{ color: 'var(--accent-strong)', fontWeight: 600 }}>Terms of Service</a> and <a style={{ color: 'var(--accent-strong)', fontWeight: 600 }}>Privacy Policy</a>, and confirm the information provided is accurate.
      </div>
    </label>
  </div>
)

interface SignupScreenProps {
  onComplete: (email: string) => void
  onSwitchToLogin: () => void
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onComplete, onSwitchToLogin }) => {
  const { addCustomer } = useCustomerStore()
  const [step, setStep] = useState(1)
  const [f, setF] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    type: 'Individual',
    phone: '', altPhone: '',
    address: '', city: 'Yangon', state: 'Yangon Region', postalCode: '11181', country: 'Myanmar',
    orgName: '', orgRegNo: '', orgType: 'Private Limited', orgIndustry: 'Technology',
    orgRepTitle: '', orgEmployees: '1-10', orgWebsite: '',
    nrcOrId: '', nrcFrontUploaded: false, nrcBackUploaded: false,
    orgCertUploaded: false, orgTaxIdUploaded: false, dirIdUploaded: false,
    paymentMethod: 'KBZ Pay', payerName: '', payerPhone: '',
    agreedToTerms: false,
  })
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => { setF(x => ({ ...x, [k]: v })); setErr('') }

  const totalSteps = 5
  const stepLabels = ['Account', f.type === 'Individual' ? 'Personal info' : 'Organization', 'Address', 'KYC', 'Payment']

  const validateStep1 = () => {
    if (!f.name.trim()) return 'Enter your name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Enter a valid email'
    if (f.password.length < 8) return 'Password must be at least 8 characters'
    if (f.password !== f.confirmPassword) return 'Passwords do not match'
    return null
  }
  const validateStep2 = () => {
    if (!f.phone.trim()) return 'Enter your phone number'
    if (f.type === 'Organization') {
      if (!f.orgName.trim()) return 'Enter organization name'
      if (!f.orgRegNo.trim()) return 'Enter organization registration number'
    }
    return null
  }
  const validateStep3 = () => f.address.trim() ? null : 'Enter your address'
  const validateStep4 = () => {
    if (!f.nrcOrId.trim()) return f.type === 'Individual' ? 'Enter your NRC / ID number' : 'Enter representative\'s NRC / ID'
    if (!f.nrcFrontUploaded || !f.nrcBackUploaded) return 'Upload both sides of your ID'
    if (f.type === 'Organization') {
      if (!f.orgCertUploaded) return 'Upload company registration certificate'
      if (!f.orgTaxIdUploaded) return 'Upload tax registration document'
    }
    return null
  }
  const validators: Array<(() => string | null) | null> = [null, validateStep1, validateStep2, validateStep3, validateStep4, () => f.agreedToTerms ? null : 'You must accept the terms to continue']

  const next = () => {
    const v = validators[step]?.()
    if (v) { setErr(v); return }
    if (step < totalSteps) setStep(step + 1)
    else submit()
  }

  const submit = () => {
    const customerId = addCustomer({
      name: f.name,
      company: f.type === 'Organization' ? f.orgName : `${f.name} (Individual)`,
      email: f.email,
      phone: f.phone,
      kyc: 'Pending',
      salesperson: 'Su Su',
      notes: `${f.type} signup via portal. Address: ${f.address}, ${f.city}.${f.type === 'Organization' ? ` Org reg: ${f.orgRegNo}, ${f.orgType}.` : ''}`,
    })
    registerUser({
      email: f.email,
      password: f.password,
      role: 'Customer',
      name: f.name,
      avatar: f.name,
      customerId,
    })
    onComplete(f.email)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--line)', background: 'var(--surface)',
        padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div className="flex center gap-3">
          <div className="brand-mark" style={{ width: 32, height: 32, fontSize: 14, borderRadius: 7 }}>V</div>
          <div>
            <div className="fw-7 text-sm">VPS Myanmar</div>
            <div className="text-xs text-mute" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cloud infrastructure</div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div className="text-sm text-mute">Already have an account?</div>
        <button className="btn" onClick={onSwitchToLogin}><Icon name="logout" size={12}/>Sign in</button>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 360px', gap: 0, overflow: 'hidden' }}>
        {/* Left: stepper with gradient hero */}
        <div style={{ borderRight: '1px solid var(--line)', background: 'linear-gradient(180deg, var(--surface-2), var(--surface))', padding: '32px 24px', overflowY: 'auto', position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 285))',
            borderRadius: 14, padding: '20px 18px', color: 'white', marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Icon name="server" size={20}/>
              <h1 style={{ margin: '10px 0 0', fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>Create your account</h1>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, opacity: 0.9, lineHeight: 1.5 }}>5 quick steps to start deploying cloud VMs in Myanmar.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stepLabels.map((label, i) => {
              const n = i + 1
              const done = n < step
              const active = n === step
              return (
                <div key={label} style={{ position: 'relative' }}>
                  <div
                    onClick={() => n < step && setStep(n)}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      padding: '10px 12px', borderRadius: 8,
                      background: active ? 'var(--surface)' : 'transparent',
                      border: active ? '1px solid var(--accent)' : '1px solid transparent',
                      cursor: n < step ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: done ? 'var(--accent)' : active ? 'var(--accent-soft)' : 'var(--surface-3)',
                      color: done ? 'var(--accent-fg)' : active ? 'var(--accent-strong)' : 'var(--ink-3)',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 700, fontSize: 12, flexShrink: 0,
                      transition: 'all 0.25s',
                    }}>{done ? <Icon name="check" size={13}/> : n}</div>
                    <div>
                      <div className="fw-6 text-sm" style={{ color: active ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)' }}>{label}</div>
                      <div className="text-xs text-mute">{done ? 'Completed' : active ? 'In progress' : 'Pending'}</div>
                    </div>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div style={{ position: 'absolute', left: 26, top: 48, width: 1, height: 16, background: n < step ? 'var(--accent)' : 'var(--line)' }}/>
                  )}
                </div>
              )
            })}
          </div>

          <div className="divider"/>
          <div className="text-xs text-mute" style={{ lineHeight: 1.6 }}>
            <div className="fw-6 mb-1" style={{ color: 'var(--ink-2)' }}>Need help?</div>
            Contact us at <span className="mono">support@vpsmm.co</span> or visit our docs.
          </div>
        </div>

        {/* Middle: form */}
        <div style={{ overflowY: 'auto', padding: '40px 56px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="flex center between mb-3">
              <div>
                <div className="text-xs text-mute fw-6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Step {step} of {totalSteps}</div>
                <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{stepLabels[step-1]}</h2>
              </div>
              <div className="text-xs text-mute tnum">{Math.round((step / totalSteps) * 100)}% complete</div>
            </div>
            <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ width: `${(step / totalSteps) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s' }}/>
            </div>

            {err && (
              <div style={{ padding: '12px 14px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 12.5, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="alert" size={14} style={{ marginTop: 1, flexShrink: 0 }}/>
                <div>{err}</div>
              </div>
            )}

            <div className="card" style={{ animation: 'fadeIn 0.25s ease-out' }}>
              <div className="card-body" style={{ padding: 28 }}>
                {step === 1 && <SignupStepAccount f={f} set={set}/>}
                {step === 2 && (f.type === 'Individual' ? <SignupStepIndividual f={f} set={set}/> : <SignupStepOrganization f={f} set={set}/>)}
                {step === 3 && <SignupStepAddress f={f} set={set}/>}
                {step === 4 && <SignupStepKYC f={f} set={set}/>}
                {step === 5 && <SignupStepPayment f={f} set={set}/>}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {step > 1 && <button className="btn" onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={11}/>Back</button>}
              <div style={{ flex: 1 }}/>
              <button className="btn ghost" onClick={onSwitchToLogin}>Cancel</button>
              <button className="btn primary" onClick={next} style={{ padding: '9px 18px', fontSize: 13 }}>
                {step < totalSteps ? <>Continue<Icon name="chevron-right" size={11}/></> : <><Icon name="check" size={12}/>Create account</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: summary panel (IaaS-style cart) */}
        <div style={{ borderLeft: '1px solid var(--line)', background: 'var(--surface)', padding: '32px 24px', overflowY: 'auto' }}>
          <div className="text-xs text-mute fw-6 mb-3" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Account summary</div>
          <div className="flex col gap-2 text-sm">
            <div className="flex between"><span className="text-mute">Type</span><span className="fw-6">{f.type}</span></div>
            <div className="flex between"><span className="text-mute">Name</span><span className="fw-6" style={{ textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name || <span className="text-mute">—</span>}</span></div>
            <div className="flex between"><span className="text-mute">Email</span><span className="fw-6 mono" style={{ textAlign: 'right', fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email || <span className="text-mute">—</span>}</span></div>
            {f.type === 'Organization' && f.orgName && (
              <div className="flex between"><span className="text-mute">Company</span><span className="fw-6" style={{ textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.orgName}</span></div>
            )}
            {f.phone && <div className="flex between"><span className="text-mute">Phone</span><span className="fw-6 mono">{f.phone}</span></div>}
            {f.city && <div className="flex between"><span className="text-mute">City</span><span className="fw-6">{f.city}</span></div>}
            {f.nrcOrId && <div className="flex between"><span className="text-mute">ID #</span><span className="fw-6 mono" style={{ fontSize: 11 }}>{f.nrcOrId}</span></div>}
            {f.paymentMethod && step === 5 && <div className="flex between"><span className="text-mute">Payment</span><span className="fw-6">{f.paymentMethod}</span></div>}
          </div>

          <div className="divider"/>
          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>What you'll get</div>
          <div className="flex col gap-2 text-xs">
            {[
              ['shield', 'KYC-verified account'],
              ['server', 'Deploy VMs in 24h'],
              ['invoice', 'Pay in MMK (KBZ/AYA/CB/Yoma)'],
              ['mail', 'Local support 9am-6pm'],
            ].map(([icon, text]) => (
              <div key={text} className="flex center gap-2">
                <Icon name={icon} size={12} style={{ color: 'var(--accent-strong)' }}/>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="divider"/>
          <div style={{ padding: 12, background: 'var(--ok-soft)', borderRadius: 8, fontSize: 11.5, color: 'var(--ok)', display: 'flex', gap: 8 }}>
            <Icon name="lock" size={12} style={{ marginTop: 2, flexShrink: 0 }}/>
            <div>Your data is encrypted and used solely for account verification.</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

interface SignupSuccessProps {
  email: string
  onContinue: () => void
}

const SignupSuccess: React.FC<SignupSuccessProps> = ({ email, onContinue }) => (
  <AuthLayout>
    <div style={{ width: 'min(480px, 100%)', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--ok-soft)', color: 'var(--ok)',
        margin: '0 auto 24px',
        display: 'grid', placeItems: 'center',
        animation: 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <Icon name="check" size={36} stroke={2.5}/>
      </div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Account created!</h1>
      <p className="text-sm text-mute mt-3" style={{ lineHeight: 1.6 }}>
        Your credentials are saved. KYC documents are under review. We'll email <strong>{email}</strong> within <strong>1 business day</strong> once verified — then you can deploy your first VM.
      </p>
      {email && (
        <div className="card mt-3" style={{ background: 'var(--info-soft)', borderColor: 'transparent' }}>
          <div className="card-body" style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
            <Icon name="key" size={14} style={{ marginTop: 2, color: 'var(--info)' }}/>
            <div style={{ flex: 1, fontSize: 12.5, color: 'var(--info)' }}>
              You can sign in immediately with <span className="mono fw-7">{email}</span> and the password you just chose. Your account stays in "Under review" until KYC is verified.
            </div>
          </div>
        </div>
      )}
      <div className="card mt-4" style={{ background: 'var(--surface-2)' }}>
        <div className="card-body" style={{ padding: 18 }}>
          <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>What's next</div>
          <div className="flex col gap-3 text-left">
            {[
              ['1', 'Sign in to your account', 'Use the email + password you just registered'],
              ['2', 'KYC verification', 'Our team reviews your documents within 1 business day'],
              ['3', 'Deploy your first VM', 'Once approved, request a trial or paid VM'],
            ].map(([n, t, d]) => (
              <div key={n} className="flex gap-3" style={{ alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-strong)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{n}</div>
                <div>
                  <div className="fw-6 text-sm">{t}</div>
                  <div className="text-xs text-mute mt-1">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="btn primary mt-4" onClick={onContinue} style={{ padding: '10px 22px', fontSize: 13 }}>
        Continue to sign in
        <Icon name="chevron-right" size={12}/>
      </button>
      <style>{`@keyframes pop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
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
