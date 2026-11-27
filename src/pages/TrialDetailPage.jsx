import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeaderSearch from '../components/HeaderSearch.jsx'
import FaqItem from '../components/FaqItem.jsx'
import EligibilityQuiz from '../components/EligibilityQuiz.jsx'
import QualifyCard from '../components/QualifyCard.jsx'
import {
  CalendarIcon, CheckCircle, ChevronDown, ClipboardIcon, FlaskIcon, HeartIcon, LockIcon,
  PinIcon, ShareIcon, SparkleIcon, UsersIcon, XCircle,
} from '../components/Icons.jsx'
import { footer } from '../data.js'
import { phaseLabel, trials } from '../trials.js'
import { getTrialDetail } from '../trialDetails.js'

const SAVED_KEY = 'tn-saved-trials'
const readSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || [] } catch { return [] } }

function SectionHeading({ id, children }) {
  return <h2 id={id} className="text-xs font-bold uppercase tracking-[.05em] text-ink">{children}</h2>
}

function Expandable({ children, lines = 2 }) {
  const [open, setOpen] = useState(false)
  const clamp = lines === 2 ? 'line-clamp-2' : 'line-clamp-4'
  return (
    <>
      <div className={open ? '' : clamp}>{children}</div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring-light mt-1 inline-flex items-center gap-1 rounded text-[13px] font-medium text-[#3346C4] underline underline-offset-2"
      >
        {open ? 'Show less' : 'Show more'}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </>
  )
}

function CriteriaList({ items, type }) {
  const [all, setAll] = useState(false)
  const shown = all ? items : items.slice(0, 4)
  const Icon = type === 'in' ? CheckCircle : XCircle
  return (
    <>
      <ul className="mt-2 space-y-2">
        {shown.map((c) => (
          <li key={c} className="flex gap-2.5 text-[13px] leading-relaxed text-[#4A5068]">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${type === 'in' ? 'text-[#1E9A5E]' : 'text-[#C2412D]'}`} />
            <span><span className="sr-only">{type === 'in' ? 'Required: ' : 'Not eligible if: '}</span>{c}</span>
          </li>
        ))}
      </ul>
      {items.length > 4 && (
        <button type="button" onClick={() => setAll((a) => !a)} aria-expanded={all} className="focus-ring-light mt-2 rounded text-[13px] font-medium text-[#3346C4] underline underline-offset-2">
          {all ? 'See fewer' : `See ${items.length - 4} more`}
        </button>
      )}
    </>
  )
}

function Timeline({ steps }) {
  const icons = { clipboard: ClipboardIcon, users: UsersIcon, calendar: CalendarIcon }
  return (
    <ol className="mt-3 grid gap-4 rounded-xl bg-[#F5F6F8] p-4 sm:grid-cols-3 sm:gap-3 sm:p-5">
      {steps.map((s, i) => {
        const Icon = icons[s.icon]
        return (
          <li key={s.label} className="relative">
            <div className="flex items-center gap-2 sm:flex-col sm:items-start">
              <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-navy shadow-sm ring-1 ring-line">
                <Icon className="h-4 w-4" />
              </span>
              {i < steps.length - 1 && <span aria-hidden="true" className="absolute left-8 right-[-12px] top-4 hidden h-px bg-[#D6D8E4] sm:block" />}
              <span className="text-[11px] font-medium text-muted sm:mt-2">Step {i + 1} · {s.duration}</span>
            </div>
            <div className="mt-2 rounded-lg bg-white p-3 shadow-sm ring-1 ring-line">
              <h3 className="text-[13px] font-semibold text-ink">{s.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function downloadIcs(trial) {
  const start = new Date(Date.now() + 3 * 864e5)
  const d = start.toISOString().slice(0, 10).replace(/-/g, '')
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Trial Nexus//EN', 'BEGIN:VEVENT',
    `UID:trial-${trial.id}-${Date.now()}@trialnexus`, `DTSTART;VALUE=DATE:${d}`,
    `SUMMARY:Follow up on clinical trial`, `DESCRIPTION:${trial.title.replace(/[,;]/g, ' ')} - ${window.location.href}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = `trial-${trial.id}.ics`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function TrialDetailPage() {
  const { id } = useParams()
  const trial = trials.find((t) => String(t.id) === id)
  const detail = useMemo(() => (trial ? getTrialDetail(trial) : null), [trial])
  const [tab, setTab] = useState('ai')
  const [searchParams] = useSearchParams()
  // ?check=1 (from the "Eligibility required" tag) opens the quiz straight away
  const [quizOpen, setQuizOpen] = useState(() => searchParams.get('check') === '1')
  const [answers, setAnswers] = useState({})
  const [saved, setSaved] = useState(() => readSaved().includes(Number(id)))
  const [shareMsg, setShareMsg] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (!trial) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="light" />
        <main className="mx-auto max-w-page px-5 py-24 text-center sm:px-8">
          <h1 className="text-2xl font-semibold text-ink">Trial not found</h1>
          <p className="mt-2 text-muted">This trial may have closed or the link may be wrong.</p>
          <Link to="/trials" className="focus-ring-light mt-6 inline-flex min-h-[44px] items-center rounded-full bg-navy px-6 text-sm font-semibold text-white">Browse all trials</Link>
        </main>
      </div>
    )
  }

  const toggleSave = () => {
    const list = new Set(readSaved())
    saved ? list.delete(trial.id) : list.add(trial.id)
    try { localStorage.setItem(SAVED_KEY, JSON.stringify([...list])) } catch { /* storage unavailable */ }
    setSaved(!saved)
  }
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: trial.title, url: window.location.href }); return }
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg('Link copied')
    } catch { setShareMsg('Copy the link from the address bar') }
    setTimeout(() => setShareMsg(''), 2500)
  }

  const facts = [
    { label: 'Study type', value: trial.type === 'Interventional' ? 'Intervention' : trial.type },
    { label: 'Phase', value: `Phase ${trial.phase} · ${phaseLabel[trial.phase].split(' (')[0]}` },
    { label: 'Compensation', value: trial.paid ? 'Paid' : 'Not Listed' },
  ]

  return (
    <div id="top" className="min-h-screen bg-white">
      <Navbar variant="light" search={<HeaderSearch condition={trial.condition} location={trial.city} />} />

      <div className="mx-auto max-w-page px-5 pb-20 pt-6 sm:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink">
            <li><Link to="/" className="focus-ring-light rounded hover:underline">Search</Link></li>
            <li aria-hidden="true"><ChevronDown className="h-3 w-3 -rotate-90 text-[#9A9FAE]" /></li>
            <li><Link to={`/trials?condition=${encodeURIComponent(trial.condition)}`} className="focus-ring-light rounded hover:underline">{trial.condition}</Link></li>
            <li aria-hidden="true"><ChevronDown className="h-3 w-3 -rotate-90 text-[#9A9FAE]" /></li>
            <li><span aria-current="page" className="text-muted">{detail.code}</span></li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0">
            <h1 className="text-xl font-semibold leading-snug tracking-tight text-navy sm:text-[22px]">{trial.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#4A5068]">{detail.howItWorks}</p>

            {/* AI Summaries / Full Post */}
            <div role="tablist" aria-label="Summary type" className="mt-5 inline-flex rounded-full bg-[#EEEFF2] p-1">
              {[['ai', 'AI Summaries'], ['full', 'Full Post']].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  id={`tab-${k}`}
                  aria-selected={tab === k}
                  aria-controls={`panel-${k}`}
                  onClick={() => setTab(k)}
                  className={`focus-ring-light inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-5 text-[13px] font-medium transition ${tab === k ? 'bg-navy text-white' : 'text-ink hover:bg-white/70'}`}
                >
                  {k === 'ai' && <SparkleIcon className="h-3.5 w-3.5 text-[#B8A6FF]" />}{label}
                </button>
              ))}
            </div>

            {/* See If You Qualify */}
            <div className="mt-5">
              <QualifyCard
                answers={answers}
                total={detail.keyRequirements.length}
                onStart={() => setQuizOpen(true)}
                onRetake={() => { setAnswers({}); setQuizOpen(true) }}
                similarHref={`/trials?condition=${encodeURIComponent(trial.condition)}&location=${encodeURIComponent(trial.city)}`}
                consultHref="#sites"
              />
            </div>

            {tab === 'ai' ? (
              <div id="panel-ai" role="tabpanel" aria-labelledby="tab-ai">
                <section aria-labelledby="keyreq-h" className="mt-6 rounded-2xl bg-gradient-to-br from-[#BFD3F5] via-[#D9D3F7] to-[#F3D3E6] p-[4px]">
                  <div className="rounded-[12px] bg-white p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 id="keyreq-h" className="text-[17px] font-semibold text-ink">Key requirements for this trial</h2>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                        <SparkleIcon className="h-3.5 w-3.5 text-[#E3A008]" />AI Summary
                      </span>
                    </div>
                    <ul className="mt-4 space-y-3.5">
                      {detail.keyRequirements.map((r) => (
                        <li key={r} className="flex gap-3 text-sm leading-relaxed text-navy">
                          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1E9A5E]" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
                <p className="mt-2 text-center text-xs text-muted">Reviewed against the official clinical trial record. Always confirm details with the study team.</p>
              </div>
            ) : (
              <section id="panel-full" role="tabpanel" aria-labelledby="tab-full" className="mt-6 space-y-3 rounded-xl border border-line p-5 text-sm leading-relaxed text-[#4A5068]">
                {detail.fullPost.map((p) => <p key={p}>{p}</p>)}
              </section>
            )}

            {/* Fact tiles */}
            <ul className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-[#F5F6F8] p-3 sm:grid-cols-3">
              {facts.map((f) => (
                <li key={f.label} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-line">
                  <FlaskIcon className="h-5 w-5 text-[#3346C4]" />
                  <p className="mt-6 text-xs text-muted">{f.label}:</p>
                  <p className="text-[13px] font-semibold text-ink">{f.value}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-8">
              <section aria-labelledby="how-h">
                <SectionHeading id="how-h">How this study works</SectionHeading>
                <div className="mt-2 text-[13px] leading-relaxed text-[#4A5068]">
                  <Expandable>
                    <p>{detail.howItWorks}</p>
                    <p className="mt-2">{detail.fullPost[2]}</p>
                  </Expandable>
                </div>
              </section>

              <section aria-labelledby="fit-h" id="eligibility">
                <SectionHeading id="fit-h">Are you a good fit for this trial?</SectionHeading>
                <p className="mt-2 text-[13px] leading-relaxed text-[#4A5068]">{detail.goodFit}</p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-[13px] font-semibold text-ink">Inclusion criteria</h3>
                    <CriteriaList items={detail.inclusion} type="in" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-ink">Exclusion criteria</h3>
                    <CriteriaList items={detail.exclusion} type="out" />
                  </div>
                </div>
              </section>

              <section aria-labelledby="timeline-h">
                <SectionHeading id="timeline-h">Timeline for a trial participant</SectionHeading>
                <Timeline steps={detail.timeline} />
              </section>

              <section aria-labelledby="treat-h">
                <SectionHeading id="treat-h">What is being tested?</SectionHeading>
                <p className="mt-2 text-[13px] leading-relaxed text-[#4A5068]">
                  Treatment: <span className="font-semibold text-ink">{detail.code}</span>{trial.placebo && ' or placebo'}. {detail.groups.length > 1 ? `People are placed into ${detail.groups.length} groups by chance.` : 'All participants are in one group.'}
                </p>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {detail.groups.map((g) => (
                    <li key={g.name} className="rounded-lg border border-line p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[13px] font-semibold text-ink">{g.name}</h3>
                        <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${g.kind === 'Experimental' ? 'bg-[#EEF2FC] text-navy' : 'bg-[#F0F1F4] text-[#5A5F6E]'}`}>{g.kind}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[#4A5068]">{g.text}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="sites-h" id="sites" className="scroll-mt-6">
                <SectionHeading id="sites-h">Find a clinic near you</SectionHeading>
                <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
                  {detail.sites.map((s) => (
                    <li key={s.name} className="flex flex-wrap items-center justify-between gap-2 p-4">
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{s.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><PinIcon className="h-3.5 w-3.5" />{s.city}{s.miles ? ` · ${s.miles} mi away` : ''}</p>
                      </div>
                      <span className={`rounded px-2 py-1 text-[11px] font-medium ${s.recruiting ? 'bg-mint-bg text-mint-fg' : 'bg-[#F0F1F4] text-[#5A5F6E]'}`}>
                        {s.recruiting ? 'Recruiting' : 'Not yet recruiting'}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="team-h">
                <SectionHeading id="team-h">Who is running this trial?</SectionHeading>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-line p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EEF2FC] text-xs font-semibold text-navy" aria-hidden="true">PI</span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{detail.investigator.name}</p>
                      <p className="text-xs text-muted">{detail.investigator.role}, {detail.investigator.org}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-line p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-white" aria-hidden="true">{detail.sponsor.initials}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{detail.sponsor.name}</p>
                      <p className="text-xs text-muted">Lead Sponsor</p>
                    </div>
                  </div>
                </div>
              </section>

              <section aria-labelledby="faq-h">
                <SectionHeading id="faq-h">What you need to know before you apply</SectionHeading>
                <ul className="mt-3 space-y-2">
                  {detail.faq.map((f) => <FaqItem key={f.q} {...f} />)}
                </ul>
              </section>
            </div>

            {/* Bottom CTA */}
            <section aria-label="Find more trials" className="navy-surface mt-10 flex flex-col gap-4 rounded-xl p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Tell us about your health. We'll match you with the right clinical trial.</p>
                <p className="mt-1 text-xs text-white/70">We match you with clinical trials designed for people like you.</p>
              </div>
              <Link to="/#search" className="focus-ring inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-white/80 px-5 text-sm font-semibold text-white hover:bg-white/10">
                <SparkleIcon className="h-4 w-4 text-[#B8A6FF]" />Find My Trial
              </Link>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Trial summary">
            <section aria-labelledby="basic-h" className="rounded-xl border border-line p-4">
              <h2 id="basic-h" className="text-[15px] font-semibold text-ink">Basic Requirement</h2>
              <dl className="mt-3 divide-y divide-line text-[13px]">
                {detail.basics.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="text-[#4A5068]">{k}</dt>
                    <dd className="font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 space-y-2">
                <button type="button" onClick={() => downloadIcs(trial)} className="focus-ring-light flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-navy text-[13px] font-semibold text-white hover:bg-navy-800">
                  <CalendarIcon className="h-4 w-4" />Add to Calendar
                </button>
                <button type="button" onClick={toggleSave} aria-pressed={saved} className="focus-ring-light flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-[#F0F1F4] text-[13px] font-medium text-ink hover:bg-[#E5E7EC]">
                  <HeartIcon className={`h-4 w-4 ${saved ? 'text-[#D64545]' : 'text-[#5A5F6E]'}`} />{saved ? 'Saved' : 'Save'}
                </button>
                <button type="button" onClick={share} className="focus-ring-light flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-[#F0F1F4] text-[13px] font-medium text-ink hover:bg-[#E5E7EC]">
                  <ShareIcon className="h-4 w-4" />Share
                </button>
                <p className="h-4 text-center text-xs text-mint-fg" aria-live="polite">{shareMsg}</p>
              </div>
            </section>

            <section aria-labelledby="org-h" className="rounded-xl border border-line p-4">
              <h2 id="org-h" className="text-[15px] font-semibold text-ink">Clinical trial organized by</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-sm font-semibold text-white" aria-hidden="true">{detail.sponsor.initials}</span>
                <p className="text-[13px] font-semibold text-ink underline underline-offset-2">{detail.sponsor.name}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{detail.sponsor.blurb}</p>
            </section>

            <Link to={`/trials?condition=${encodeURIComponent(trial.condition)}&location=${encodeURIComponent(trial.city)}`} className="focus-ring-light block rounded text-center text-[13px] text-ink underline underline-offset-2 hover:text-navy-800">
              Back to {trial.condition.toLowerCase()} trials near {trial.city}
            </Link>
          </aside>
        </div>
      </div>

      {quizOpen && (
        <EligibilityQuiz
          requirements={detail.keyRequirements}
          onClose={() => setQuizOpen(false)}
          initialAnswers={answers}
          onProgress={setAnswers}
          onDone={setAnswers}
        />
      )}
      <Footer data={footer} />
    </div>
  )
}
