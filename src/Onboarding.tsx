import { useState } from "react"
import { requireSupabase } from "./lib/supabase"
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  FileText,
  Flower2,
  Gift,
  IndianRupee,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react"

export type RegisteredBusiness = {
  id?: string
  name: string
  type: string
  description: string
  owner: string
  primaryPhone: string
  secondaryPhone: string
  email: string
  address: string
  city: string
  state: string
  pin: string
  country: string
  currency: string
  timezone: string
  dateFormat: string
  quotePrefix: string
  invoicePrefix: string
  taxEnabled: boolean
  taxLabel: string
  taxRate: string
  customItems: boolean
  packageCustomization: boolean
}

/** Convert a saved Supabase business row into the UI's registration model. */
export function registeredBusinessFromRow(row: Record<string, unknown>): RegisteredBusiness {
  const str = (key: string, fallback = "") =>
    typeof row[key] === "string" ? (row[key] as string) : fallback
  const bool = (key: string, fallback: boolean) =>
    typeof row[key] === "boolean" ? (row[key] as boolean) : fallback
  return {
    id: str("id"),
    name: str("name", "My Business"),
    type: str("business_type", "Wedding & Event Decoration"),
    description: str("description"),
    owner: str("owner_name"),
    primaryPhone: str("phone"),
    secondaryPhone: "",
    email: str("email"),
    address: str("address"),
    city: str("city"),
    state: str("state", "Madhya Pradesh"),
    pin: str("postal_code", str("pincode")),
    country: str("country", "India"),
    currency: str("currency", "INR (₹)"),
    timezone: str("timezone", "Asia/Kolkata"),
    dateFormat: str("date_format", "DD MMM YYYY"),
    quotePrefix: str("quotation_prefix", "QT"),
    invoicePrefix: str("invoice_prefix", "INV"),
    taxEnabled: bool("tax_enabled", false),
    taxLabel: "GST",
    taxRate: row["tax_rate"] == null ? "" : String(row["tax_rate"]),
    customItems: bool("allow_custom_items", true),
    packageCustomization: true,
  }
}

type AuthScreen = "login" | "signup" | "forgot" | "welcome" | "register" | "success"

const photoUrl =
  "https://images.unsplash.com/photo-1708606811579-23b18fc48007?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBJbmRpYW4lMjB3ZWRkaW5nJTIwbWFuZGFwJTIwZmxvcmFsJTIwZGVjb3JhdGlvbnxlbnwxfHx8fDE3OTI2NDY0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080"

const emptyBusiness: RegisteredBusiness = {
  name: "",
  type: "Wedding & Event Decoration",
  description: "",
  owner: "",
  primaryPhone: "",
  secondaryPhone: "",
  email: "",
  address: "",
  city: "",
  state: "Madhya Pradesh",
  pin: "",
  country: "India",
  currency: "INR (₹)",
  timezone: "Asia/Kolkata",
  dateFormat: "DD MMM YYYY",
  quotePrefix: "QT",
  invoicePrefix: "INV",
  taxEnabled: false,
  taxLabel: "GST",
  taxRate: "",
  customItems: true,
  packageCustomization: true,
}

