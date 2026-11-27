import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout, AuthHeading, Field, FormAlert, GoogleButton, OrDivider, PasswordField, SubmitButton, linkCls } from '../components/AuthUI.jsx'
import { isEmail, isName, normalizeEmail, passwordRules, useAuth } from '../auth.jsx'
import { ChevronDown } from '../components/Icons.jsx'

const DRAFT_KEY = 'tn-signup-draft' // keeps step 1 if the page is refreshed on step 2 (no password stored)
const readDraft = () => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || null } catch { return null } }
const saveDraft = (d) => { try { d ? sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)) : sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ } }

function DetailsStep({ initial, onContinue }) {
  const { emailExists, signInWithGoogle } = useAuth()
  const [form, setForm] = useState(initial)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [checking, setChecking] = useState(false)
  const [exists, setExists] = useState(false)
  const [googleMsg, setGoogleMsg] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); if (k === 'email') setExists(false) }
  const show = (k) => touched[k] || submitted
  const errors = {
    firstName: !form.firstName.trim() ? 'Enter your first name.' : !isName(form.firstName) ? 'Use letters only (hyphens and apostrophes are fine).' : null,
    lastName: !form.lastName.trim() ? 'Enter your last name.' : !isName(form.lastName) ? 'Use letters only (hyphens and apostrophes are fine).' : null,
    email: !form.email.trim() ? 'Enter your email address.' : !isEmail(form.email) ? 'Enter a valid email address, like name@example.com.' : null,
  }
  const ready = !errors.firstName && !errors.lastName && !errors.email

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (!ready || checking) return
    setChecking(true)
    try {
      if (await emailExists(form.email)) { setExists(true); return }
      onContinue({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: normalizeEmail(form.email) })
    } finally {
      setChecking(false)
    }
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    try { await signInWithGoogle() } catch { setGoogleMsg(true) } finally { setGoogleLoading(false) }
  }

  return (
    <>
      <AuthHeading title="Create an account" subtitle="Search, save, and receive trial recommendations." />
      {exists && (
        <FormAlert>An account with this email already exists. <Link to={`/signin?email=${encodeURIComponent(form.email)}`} className={linkCls}>Sign in instead</Link></FormAlert>
      )}
      {googleMsg && <FormAlert tone="info">Google sign-up isn't available yet. Please continue with your email.</FormAlert>}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstName" label="First name" autoComplete="given-name" maxLength={50} value={form.firstName} onChange={set('firstName')} onBlur={() => setTouched((t) => ({ ...t, firstName: true }))} error={show('firstName') ? errors.firstName : null} />
          <Field id="lastName" label="Last name" autoComplete="family-name" maxLength={50} value={form.lastName} onChange={set('lastName')} onBlur={() => setTouched((t) => ({ ...t, lastName: true }))} error={show('lastName') ? errors.lastName : null} />
        </div>
        <Field
          id="email"
          label="Email Address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your Email"
          value={form.email}
          onChange={set('email')}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={show('email') && form.email ? errors.email : submitted ? errors.email : null}
        />
        <SubmitButton ready={ready} loading={checking} loadingText="Checking…">Continue</SubmitButton>
      </form>

      <OrDivider label="or" />
      <GoogleButton onClick={onGoogle} loading={googleLoading} />
      <p className="mt-8 text-center text-xs text-ink">
        Already have an account? <Link to="/signin" className={linkCls}>Sign in</Link>
      </p>
    </>
  )
}

function PasswordStep({ details, onBack, onCreated }) {
  const { signUp } = useAuth()
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const results = passwordRules.map((r) => ({ ...r, ok: r.test(password) }))
  const ready = results.every((r) => r.ok)
  const emailLower = details.email.split('@')[0]
  const weakWarning = ready && password.toLowerCase().includes(emailLower.toLowerCase()) && emailLower.length > 2

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (!ready || loading) return
    setLoading(true)
    setError(null)
    try {
      await signUp({ ...details, password })
      onCreated()
    } catch (err) {
      setError(err.code === 'exists' ? 'exists' : 'unknown')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-tight text-ink outline-none">Password</h1>
        <p className="mt-1.5 text-sm text-[#4A5068]">Create a password to complete your registration</p>
      </div>
      {error === 'exists' && <FormAlert>An account with this email was just created. <Link to={`/signin?email=${encodeURIComponent(details.email)}`} className={linkCls}>Sign in</Link></FormAlert>}
      {error === 'unknown' && <FormAlert>We couldn't create your account. Please try again in a moment.</FormAlert>}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-semibold text-ink">Email Address</p>
          <p className="break-all text-sm text-[#4A5068]">{details.email}</p>
        </div>
        {/* Hidden username field helps password managers save the right email */}
        <input type="email" name="username" autoComplete="username" value={details.email} readOnly hidden />
        <PasswordField
          id="newPassword"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted && !ready ? 'Your password needs to meet all the requirements below.' : null}
        >
          <ul className="mt-2 space-y-1 px-1" aria-label="Password requirements">
            {results.map((r) => (
              <li key={r.id} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-mint-fg' : 'text-muted'}`}>
                <span aria-hidden="true" className={`grid h-3.5 w-3.5 place-items-center rounded-full text-[9px] ${r.ok ? 'bg-mint-fg text-white' : 'border border-[#C9CCD6]'}`}>{r.ok ? '✓' : ''}</span>
                {r.label}<span className="sr-only">{r.ok ? ' (done)' : ' (not yet)'}</span>
              </li>
            ))}
          </ul>
          {weakWarning && <p className="mt-2 px-1 text-xs text-[#9A6200]">Tip: avoid using your email name in your password.</p>}
        </PasswordField>
        <SubmitButton ready={ready} loading={loading} loadingText="Creating account…">Create an account</SubmitButton>
      </form>

      <div className="mt-4 text-center">
        <button type="button" onClick={onBack} className="focus-ring-light inline-flex items-center gap-1 rounded text-xs font-semibold text-ink underline underline-offset-2">
          <ChevronDown className="h-3.5 w-3.5 rotate-90" />Go back
        </button>
      </div>
    </>
  )
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const next = params.get('next') || '/'
  const [details, setDetails] = useState(() => readDraft() || { firstName: '', lastName: '', email: params.get('email') || '' })
  const step = params.get('step') === 'password' && details.email && isEmail(details.email) ? 'password' : 'details'

  const goTo = (s) => {
    const p = new URLSearchParams(params)
    s === 'password' ? p.set('step', 'password') : p.delete('step')
    setParams(p)
  }

  return (
    <AuthLayout>
      {step === 'details' ? (
        <DetailsStep
          initial={details}
          onContinue={(d) => { setDetails(d); saveDraft(d); goTo('password') }}
        />
      ) : (
        <PasswordStep
          details={details}
          onBack={() => goTo('details')}
          onCreated={() => { saveDraft(null); navigate(`/welcome?next=${encodeURIComponent(next)}`, { replace: true }) }}
        />
      )}
    </AuthLayout>
  )
}
