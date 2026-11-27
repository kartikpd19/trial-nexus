import { Link } from 'react-router-dom'
import { LockIcon } from './Icons.jsx'

// Gauge colours per state
const tones = {
  locked: { fill: '#E3E1F2', badge: '#021B3A' },
  progress: { fill: '#1E9A6A', badge: '#1E7F5A' },
  pass: { fill: '#1E9A6A', badge: '#1E7F5A' },
  partial: { fill: '#F2D45C', badge: '#F5C518' },
  fail: { fill: '#D92D20', badge: '#8B0E0E' },
}
const EMPTY = '#E3E1F2'

// Point on a circle; angles run from 180° (left) to 0° (right) across the top.
const pt = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)]
const arc = (cx, cy, r, a1, a2) => {
  const [x1, y1] = pt(cx, cy, r, a1)
  const [x2, y2] = pt(cx, cy, r, a2)
  return `M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`
}

function SegmentGauge({ segments = 4, filled, state }) {
  const gap = 3 // degrees between segments
  const span = (180 - gap * (segments - 1)) / segments
  const tone = tones[state]
  return (
    <div className="relative h-[78px] w-[132px] shrink-0" aria-hidden="true">
      <svg viewBox="0 0 132 78" className="h-full w-full">
        {Array.from({ length: segments }, (_, i) => {
          const start = 180 - i * (span + gap)
          return <path key={i} d={arc(66, 70, 52, start, start - span)} fill="none" stroke={i < filled ? tone.fill : EMPTY} strokeWidth="18" />
        })}
      </svg>
      <span className="absolute bottom-0 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full text-white" style={{ background: tone.badge }}>
        {state === 'locked' ? (
          <LockIcon className="h-4 w-4" />
        ) : state === 'pass' || state === 'progress' ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12.5l4 4L18 8.5" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
        )}
      </span>
    </div>
  )
}

const StatusIcon = ({ ok }) =>
  ok ? (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-[#1E9A6A]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M8 12.5l2.8 2.8L16.5 9.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-[#D92D20]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v5.5M12 16.3v.2" strokeLinecap="round" /></svg>
  )

/** Works out which of the five card states to show from the quiz answers. */
export function qualifyState(answers, total) {
  const vals = Object.values(answers)
  const yes = vals.filter((v) => v === 'Yes').length
  if (!vals.length) return { state: 'locked', filled: 0 }
  if (vals.length < total) return { state: 'progress', filled: vals.length }
  if (yes === total) return { state: 'pass', filled: total }
  if (yes <= 1) return { state: 'fail', filled: 1 }
  return { state: 'partial', filled: yes }
}

export default function QualifyCard({ answers, total, onStart, onRetake, similarHref, consultHref = '#sites' }) {
  const { state, filled } = qualifyState(answers, total)

  const copy = {
    locked: { title: 'See If You Qualify', text: `Complete a quick quiz to confirm your eligibility. You'll need to meet ${total} core criteria for this trial.` },
    progress: { title: 'See If You Qualify', text: `You've answered ${filled} of ${total} questions. Finish the quiz to see if you meet the core criteria for this trial.` },
    pass: { title: 'You qualify for this trial', text: 'Great news. You meet the key criteria for this trial. The next step is to connect with the study team to confirm your spot.' },
    fail: { title: "You don't qualify for this trial", text: "Based on your answers, you don't meet core criteria for this trial. There may be other trials that are a better fit for you." },
    partial: { title: "You don't qualify for this trial", text: "Based on your answers, you don't meet one or more core criteria for this trial. There may be other trials that are a better fit for you." },
  }[state]

  const primary = 'focus-ring-light inline-flex min-h-[40px] items-center justify-center rounded-full bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800'
  const outline = 'focus-ring-light inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#D6D8E4] bg-white px-5 text-[13px] font-semibold text-navy hover:border-navy/40'

  return (
    <section aria-labelledby="qualify-h" aria-live="polite" className="flex flex-col-reverse gap-4 rounded-xl bg-[#F0F1F4] p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 id="qualify-h" className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          {(state === 'pass' || state === 'fail' || state === 'partial') && <StatusIcon ok={state === 'pass'} />}
          {copy.title}
        </h2>
        <p className="mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-[#4A5068]">{copy.text}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {state === 'locked' || state === 'progress' ? (
            <button type="button" onClick={onStart} className={primary}>Check Eligibility</button>
          ) : state === 'pass' ? (
            <a href={consultHref} className={outline}>Book Consultation</a>
          ) : (
            <Link to={similarHref} className={outline}>Find similar trials</Link>
          )}
          <span className="inline-flex items-center gap-1.5 text-[11px] text-ink">
            <LockIcon className="h-3 w-3" />Your answers stay on this device and are never shared without your consent.
          </span>
        </div>
        {(state === 'pass' || state === 'fail' || state === 'partial') && (
          <button type="button" onClick={onRetake} className="focus-ring-light mt-3 rounded text-xs text-muted underline underline-offset-2 hover:text-ink">
            Retake quiz
          </button>
        )}
      </div>
      <div className="self-center sm:self-start">
        <SegmentGauge segments={total} filled={filled} state={state} />
        <span className="sr-only">
          {state === 'locked' ? 'Eligibility not checked yet' : state === 'progress' ? `${filled} of ${total} questions answered` : `Matched ${Object.values(answers).filter((v) => v === 'Yes').length} of ${total} key requirements`}
        </span>
      </div>
    </section>
  )
}
