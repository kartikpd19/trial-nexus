import { Link, Navigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import ProfileOverview from '../components/account/ProfileOverview.jsx'
import MedicalDocuments from '../components/account/MedicalDocuments.jsx'
import TreatmentRecords from '../components/account/TreatmentRecords.jsx'
import AccountSettings from '../components/account/AccountSettings.jsx'
import { DocAddIcon, DocIcon, GearIcon, PersonIcon } from '../components/account/AccountIcons.jsx'
import { useAuth } from '../auth.jsx'
import { memberId, useProfile } from '../profileStore.js'

const tabs = [
  { id: 'profile', label: 'Profile Overview', icon: PersonIcon },
  { id: 'documents', label: 'Medical Documents', icon: DocAddIcon },
  { id: 'treatments', label: 'Treatment Records', icon: DocIcon },
  { id: 'settings', label: 'Accounts', icon: GearIcon },
]

// Fields that improve recommendations, in the order we prompt for them
const infoFields = [
  ['birthday', 'pf-birthday'], ['gender', 'pf-gender'], ['location', 'pf-location'], ['postalCode', 'pf-postal'],
  ['medications', 'pf-meds'], ['symptoms', 'pf-symptoms'], ['allergies', 'pf-allergy'],
]

function AddInfoCard({ profile }) {
  const missing = infoFields.filter(([k]) => (Array.isArray(profile[k]) ? !profile[k].length : !profile[k]))
  const done = infoFields.length - missing.length
  if (!missing.length) {
    return (
      <div className="rounded-lg bg-mint-bg p-3">
        <p className="text-sm font-semibold text-mint-fg">Profile complete</p>
        <p className="mt-0.5 text-xs text-mint-fg">Your recommendations use everything you’ve shared.</p>
      </div>
    )
  }
  return (
    <Link
      to={`/account/profile#${missing[0][1]}-trigger`}
      onClick={() => setTimeout(() => { const el = document.getElementById(`${missing[0][1]}-trigger`); el?.scrollIntoView({ block: 'center' }); el?.focus() }, 50)}
      className="focus-ring-light block rounded-lg bg-[#E8EEFB] p-3 transition hover:bg-[#DDE6F9]"
    >
      <p className="text-sm font-semibold text-[#2337B5]">Add Info</p>
      <p className="mt-0.5 text-xs text-[#4A5068]">Get better recommendations</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
        <div className="h-full rounded-full bg-[#2F6FD6]" style={{ width: `${(done / infoFields.length) * 100}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-muted">{done} of {infoFields.length} details added</p>
    </Link>
  )
}

export default function AccountPage() {
  const { user } = useAuth()
  const { tab = 'profile' } = useParams()
  const [profile, update] = useProfile(user?.email)

  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(`/account/${tab}`)}`} replace />
  if (!tabs.some((t) => t.id === tab)) return <Navigate to="/account/profile" replace />

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />
      <div className="mx-auto grid max-w-[920px] gap-6 px-5 py-8 sm:px-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
        <aside className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EEEFF2] text-navy" aria-hidden="true"><PersonIcon className="h-7 w-7" /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted"><span className="sr-only">Member ID </span>{memberId(user)}</p>
            </div>
          </div>
          <nav aria-label="Account">
            <ul className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:mx-0 md:flex-col md:overflow-visible md:pb-0">
              {tabs.map((t) => {
                const active = t.id === tab
                return (
                  <li key={t.id} className="shrink-0">
                    <Link
                      to={`/account/${t.id}`}
                      aria-current={active ? 'page' : undefined}
                      className={`focus-ring-light flex min-h-[40px] items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-[11px] font-medium uppercase tracking-[.03em] transition ${
                        active ? 'bg-[#F0F1F4] text-ink' : 'text-[#6B7591] hover:bg-[#F7F8FA] hover:text-ink'
                      }`}
                    >
                      <t.icon className="h-[18px] w-[18px]" />{t.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="hidden md:block"><AddInfoCard profile={profile} /></div>
        </aside>

        <main className="min-w-0 rounded-xl border border-line p-4 sm:p-5">
          {tab === 'profile' && <ProfileOverview profile={profile} update={update} />}
          {tab === 'documents' && <MedicalDocuments email={user.email} />}
          {tab === 'treatments' && <TreatmentRecords email={user.email} />}
          {tab === 'settings' && <AccountSettings />}
        </main>
        <div className="md:hidden"><AddInfoCard profile={profile} /></div>
      </div>
    </div>
  )
}