function AuthBrand({ floral = false }: { floral?: boolean }) {
  return (
    <div className="auth-brand">
      <div className="auth-brand-motif"><span />{floral ? <Flower2 size={18} /> : <Sparkles size={16} />}<span /></div>
      <strong>Utsavkosh</strong>
      <small>Celebrations, beautifully managed.</small>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <label className={`auth-field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <div><LockKeyhole size={16} /><input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      {error && <em>{error}</em>}
    </label>
  )
}

function SignupPasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  valid = false,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
  valid?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <label
      className={`auth-field signup-password-field ${value ? "filled" : ""} ${
        error ? "has-error" : ""
      } ${valid ? "is-valid" : ""}`}
    >
      <span>{label}</span>
      <div>
        <LockKeyhole size={16} />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <em>{error}</em>}
    </label>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img src={photoUrl} alt="An elegant Indian wedding stage with floral decoration" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-copy"><span>DESIGNED FOR DECORATORS</span><h2>Bring every celebration together, beautifully.</h2><p>Manage enquiries, events, décor catalogues, documents, and payments from one considered workspace.</p></div>
        <small className="photo-credit">Photo by Sloshout on Unsplash</small>
      </section>
      <section className="auth-form-side"><AuthBrand />{children}</section>
    </main>
  )
}

function LoginOrnament({ side }: { side: "left" | "right" }) {
  return (
    <div className={`login-ornament ${side}`} aria-hidden="true">
      <svg viewBox="0 0 430 1024" preserveAspectRatio="none">
        <defs>
          <pattern id={`wine-dots-${side}`} width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="2.1" cy="2.1" r="2.1" fill="#651B38" />
          </pattern>
          <pattern id={`gold-dots-${side}`} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.8" fill="#C5A15B" />
          </pattern>
          <pattern id={`fine-dots-${side}`} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.45" fill="#7A2947" />
          </pattern>
        </defs>
        <path d="M0 0H292C325 88 298 154 230 188C168 219 145 277 175 334C207 395 186 444 111 483C55 512 26 572 0 642Z" fill={`url(#wine-dots-${side})`} opacity=".94" />
        <path d="M0 118C84 83 171 92 213 148C251 199 229 255 172 290C111 328 80 385 103 440C125 492 88 529 0 553Z" fill={`url(#gold-dots-${side})`} opacity=".74" />
        <path d="M0 188C70 168 134 196 142 251C148 294 114 322 82 345C47 369 29 409 44 447C58 482 42 510 0 526Z" fill={`url(#fine-dots-${side})`} />
        <path d="M0 365C58 342 112 353 143 391C175 430 163 478 119 510C71 545 65 596 101 630C145 670 145 727 93 774C61 802 30 820 0 830Z" fill={`url(#wine-dots-${side})`} opacity=".97" />
        <path d="M0 632C78 610 163 641 189 713C211 774 178 825 125 859C70 895 47 948 70 1024H0Z" fill={`url(#gold-dots-${side})`} opacity=".82" />
        <path d="M0 725C72 697 139 729 150 787C159 835 127 864 91 894C52 925 40 971 55 1024H0Z" fill={`url(#fine-dots-${side})`} />
        <g fill="none" stroke={`url(#wine-dots-${side})`} strokeWidth="25" opacity=".9">
          <path d="M40 70C112 29 190 52 207 113C223 170 171 209 119 193C72 178 59 132 93 104C123 79 156 98 155 128" />
          <path d="M24 515C103 474 183 507 193 578C201 641 143 679 91 653C47 631 43 584 78 558C109 535 142 552 145 584" />
        </g>
        <g fill={`url(#gold-dots-${side})`} opacity=".86">
          <circle cx="255" cy="82" r="54" /><circle cx="286" cy="288" r="38" /><circle cx="240" cy="520" r="48" /><circle cx="286" cy="780" r="46" /><circle cx="220" cy="960" r="58" />
        </g>
      </svg>
      <span className="login-dot-fade" />
    </div>
  )
}

function LoginLayout({
  children,
  pageClassName = "",
  cardClassName = "",
}: {
  children: React.ReactNode
  pageClassName?: string
  cardClassName?: string
}) {
  return (
    <main className={`login-page ${pageClassName}`}>
      <LoginOrnament side="left" />
      <LoginOrnament side="right" />
      <section className={`login-card ${cardClassName}`}>
        <AuthBrand floral />
        {children}
      </section>
    </main>
  )
}

function Login({
  onSignup,
  onForgot,
  onNewUser,
}: {
  onSignup: () => void
  onForgot: () => void
  onNewUser: (business?: RegisteredBusiness) => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!email) next.email = "Email address is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address."
    if (!password) next.password = "Password is required."
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    try {
      const client = requireSupabase()
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setErrors({ auth: error.message }); return }
      const { data: userData, error: userError } = await client.auth.getUser()
      if (userError || !userData.user) {
        setErrors({ auth: userError?.message || "Unable to verify your signed-in account." })
        return
      }
      const { data: businessRow, error: businessError } = await client
        .from("businesses")
        .select("*")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (businessError) {
        setErrors({ auth: `Signed in, but couldn't load your business: ${businessError.message}` })
        return
      }
      onNewUser(businessRow ? registeredBusinessFromRow(businessRow as Record<string, unknown>) : undefined)
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : "Unable to sign in." })
    } finally { setLoading(false) }
  }
  return (
    <LoginLayout>
      <div className="auth-form-card login-form-card">
        <div className="auth-heading login-heading"><h1>Welcome Back</h1><p>Sign in to manage your decoration business.</p></div>
        <form onSubmit={submit}>
          <div className="login-socials">
            <button type="button" onClick={async () => { setErrors({}); try { const { error } = await requireSupabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); if (error) setErrors({ google: error.message }) } catch (error) { setErrors({ google: error instanceof Error ? error.message : "Google sign-in could not start." }) } }}><b className="google-mark">G</b> Continue with Google</button>
          </div>
          {errors.google && <p className="auth-inline-message login-social-message">{errors.google}</p>}
          {errors.auth && <p className="auth-inline-message">{errors.auth}</p>}
          <div className="login-divider"><span>OR</span></div>
          <label className={`auth-field ${errors.email ? "has-error" : ""}`}><span>Email Address</span><div><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" /></div>{errors.email && <em>{errors.email}</em>}</label>
          <PasswordField label="Password" value={password} onChange={setPassword} error={errors.password} />
          <div className="auth-form-options"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label><button type="button" onClick={onForgot}>Forgot Password?</button></div>
          <button type="submit" className="auth-primary login-submit" disabled={loading}>{loading ? <><i /> Signing in…</> : <><span>Sign In</span><ArrowRight size={18} /></>}</button>
        </form>
        <p className="auth-switch">Don&apos;t have an account? <button type="button" onClick={onSignup}>Sign Up</button></p>
      </div>
    </LoginLayout>
  )
}

