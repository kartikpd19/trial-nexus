import { forwardRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* Split layout: navy brand panel on the left, form on the right */
export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-[100dvh] bg-white">
      <div className="navy-surface hidden flex-[1.4] items-center justify-center md:flex">
        <Link to="/" aria-label="Trial Nexus home" className="focus-ring inline-flex items-center gap-4 rounded-lg text-white">
          <span className="block h-14 w-14 bg-white" aria-hidden="true" />
          <span className="text-[44px] font-semibold tracking-tight">Trial Nexus</span>
        </Link>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Link to="/" className="focus-ring-light mb-10 inline-flex items-center gap-2.5 rounded text-lg font-semibold text-navy md:hidden">
          <span className="block h-6 w-6 bg-navy" aria-hidden="true" />Trial Nexus
        </Link>
        <div className="w-full max-w-[340px]">{children}</div>
      </main>
    </div>
  )
}

export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-[#4A5068]">{subtitle}</p>}
    </div>
  )
}

const inputBase = 'h-10 w-full rounded-full border bg-white px-4 text-base text-ink placeholder:text-[#A3A8B6] transition focus:outline-none focus:ring-2 sm:text-sm'
const inputTone = (err) => (err ? 'border-[#D92D20] focus:ring-[#D92D20]/20' : 'border-[#D6D8E4] focus:border-navy focus:ring-navy/15')

export function Field({ id, label, error, hint, className = '', ...props }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>
      <input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`${inputBase} ${inputTone(error)}`} {...props} />
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 px-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 px-1 text-xs text-[#B42318]">{error}</p>}
    </div>
  )
}

const EyeIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
)

export const PasswordField = forwardRef(function PasswordField({ id, label, error, hint, value, onChange, children, ...props }, ref) {
  const [show, setShow] = useState(false)
  const [caps, setCaps] = useState(false)
  const checkCaps = (e) => setCaps(Boolean(e.getModifierState?.('CapsLock')))
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`, caps && `${id}-caps`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          onBlur={() => setCaps(false)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${inputBase} ${inputTone(error)} pr-11`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="focus-ring-light absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink hover:bg-[#F0F1F4]"
        >
          <EyeIcon off={show} />
        </button>
      </div>
      {caps && <p id={`${id}-caps`} className="mt-1.5 px-1 text-xs text-[#9A6200]">Caps Lock is on.</p>}
      {hint && !error && <div id={`${id}-hint`} className="mt-1.5 px-1 text-xs text-muted">{hint}</div>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 px-1 text-xs text-[#B42318]">{error}</p>}
      {children}
    </div>
  )
})

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/* Gray when not ready (matches the design's inactive state), navy when ready */
export function SubmitButton({ ready, loading, children, loadingText }) {
  return (
    <button
      type="submit"
      aria-disabled={!ready || loading}
      className={`flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${
        ready && !loading ? 'bg-navy text-white hover:bg-navy-800' : 'cursor-not-allowed bg-[#8C8C8C] text-white'
      }`}
    >
      {loading && <Spinner />}
      {loading ? loadingText : children}
    </button>
  )
}

export function GoogleButton({ onClick, loading, label = 'Sign in with Google' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="focus-ring-light flex h-10 w-full items-center justify-center gap-2.5 rounded-full border border-[#D6D8E4] bg-white text-sm font-medium text-ink transition hover:bg-[#F7F8FA] disabled:opacity-60"
    >
      {loading ? <Spinner /> : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
        </svg>
      )}
      {label}
    </button>
  )
}

export function OrDivider({ label = 'or use email' }) {
  return (
    <div className="my-4 flex items-center gap-3 text-xs text-muted" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />{label}<span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  )
}

export function FormAlert({ tone = 'error', children }) {
  const tones = {
    error: 'border-[#F5C2BE] bg-[#FEF3F2] text-[#912018]',
    info: 'border-[#C9D3F0] bg-[#EEF2FC] text-navy',
    success: 'border-[#B7E4CC] bg-mint-bg text-mint-fg',
  }
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed ${tones[tone]}`}>{children}</div>
}

export const linkCls = 'focus-ring-light rounded font-semibold text-navy underline underline-offset-2 hover:text-navy-800'
