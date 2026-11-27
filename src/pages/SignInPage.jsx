import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout, AuthHeading, Field, FormAlert, GoogleButton, OrDivider, PasswordField, SubmitButton, linkCls } from '../components/AuthUI.jsx'
import { isEmail, useAuth } from '../auth.jsx'

const MAX_ATTEMPTS = 5
const LOCK_SECONDS = 30

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const justReset = params.get('reset') === 'sent'

  const [email, setEmail] = useState(params.get('email') || '')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(null) // { code, message }
  const [attempts, setAttempts] = useState(0)
  const [lockedFor, setLockedFor] = useState(0)
  const passwordRef = useRef(null)

  useEffect(() => {
    if (!lockedFor) return
    const t = setTimeout(() => setLockedFor((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [lockedFor])

  const emailError = (touched.email || submitted) && email && !isEmail(email) ? 'Enter a valid email address, like name@example.com.' : null
  const ready = isEmail(email) && password.length > 0 && !lockedFor

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (!ready || loading) return
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      const tries = attempts + 1
      setAttempts(tries)
      if (err.code === 'no-account') {
        setError({ code: err.code })
      } else if (err.code === 'wrong-password') {
        if (tries >= MAX_ATTEMPTS) { setLockedFor(LOCK_SECONDS); setAttempts(0) }
        setError({ code: tries >= MAX_ATTEMPTS ? 'locked' : err.code, left: MAX_ATTEMPTS - tries })
        setPassword('')
        passwordRef.current?.focus()
      } else {
        setError({ code: 'unknown' })
      }
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    setError(null)
    try { await signInWithGoogle(); navigate(next, { replace: true }) } catch { setError({ code: 'google' }) } finally { setGoogleLoading(false) }
  }

  const signupHref = `/signup${email && isEmail(email) ? `?email=${encodeURIComponent(email)}` : ''}`

  return (
    <AuthLayout>
      <AuthHeading title="Sign in to your account" />

      {justReset && !error && <FormAlert tone="success">If an account exists for that email, we've sent a reset link. Check your inbox, then sign in with your new password.</FormAlert>}
      {error?.code === 'no-account' && (
        <FormAlert>We couldn't find an account with that email. Check for typos or <Link to={signupHref} className={linkCls}>create an account</Link>.</FormAlert>
      )}
      {error?.code === 'wrong-password' && (
        <FormAlert>That password isn't right. {error.left <= 2 ? `${error.left} ${error.left === 1 ? 'try' : 'tries'} left before a short lockout. ` : ''}<Link to={`/forgot-password?email=${encodeURIComponent(email)}`} className={linkCls}>Reset your password</Link></FormAlert>
      )}
      {(error?.code === 'locked' || lockedFor > 0) && (
        <FormAlert>Too many attempts. For your security, try again in {lockedFor} seconds or <Link to={`/forgot-password?email=${encodeURIComponent(email)}`} className={linkCls}>reset your password</Link>.</FormAlert>
      )}
      {error?.code === 'google' && <FormAlert tone="info">Google sign-in isn't available yet. Please use your email and password.</FormAlert>}
      {error?.code === 'unknown' && <FormAlert>Something went wrong on our side. Please try again in a moment.</FormAlert>}

      <GoogleButton onClick={onGoogle} loading={googleLoading} />
      <OrDivider />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error?.code === 'no-account') setError(null) }}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError || (submitted && !email ? 'Enter your email address.' : null)}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          ref={passwordRef}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted && !password && !error ? 'Enter your password.' : null}
        />
        <SubmitButton ready={ready} loading={loading} loadingText="Signing in…">Sign in</SubmitButton>
      </form>

      <Link to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="focus-ring-light mt-3 inline-block rounded text-xs text-ink underline-offset-2 hover:underline">
        Forgot password?
      </Link>
      <p className="mt-8 text-center text-xs text-ink">
        Don't have an account? <Link to={signupHref} className={linkCls}>Sign up</Link>
      </p>
    </AuthLayout>
  )
}
