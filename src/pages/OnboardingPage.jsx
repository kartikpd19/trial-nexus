import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { readProfile, saveProfileFields } from '../profileStore.js'
import { ChevronDown, InfoIcon } from '../components/Icons.jsx'

const BLUE = '#3B5BDB'

const PatientArt = () => (
  <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
    <circle cx="13" cy="9" r="5" fill={BLUE} /><path d="M3 27c0-5.5 4.5-9 10-9s10 3.5 10 9z" fill={BLUE} />
    <circle cx="24" cy="23" r="6" fill="#E5484D" /><path d="M24 26.5l-2.6-2.4a1.6 1.6 0 012.6-1.9 1.6 1.6 0 012.6 1.9z" fill="#fff" />
  </svg>
)
const CaregiverArt = () => (
  <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
    <path d="M5 5h22a2 2 0 012 2v14a2 2 0 01-2 2H13l-6 5v-5H5a2 2 0 01-2-2V7a2 2 0 012-2z" fill={BLUE} />
    <path d="M16 18l-4-3.7a2.4 2.4 0 014-2.6 2.4 2.4 0 014 2.6z" fill="#7DE0E6" />
  </svg>
)
const ProArt = () => (
  <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
    <circle cx="16" cy="8" r="5" fill={BLUE} /><path d="M5 29c0-6.5 5-10 11-10s11 3.5 11 10z" fill={BLUE} />
    <path d="M11 19v4a3 3 0 006 0" stroke="#7DE0E6" strokeWidth="1.8" fill="none" /><circle cx="17" cy="23.5" r="1.6" fill="#7DE0E6" />
  </svg>
)

const roles = [
  { id: 'patient', title: 'I’m a Patient', text: 'I’m looking for a trial for myself.', Art: PatientArt },
  { id: 'caregiver', title: 'I’m a Caregiver', text: 'I’m helping a family member or friend find a trial.', Art: CaregiverArt },
  { id: 'professional', title: 'Healthcare Professional', text: 'I’m finding trials for my patients.', Art: ProArt },
]

