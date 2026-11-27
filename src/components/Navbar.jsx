import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export function Logo({ className = '', light = false }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 rounded-md text-[17px] font-semibold tracking-tight ${light ? 'focus-ring-light text-navy' : 'focus-ring text-white'} ${className}`}
      aria-label="Trial Nexus home"
    >
      <span className={`block h-5 w-5 rounded-[3px] ${light ? 'bg-navy' : 'bg-white'}`} aria-hidden="true" />
      Trial Nexus
    </Link>
  )
}

// variant "dark" sits on the navy hero; "light" is the white bar used on inner pages.
// The light (inner-page) bar is always full width: logo far left, search centred on the page, links far right.
function AccountMenu({ user, onSignOut, light }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus() } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.firstName}`}
        onClick={() => setOpen((o) => !o)}
        className={`${light ? 'focus-ring-light' : 'focus-ring'} inline-flex min-h-[44px] items-center gap-2 rounded-full pl-1 pr-3 text-sm font-semibold ${light ? 'text-ink hover:bg-[#F0F1F4]' : 'text-white hover:bg-white/10'}`}
      >
        <span className={`grid h-9 w-9 place-items-center rounded-full text-xs ${light ? 'bg-navy text-white' : 'bg-white text-navy'}`} aria-hidden="true">{initials}</span>
        <span className="hidden sm:inline">{user.firstName}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-xl bg-white p-2 text-left shadow-[0_16px_40px_-12px_rgba(2,27,58,.35)] ring-1 ring-black/5">
          <p className="px-3 py-2 text-xs text-muted">Signed in as<br /><span className="break-all font-medium text-ink">{user.email}</span></p>
          <div className="my-1 h-px bg-line" />
          <Link to="/account/profile" role="menuitem" onClick={() => setOpen(false)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink hover:bg-[#F0F1F4] focus:bg-[#F0F1F4] focus:outline-none">My profile</Link>
          <Link to="/account/documents" role="menuitem" onClick={() => setOpen(false)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink hover:bg-[#F0F1F4] focus:bg-[#F0F1F4] focus:outline-none">Medical documents</Link>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onSignOut() }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink hover:bg-[#F0F1F4] focus:bg-[#F0F1F4] focus:outline-none">
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ variant = 'dark', search = null }) {
  const { user, signOut } = useAuth()
  const { pathname, search: qs } = useLocation()
  const here = `${pathname}${qs}`
  const light = variant === 'light'
  const ring = light ? 'focus-ring-light' : 'focus-ring'
  const layout = light
    ? 'max-w-none flex justify-between md:grid md:grid-cols-[1fr_minmax(0,520px)_1fr]'
    : 'max-w-page flex justify-between'
  return (
    <header className={`relative z-[1100] ${light ? 'border-b border-line bg-white' : ''}`}>
      <nav aria-label="Main" className={`mx-auto items-center gap-4 px-5 py-4 sm:px-6 ${layout}`}>
        <Logo light={light} className="justify-self-start" />
        {search ? <div className="hidden min-w-0 md:block">{search}</div> : light && <span className="hidden md:block" />}
        <div className="flex items-center gap-2 justify-self-end sm:gap-5">
          <Link to="/#about" className={`${ring} hidden rounded px-1 text-sm sm:inline ${light ? 'text-ink/80 hover:text-ink' : 'text-white/85 hover:text-white'}`}>About</Link>
          <Link to="/#faq" className={`${ring} hidden rounded px-1 text-sm sm:inline ${light ? 'text-ink/80 hover:text-ink' : 'text-white/85 hover:text-white'}`}>FAQ</Link>
          <Link
            to={light ? '/trials' : '/#search'}
            className={`${ring} hidden min-h-[44px] items-center rounded-full border px-5 text-sm font-semibold transition sm:inline-flex ${
              light ? 'border-line text-ink hover:border-ink/40' : 'border-white/80 text-white hover:bg-white/10'
            }`}
          >
            Find My Trial
          </Link>
          {user ? (
            <AccountMenu user={user} onSignOut={signOut} light={light} />
          ) : (
            <Link
              to={`/signup?next=${encodeURIComponent(here)}`}
              className={`${ring} inline-flex min-h-[44px] items-center rounded-full px-6 text-sm font-semibold transition ${
                light ? 'bg-navy text-white hover:bg-navy-800' : 'bg-white text-navy hover:bg-white/90'
              }`}
            >
              Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
