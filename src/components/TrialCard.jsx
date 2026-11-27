import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskIcon, PillIcon, PinFilled } from './Icons.jsx'
import { timeAgo } from '../trials.js'

const statusTone = {
  Recruiting: 'bg-[#1E7F5A] text-white',
  Upcoming: 'bg-[#B7791F] text-white',
  'Not Recruiting': 'bg-[#5A5F6E] text-white',
}

const matchDot = {
  Strong: 'bg-[#1E9A6A]',
  Good: 'bg-[#E3A008]',
  Possible: 'bg-[#9A9FAE]',
}

const matchHelp = {
  Strong: 'Strong match: this trial closely fits your condition and location.',
  Good: 'Good match: this trial fits your condition, with some differences.',
  Possible: 'Possible match: this trial is related to your search.',
}

const chip = 'inline-flex h-6 items-center rounded px-2 text-xs font-medium'

export default function TrialCard({ trial, view, match }) {
  const [expanded, setExpanded] = useState(false)
  const grid = view === 'grid'
  const titleId = `trial-${trial.id}-title`

  return (
    <article
      aria-labelledby={titleId}
      className="group relative flex h-full cursor-pointer flex-col rounded-xl border border-line bg-white p-4 transition hover:border-[#D6D8E4] hover:shadow-card focus-within:border-navy/40 focus-within:ring-2 focus-within:ring-navy/20 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${chip} ${statusTone[trial.status]}`}>{trial.status}</span>
        {match && (
          <span className={`${chip} gap-1.5 bg-[#F0F1F4] text-ink`} title={matchHelp[match]}>
            <span className={`h-2 w-2 rounded-full ${matchDot[match]}`} aria-hidden="true" />
            <span className="sr-only">Match strength: </span>{match}
          </span>
        )}
        {trial.extraCriteria && (
          <Link
            to={`/trials/${trial.id}?check=1`}
            className={`${chip} focus-ring-light relative z-10 bg-[#F0F1F4] text-ink hover:bg-[#E2E4EA]`}
            aria-label={`Eligibility required: check your eligibility for ${trial.title}`}
          >
            Eligibility required
          </Link>
        )}
      </div>

      <h2 id={titleId} className="mt-3 text-[15px] font-semibold leading-snug text-navy">
        {/* Stretched link: the ::after overlay makes the whole card clickable */}
        <Link
          to={`/trials/${trial.id}`}
          className="underline-offset-2 outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] group-hover:underline focus-visible:underline"
        >
          {trial.title}
        </Link>
      </h2>

      <p className={`mt-2 text-[13px] leading-relaxed text-muted ${expanded ? '' : grid ? 'line-clamp-4' : 'line-clamp-2'}`}>
        {trial.summary}
      </p>
      {grid && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="focus-ring-light relative z-10 mt-1 self-start rounded text-[13px] text-ink underline underline-offset-2 hover:text-navy-800"
        >
          {expanded ? 'view less' : 'view more'}
        </button>
      )}

      <div className="mt-auto pt-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-2.5 text-[13px] text-ink">
          <li className="inline-flex items-center gap-1.5"><PinFilled className="h-4 w-4" /><span className="sr-only">Location: </span>{trial.city}</li>
          <li className="inline-flex items-center gap-1.5"><FlaskIcon className="h-4 w-4" />Phase {trial.phase}</li>
          <li className="inline-flex basis-full items-center gap-1.5">
            <PillIcon className="h-4 w-4" />
            {trial.placebo ? 'Study treatment or a placebo.' : 'Everyone receives the study treatment.'}
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">{timeAgo(trial.postedDaysAgo)}</p>
      </div>
    </article>
  )
}