function Signup({ onLogin, onComplete }: { onLogin: () => void; onComplete: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const passwordRequirements = [
    { label: "Uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "Lowercase letter", met: /[a-z]/.test(form.password) },
    { label: "Number", met: /[0-9]/.test(form.password) },
    { label: "Special character (e.g. !?<>@#$%)", met: /[^A-Za-z0-9]/.test(form.password) },
    { label: "8 characters or more", met: form.password.length >= 8 },
  ]
  const passwordValid = passwordRequirements.every((requirement) => requirement.met)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const canSubmit =
    Boolean(form.name.trim()) &&
    emailValid &&
    passwordValid &&
    form.terms
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Full name is required."
    if (!form.email) next.email = "Email address is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address."
    if (!passwordValid) next.password = "Complete all password requirements."
    if (!form.terms) next.terms = "Accept the terms to continue."
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    try {
      const client = requireSupabase()
      const { data, error } = await client.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.name.trim() }, emailRedirectTo: `${window.location.origin}/` } })
      if (error) { setErrors({ auth: error.message }); return }
      if (data.session) onComplete()
      else setErrors({ auth: "Account created. Check your email to verify your address, then return here and sign in." })
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : "Unable to create your account." })
    } finally { setLoading(false) }
  }
  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: "" }))
    }
  }
  return (
    <LoginLayout pageClassName="signup-login-page" cardClassName="signup-login-card">
      <div className="auth-form-card signup-card signup-reference-form">
        <button type="button" className="auth-back-link" onClick={onLogin}><ArrowLeft size={14} /> Back to Login</button>
        <div className="auth-heading login-heading"><h1>Create Your Account</h1><p>Join Utsavkosh and begin managing celebrations beautifully.</p></div>
        <form onSubmit={submit}>
          <div className="login-socials">
            <button type="button" onClick={async () => { setErrors({}); try { const { error } = await requireSupabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); if (error) setErrors({ google: error.message }) } catch (error) { setErrors({ google: error instanceof Error ? error.message : "Google sign-in could not start." }) } }}><b className="google-mark">G</b> Continue with Google</button>
          </div>
          {errors.google && <p className="auth-inline-message login-social-message">{errors.google}</p>}
          <div className="login-divider"><span>OR</span></div>
          <label className={`auth-field ${errors.name ? "has-error" : ""}`}><span>Full Name</span><div><UserRound size={16} /><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your full name" /></div>{errors.name && <em>{errors.name}</em>}</label>
          <label className={`auth-field ${errors.email ? "has-error" : ""}`}><span>Email Address</span><div><Mail size={16} /><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@business.com" /></div>{errors.email && <em>{errors.email}</em>}</label>
          <SignupPasswordInput
            label="Password"
            placeholder="Create a password"
            value={form.password}
            onChange={(value) => update("password", value)}
            error={errors.password}
            valid={passwordValid}
          />
          <ul className="password-requirements" aria-label="Password requirements">
            {passwordRequirements.map((requirement) => (
              <li className={requirement.met ? "met" : ""} key={requirement.label}>
                <span>{requirement.met ? <Check size={10} /> : "−"}</span>
                {requirement.label}
              </li>
            ))}
          </ul>
          {errors.auth && <p className="auth-inline-message">{errors.auth}</p>}
          {errors.google && <p className="auth-inline-message">{errors.google}</p>}
          <label className="auth-terms"><input type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} /><span>I agree to the Terms and Conditions for using Utsavkosh.</span></label>
          {errors.terms && <p className="auth-inline-message">{errors.terms}</p>}
          <button type="submit" className="auth-primary login-submit" disabled={loading || !canSubmit}>{loading ? <><i /> Creating account…</> : <><span>Create Account</span><ArrowRight size={18} /></>}</button>
        </form>
        <p className="auth-switch">Already have an account? <button type="button" onClick={onLogin}>Login</button></p>
      </div>
    </LoginLayout>
  )
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  return (
    <AuthLayout>
      <div className="auth-form-card compact-auth-card">
        <button type="button" className="auth-back-link" onClick={onBack}><ArrowLeft size={14} /> Back to Login</button>
        <div className="auth-heading"><span>ACCOUNT RECOVERY</span><h1>Reset your password</h1><p>Enter your account email and we’ll send a secure reset link.</p></div>
        <label className="auth-field"><span>Email Address</span><div><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@business.com" /></div></label>
        <button type="button" className="auth-primary" onClick={async () => {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage("Enter a valid email address."); return }
          try { const client = requireSupabase(); const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` }); setMessage(error ? error.message : "If an account exists for this email, a password reset link has been sent.") }
          catch (error) { setMessage(error instanceof Error ? error.message : "Unable to request a reset link.") }
        }}>Continue</button>
        {message && <p className="auth-inline-message visible">{message}</p>}
      </div>
    </AuthLayout>
  )
}

function Welcome({ onRegister, onLogin, accountCreated = false }: { onRegister: () => void; onLogin: () => void; accountCreated?: boolean }) {
  return (
    <LoginLayout pageClassName="choice-login-page" cardClassName="choice-login-card">
      <button type="button" className="auth-back-link choice-back-link" onClick={onLogin}><ArrowLeft size={14} /> Return to Login</button>
      <div className="welcome-heading choice-heading"><span>LET&apos;S GET STARTED</span><h1>Welcome to Utsavkosh!</h1><p>How would you like to get started?</p></div>
      {accountCreated && <div className="account-created-banner"><Check size={15} /><span><strong>Account created successfully</strong><small>Your account is ready. Set up your business to continue.</small></span></div>}
      <div className="onboarding-choice-grid">
        <article><span className="choice-icon"><Building2 size={28} /></span><small>YOUR WORKSPACE</small><h2>Register My Business</h2><p>Set up your decoration business and start managing events, bookings, packages, and payments.</p><button type="button" className="auth-primary" onClick={onRegister}>Register My Business <ChevronRight size={16} /></button></article>
        <article><span className="choice-icon gold"><Compass size={28} /></span><small>RETURNING USER</small><h2>Already have an account?</h2><p>Return to sign-in if you need to use a different account before creating your business workspace.</p><button type="button" className="choice-secondary" onClick={onLogin}>Return to Login <ChevronRight size={16} /></button></article>
      </div>
      <p className="welcome-note"><Sparkles size={14} /> You can register your business later from Business Settings.</p>
    </LoginLayout>
  )
}

function WizardField({ label, value, onChange, error, optional, type = "text" }: { label: string; value: string; onChange: (value: string) => void; error?: string; optional?: boolean; type?: string }) {
  return <label className={`wizard-field ${error ? "has-error" : ""}`}><span>{label} {optional ? <small>Optional</small> : <b>*</b>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} />{error && <em>{error}</em>}</label>
}

function BusinessWizard({ onCancel, onComplete }: { onCancel: () => void; onComplete: (business: RegisteredBusiness) => Promise<void> }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyBusiness)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmed, setConfirmed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const update = <K extends keyof RegisteredBusiness>(key: K, value: RegisteredBusiness[K]) => setForm({ ...form, [key]: value })
  const validate = () => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!form.name.trim()) next.name = "Business name is required."
      if (!form.type) next.type = "Choose a business type."
    }
    if (step === 2) {
      for (const key of ["owner", "primaryPhone", "email", "address", "city", "state", "pin"] as const) if (!form[key].trim()) next[key] = "This field is required."
      if (form.primaryPhone && !/^[+\d][\d\s-]{7,}$/.test(form.primaryPhone)) next.primaryPhone = "Enter a valid phone number."
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address."
      if (form.pin && !/^\d{6}$/.test(form.pin)) next.pin = "PIN code must contain 6 digits."
    }
    setErrors(next)
    return !Object.keys(next).length
  }
  const next = () => { if (validate()) setStep(Math.min(4, step + 1)) }
  return (
    <main className="registration-page">
      <header className="registration-header"><AuthBrand /><div><button type="button" onClick={() => window.localStorage.setItem("utsavkosh-registration-draft", JSON.stringify(form))}><FileText size={14} /> Save Progress</button><button type="button" onClick={() => { if (window.confirm("Cancel business registration? Your current in-memory entries will be closed.")) onCancel() }}>Cancel</button></div></header>
      <section className="registration-shell">
        <div className="registration-intro"><span>BUSINESS REGISTRATION</span><h1>Set up your business</h1><p>Complete the four short steps below. You can refine these settings later.</p></div>
        <div className="registration-progress">{["Business Details", "Contact Information", "Business Settings", "Review & Complete"].map((label, index) => <button type="button" key={label} className={`${step === index + 1 ? "active" : ""} ${step > index + 1 ? "complete" : ""}`} onClick={() => index + 1 < step && setStep(index + 1)}><i>{step > index + 1 ? <Check size={13} /> : index + 1}</i><span><small>STEP {index + 1}</small><strong>{label}</strong></span></button>)}</div>
        <section className="registration-card">
          {step === 1 && <><div className="registration-card-heading"><span><Building2 size={18} /></span><div><h2>Business Details</h2><p>Tell us about the decoration business you&apos;re setting up.</p></div></div><div className="wizard-form-grid"><WizardField label="Business Name" value={form.name} onChange={(value) => update("name", value)} error={errors.name} /><label className={`wizard-field ${errors.type ? "has-error" : ""}`}><span>Business Type <b>*</b></span><select value={form.type} onChange={(event) => update("type", event.target.value)}>{["Wedding Decoration", "Event Decoration", "Wedding & Event Decoration", "Event Rental", "Other"].map((option) => <option key={option}>{option}</option>)}</select>{errors.type && <em>{errors.type}</em>}</label><label className="wizard-field full"><span>Business Description <small>Optional</small></span><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe your services, specialities, and approach…" /></label><div className="wizard-logo-upload"><Upload size={20} /><strong>Business Logo</strong><span>Logo uploads are not enabled yet. You can add a logo URL in Business Settings.</span></div></div></>}
          {step === 2 && <><div className="registration-card-heading"><span><Phone size={18} /></span><div><h2>Contact Information</h2><p>Add the contact details that identify your business.</p></div></div><div className="wizard-form-grid"><WizardField label="Owner Name" value={form.owner} onChange={(value) => update("owner", value)} error={errors.owner} /><WizardField label="Primary Phone Number" value={form.primaryPhone} onChange={(value) => update("primaryPhone", value)} error={errors.primaryPhone} /><WizardField label="Secondary Phone Number" value={form.secondaryPhone} onChange={(value) => update("secondaryPhone", value)} optional /><WizardField label="Business Email" value={form.email} onChange={(value) => update("email", value)} error={errors.email} type="email" /><WizardField label="Address" value={form.address} onChange={(value) => update("address", value)} error={errors.address} /><WizardField label="City" value={form.city} onChange={(value) => update("city", value)} error={errors.city} /><WizardField label="State" value={form.state} onChange={(value) => update("state", value)} error={errors.state} /><WizardField label="PIN Code" value={form.pin} onChange={(value) => update("pin", value)} error={errors.pin} /><WizardField label="Country" value={form.country} onChange={(value) => update("country", value)} /></div></>}
          {step === 3 && <><div className="registration-card-heading"><span><Sparkles size={18} /></span><div><h2>Business Settings</h2><p>Choose practical defaults for your new workspace.</p></div></div><div className="wizard-form-grid"><label className="wizard-field"><span>Default Currency</span><select value={form.currency} onChange={(event) => update("currency", event.target.value)}><option>INR (₹)</option></select></label><label className="wizard-field"><span>Time Zone</span><select value={form.timezone} onChange={(event) => update("timezone", event.target.value)}><option>Asia/Kolkata</option></select></label><label className="wizard-field"><span>Date Format</span><select value={form.dateFormat} onChange={(event) => update("dateFormat", event.target.value)}><option>DD MMM YYYY</option><option>DD/MM/YYYY</option></select></label><WizardField label="Quotation Number Prefix" value={form.quotePrefix} onChange={(value) => update("quotePrefix", value)} /><WizardField label="Invoice Number Prefix" value={form.invoicePrefix} onChange={(value) => update("invoicePrefix", value)} /><div className="wizard-setting-toggles full"><label><span><strong>Enable tax configuration</strong><small>Optional; leave disabled if tax does not apply.</small></span><input type="checkbox" checked={form.taxEnabled} onChange={(event) => update("taxEnabled", event.target.checked)} /></label>{form.taxEnabled && <div className="wizard-tax-row"><WizardField label="Tax Label" value={form.taxLabel} onChange={(value) => update("taxLabel", value)} /><WizardField label="Tax Rate (%)" value={form.taxRate} onChange={(value) => update("taxRate", value)} optional /></div>}<label><span><strong>Allow Custom Catalogue Items</strong><small>Create one-off items when building packages and documents.</small></span><input type="checkbox" checked={form.customItems} onChange={(event) => update("customItems", event.target.checked)} /></label><label><span><strong>Enable Package Customization</strong><small>Adjust reusable package templates for each customer.</small></span><input type="checkbox" checked={form.packageCustomization} onChange={(event) => update("packageCustomization", event.target.checked)} /></label></div></div><p className="wizard-help"><Sparkles size={13} /> All of these preferences can be changed later in Business Settings.</p></>}
          {step === 4 && <><div className="registration-card-heading"><span><ShieldCheck size={18} /></span><div><h2>Review &amp; Complete</h2><p>Confirm the information below before creating your workspace.</p></div></div><div className="review-grid"><article><div><span>BUSINESS DETAILS</span><button type="button" onClick={() => setStep(1)}>Edit</button></div><h3>{form.name}</h3><p>{form.type}</p><small>{form.description || "No business description added."}</small></article><article><div><span>CONTACT INFORMATION</span><button type="button" onClick={() => setStep(2)}>Edit</button></div><h3>{form.owner}</h3><p>{form.primaryPhone} · {form.email}</p><small>{form.address}, {form.city}, {form.state} {form.pin}, {form.country}</small></article><article className="full"><div><span>BUSINESS SETTINGS</span><button type="button" onClick={() => setStep(3)}>Edit</button></div><dl><div><dt>Currency</dt><dd>{form.currency}</dd></div><div><dt>Time zone</dt><dd>{form.timezone}</dd></div><div><dt>Document prefixes</dt><dd>{form.quotePrefix} / {form.invoicePrefix}</dd></div><div><dt>Tax</dt><dd>{form.taxEnabled ? `${form.taxLabel} ${form.taxRate || "rate not set"}` : "Not configured"}</dd></div></dl></article></div><label className="review-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> I confirm that the business information provided is correct.</label></>}
          {saveError && <p className="auth-inline-message">{saveError}</p>}
          <footer className="wizard-footer"><button type="button" className="wizard-back" disabled={step === 1 || saving} onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</button><span>Step {step} of 4</span>{step < 4 ? <button type="button" className="auth-primary" onClick={next}>Next <ChevronRight size={15} /></button> : <button type="button" className="auth-primary" disabled={!confirmed || saving} onClick={async () => { setSaving(true); setSaveError(""); try { await onComplete(form) } catch (error) { setSaveError(error instanceof Error ? error.message : "Could not save business.") } finally { setSaving(false) } }}>{saving ? "Saving…" : "Create Business"}</button>}</footer>
        </section>
      </section>
    </main>
  )
}

function BusinessSuccess({ business, onContinue }: { business: RegisteredBusiness; onContinue: () => void }) {
  return <main className="business-success-page"><AuthBrand /><section><span className="success-ring"><Check size={30} /></span><small>BUSINESS CREATED</small><h1>{business.name} is ready</h1><p>Your business workspace has been saved. It starts with zero records so you can build it intentionally.</p><div><span><Building2 size={16} /> {business.type}</span><span><ShieldCheck size={16} /> Saved to your Supabase workspace</span></div><button type="button" className="auth-primary" onClick={onContinue}>Open My Dashboard <ChevronRight size={16} /></button></section></main>
}

export function AuthExperience({ onBusinessCreated, initialScreen = "login" }: { onBusinessCreated: (business: RegisteredBusiness) => void; initialScreen?: "login" | "welcome" }) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen)
  const [created, setCreated] = useState<RegisteredBusiness | null>(null)
  const [accountCreated, setAccountCreated] = useState(false)
  if (screen === "login") return <Login onSignup={() => setScreen("signup")} onForgot={() => setScreen("forgot")} onNewUser={(business) => { if (business) { onBusinessCreated(business) } else { setScreen("welcome") } }} />
  if (screen === "signup") return <Signup onLogin={() => setScreen("login")} onComplete={() => { setAccountCreated(true); setScreen("welcome") }} />
  if (screen === "forgot") return <ForgotPassword onBack={() => setScreen("login")} />
  if (screen === "welcome") return <Welcome accountCreated={accountCreated} onRegister={() => setScreen("register")} onLogin={() => setScreen("login")} />
  if (screen === "register") return <BusinessWizard onCancel={() => setScreen("welcome")} onComplete={async (business) => { const client = requireSupabase(); const { data: sessionData, error: sessionError } = await client.auth.getSession(); const sessionUser = sessionData.session?.user; if (sessionError || !sessionData.session || !sessionUser) throw new Error("Your login session is missing or expired. Please sign in again before creating a business."); const { data: authData, error: authError } = await client.auth.getUser(); if (authError || !authData.user) throw new Error("Supabase could not verify your signed-in user. Please sign in again."); if (authData.user.id !== sessionUser.id) throw new Error("Your session user does not match the verified user. Please sign out and sign in again."); const payload = {
      name: business.name.trim(),
      owner_id: sessionUser.id,
      owner_name: business.owner.trim() || authData.user.user_metadata?.full_name || null,
      email: business.email.trim() || authData.user.email || null,
      phone: business.primaryPhone.trim() || null,
      address: business.address.trim() || null,
      country: business.country || "India",
      postal_code: business.pin.trim() || null,
      business_type: business.type || null,
      description: business.description.trim() || null,
      city: business.city.trim() || null,
      state: business.state.trim() || null,
      pincode: business.pin.trim() || null,
      currency: business.currency,
      timezone: business.timezone,
      date_format: business.dateFormat,
      quotation_prefix: business.quotePrefix.trim() || "QT",
      invoice_prefix: business.invoicePrefix.trim() || "INV",
      tax_enabled: business.taxEnabled,
      tax_rate: business.taxEnabled && business.taxRate.trim() ? Number(business.taxRate) : null,
      allow_custom_items: business.customItems,
    }; console.info("Utsavkosh business insert diagnostics", { sessionUserId: sessionUser.id, ownerIdSent: payload.owner_id, idsMatch: sessionUser.id === payload.owner_id }); const { data, error } = await client.from("businesses").insert(payload).select("*").single(); if (error) { console.error("Business insert rejected", { code: error.code, message: error.message, details: error.details, hint: error.hint, sessionUserId: sessionUser.id, ownerIdSent: payload.owner_id }); throw new Error(`Business could not be saved: ${error.message} (code ${error.code || "unknown"}). Authenticated user ID and owner_id were checked in the browser console. Check businesses RLS policies and triggers.`); } const { error: memberError } = await client.from("business_members").insert({ business_id: data.id, user_id: sessionUser.id, role: "owner" }); if (memberError) console.warn("Business saved; membership row could not be created", memberError.message); setCreated(registeredBusinessFromRow(data as Record<string, unknown>)); setScreen("success") }} />
  return <BusinessSuccess business={created!} onContinue={() => onBusinessCreated(created!)} />
}