const experiences = [
  { id: 'in-person', title: 'In-person', text: 'at a clinic or hospital' },
  { id: 'hybrid', title: 'Hybrid', text: 'some visits, some online' },
  { id: 'remote', title: 'Fully remote', text: 'all from home, online or by phone' },
  { id: 'not-sure', title: 'Not sure yet', text: '' },
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const daysIn = (m, y) => new Date(y || 2000, m, 0).getDate() // leap-year safe; default to a leap year

function DataDialog({ onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.querySelector('button')?.focus()
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[1300] grid place-items-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="data-h" className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="data-h" className="text-lg font-semibold text-ink">How we use your data</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#4A5068]">
          <li>Your answers are only used to match you with trials that fit.</li>
          <li>We never sell your information or share it with study teams unless you choose to apply.</li>
          <li>You can edit or delete these details anytime in your profile.</li>
        </ul>
        <button type="button" onClick={onClose} className="focus-ring-light mt-6 h-10 w-full rounded-full bg-navy text-sm font-semibold text-white">Got it</button>
      </div>
    </div>
  )
}

const selectCls = 'h-11 w-full appearance-none rounded-xl border border-[#D6D8E4] bg-white pl-3 pr-8 text-sm font-semibold text-ink focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15'

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const existing = user ? readProfile(user.email) : null
  const [step, setStep] = useState(0)
  const [role, setRole] = useState(existing?.role || '')
  const [dob, setDob] = useState(() => {
    if (!existing?.birthday) return { d: '', m: '', y: '' }
    const [y, m, d] = existing.birthday.split('-')
    return { d: String(+d), m: String(+m), y }
  })
  const [exp, setExp] = useState(existing?.trialExperience || [])
  const [dobTouched, setDobTouched] = useState(false)
  const [showData, setShowData] = useState(false)
  const headingRef = useRef(null)

  useEffect(() => { headingRef.current?.focus() }, [step])
  if (!user) return <Navigate to="/signin" replace />

  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 110 }, (_, i) => thisYear - 13 - i)
  const maxDay = daysIn(+dob.m, +dob.y)

  // DOB validation
  const dobComplete = dob.d && dob.m && dob.y
  const dobDate = dobComplete ? new Date(+dob.y, +dob.m - 1, +dob.d) : null
  const age = dobDate ? (Date.now() - dobDate) / 31557600000 : null
  const dobError = !dobComplete ? null
    : +dob.d > maxDay ? `${months[+dob.m - 1]} ${dob.y} only has ${maxDay} days.`
    : age < 13 ? 'You need to be at least 13 to use Trial Nexus.'
    : null
  const dobReady = dobComplete && !dobError

  const finish = (patch = {}) => {
    const iso = dobReady ? `${dob.y}-${dob.m.padStart(2, '0')}-${dob.d.padStart(2, '0')}` : existing.birthday
    saveProfileFields(user.email, { role, birthday: iso || '', trialExperience: exp, ...patch })
    navigate(next, { replace: true })
  }
  const advance = () => (step < 2 ? setStep(step + 1) : finish())
  const back = () => (step === 0 ? navigate(next, { replace: true }) : setStep(step - 1))

  const toggleExp = (id) => {
    setExp((cur) => {
      if (id === 'not-sure') return cur.includes('not-sure') ? [] : ['not-sure']
      const without = cur.filter((x) => x !== 'not-sure')
      return without.includes(id) ? without.filter((x) => x !== id) : [...without, id]
    })
  }

  const titles = ['Which best describes you?', 'What’s your date of birth?', 'What kind of trial experience are you open to?']
  const subtitles = [
    'This helps us show the most relevant trials and information.',
    'Many trials have age requirements. We use this to check them for you.',
    'Choose all that apply. You can change this later.',
  ]

  const continueBtn = (ready, onClick) => (
    <button
      type="button"
      onClick={() => (ready ? onClick() : step === 1 && setDobTouched(true))}
      aria-disabled={!ready}
      className={`mt-5 h-11 w-full rounded-xl text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${ready ? 'bg-navy text-white hover:bg-navy-800' : 'cursor-not-allowed bg-[#8C8C8C] text-white'}`}
    >
      Continue
    </button>
  )

  return (
    <div className="min-h-[100dvh] bg-white">
      <header className="flex items-center justify-between px-5 py-5 sm:px-6">
        <Link to="/" className="focus-ring-light inline-flex items-center gap-2 rounded text-[15px] font-semibold text-navy" aria-label="Trial Nexus home">
          <span className="block h-5 w-5 bg-navy" aria-hidden="true" />Trial Nexus
        </Link>
        <button type="button" onClick={back} className="focus-ring-light inline-flex min-h-[44px] items-center gap-1 rounded text-[13px] font-semibold text-ink underline underline-offset-2">
          <ChevronDown className="h-4 w-4 rotate-90" />Go back
        </button>
      </header>

      <main className="mx-auto w-full max-w-[420px] px-5 pb-16 pt-4">
        {/* Progress */}
        <div className="mx-auto flex max-w-[190px] gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#3B5BDB]' : 'bg-[#DCDEE5]'}`} />)}
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-center text-[22px] font-semibold leading-tight tracking-tight text-navy outline-none">{titles[step]}</h1>
        <p className="mt-1.5 text-center text-[13px] text-[#4A5068]">{subtitles[step]}</p>

        {step === 0 && (
          <ul className="mx-auto mt-5 max-w-[340px] space-y-3">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => { setRole(r.id); setStep(1) }}
                  aria-pressed={role === r.id}
                  className={`focus-ring-light flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition hover:border-navy/40 hover:shadow-card ${role === r.id ? 'border-navy bg-[#F4F6FD]' : 'border-[#DCDEE5]'}`}
                >
                  <r.Art />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{r.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-[#4A5068]">{r.text}</span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 -rotate-90 text-ink" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {step === 1 && (
          <div className="mx-auto mt-5 max-w-[300px]">
            <fieldset>
              <legend className="sr-only">Date of birth</legend>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['d', 'Day', Array.from({ length: maxDay }, (_, i) => [String(i + 1), String(i + 1)])],
                  ['m', 'Month', months.map((m, i) => [String(i + 1), m.slice(0, 3)])],
                  ['y', 'Year', years.map((y) => [String(y), String(y)])],
                ].map(([k, label, opts]) => (
                  <div key={k} className="relative">
                    <label htmlFor={`dob-${k}`} className="sr-only">{label}</label>
                    <select
                      id={`dob-${k}`}
                      value={dob[k]}
                      onChange={(e) => setDob({ ...dob, [k]: e.target.value })}
                      aria-invalid={Boolean(dobError) || (dobTouched && !dob[k])}
                      aria-describedby={dobError ? 'dob-err' : undefined}
                      autoComplete={k === 'd' ? 'bday-day' : k === 'm' ? 'bday-month' : 'bday-year'}
                      className={selectCls}
                    >
                      <option value="">{label}</option>
                      {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
                  </div>
                ))}
              </div>
            </fieldset>
            {(dobError || (dobTouched && !dobComplete)) && (
              <p id="dob-err" role="alert" className="mt-2 text-center text-xs text-[#B42318]">{dobError || 'Choose your day, month and year of birth.'}</p>
            )}
            {existing?.birthday && <p className="mt-2 text-center text-xs text-muted">Already saved in your profile.</p>}
            {continueBtn(dobReady, advance)}
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto mt-5 max-w-[340px]">
            <fieldset>
              <legend className="sr-only">Trial experience</legend>
              <div className="space-y-2.5">
                {experiences.map((x) => {
                  const on = exp.includes(x.id)
                  return (
                    <label key={x.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition hover:border-navy/40 ${on ? 'border-navy bg-[#F4F6FD]' : 'border-[#DCDEE5]'} ${!x.text ? 'py-3.5' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleExp(x.id)} className="h-4 w-4 shrink-0 rounded accent-navy" />
                      <span>
                        <span className="block text-sm font-semibold text-ink">{x.title}</span>
                        {x.text && <span className="block text-xs text-[#4A5068]">{x.text}</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            {continueBtn(exp.length > 0, advance)}
          </div>
        )}

        {step < 2 && (
          <p className="mt-6 text-center">
            <button type="button" onClick={() => setShowData(true)} className="focus-ring-light inline-flex items-center gap-1.5 rounded text-xs text-ink underline underline-offset-2">
              <InfoIcon className="h-4 w-4" />How we use your data
            </button>
          </p>
        )}
        <p className="mt-6 text-center">
          <button type="button" onClick={advance} className="focus-ring-light rounded px-2 py-1 text-xs font-semibold uppercase text-ink underline underline-offset-2">Skip</button>
        </p>
      </main>
      {showData && <DataDialog onClose={() => setShowData(false)} />}
    </div>
  )
}
