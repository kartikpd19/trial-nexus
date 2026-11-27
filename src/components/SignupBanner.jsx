import { Link, useLocation } from 'react-router-dom'
import { InfoIcon } from './Icons.jsx'
import { useAuth } from '../auth.jsx'

export default function SignupBanner() {
  const { user } = useAuth()
  const { pathname, search } = useLocation()
  if (user) return null // already signed up
  return (
    <aside aria-labelledby="signup-h" className="rounded-xl bg-[#F0F1F4] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="signup-h" className="text-[15px] font-bold uppercase tracking-wide text-ink">Sign up for better recommendations</h2>
          <p className="mt-1 text-sm text-[#4A5068]">Find recommendations that fit you. Your data stays private and protected.</p>
        </div>
        <Link to={`/signup?next=${encodeURIComponent(pathname + search)}`} className="focus-ring-light inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-navy-800">
          Create a Profile
        </Link>
      </div>
      <p className="mt-4 flex items-start gap-2 border-t border-[#DCDEE5] pt-3 text-xs text-muted">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
        Your data is handled with HIPAA-aware practices and used only to improve your recommendations. You can disconnect anytime.
      </p>
    </aside>
  )
}
