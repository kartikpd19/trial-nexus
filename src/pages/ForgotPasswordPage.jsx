import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout, AuthHeading, Field, FormAlert, SubmitButton, linkCls } from '../components/AuthUI.jsx'
import { isEmail, useAuth } from '../auth.jsx'
import { ChevronDown } from '../components/Icons.jsx'

export default function ForgotPasswordPage() {
  const { requestReset } = useAuth()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const ready = isEmail(email)

  const onSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!ready || loading) return
    setLoading(true)
    try { await requestReset(email); setSent(true) } finally { setLoading(false) }
  }

  return (
    <AuthLayout>
      <AuthHeading title="Reset your password" subtitle="Enter the email you signed up with and we'll send you a reset link." />
      {sent ? (
        <>
          {/* Same message whether or not the account exists, so emails can't be discovered */}
          <FormAlert tone="success">If an account exists for <strong className="break-all">{email}</strong>, you'll get an email with a reset link in a few minutes. Check your spam folder too.</FormAlert>
          <button type="button" onClick={() => setSent(false)} className="focus-ring-light rounded text-xs text-ink underline underline-offset-2">Use a different email</button>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field
            id="email"
            label="Email Address"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            error={touched && !ready ? (email ? 'Enter a valid email address, like name@example.com.' : 'Enter your email address.') : null}
          />
          <SubmitButton ready={ready} loading={loading} loadingText="Sending…">Send reset link</SubmitButton>
        </form>
      )}
      <div className="mt-6 text-center">
        <Link to={`/signin${email ? `?email=${encodeURIComponent(email)}` : ''}`} className={`${linkCls} inline-flex items-center gap-1 text-xs`}>
          <ChevronDown className="h-3.5 w-3.5 rotate-90" />Back to sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
