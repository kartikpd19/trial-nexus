import { Link } from 'react-router-dom'
import { ArrowRight, CloseIcon, FlaskIcon, PinIcon } from './Icons.jsx'
import { phaseLabel } from '../trials.js'

// Compact row used in the map view's left list.
export function MapListItem({ trial, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`block w-full border-b border-line px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy/40 ${
        selected ? 'bg-[#EEF2FC]' : 'bg-white hover:bg-[#F7F8FA]'
      }`}
    >
      <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{trial.title}</span>
      <span className="mt-1.5 flex items-center gap-1 text-[13px] text-[#4A5068]"><PinIcon className="h-3.5 w-3.5" />{trial.city}</span>
      <span className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{trial.summary}</span>
      <span className="mt-2 block text-[13px] text-ink">{trial.participants} Participants Needed</span>
    </button>
  )
}

// Detail card that floats over the map, with arrows to step through trials at one location.
export function MapDetailCard({ trial, index, total, onPrev, onNext, onClose }) {
  const chip = 'rounded-full bg-[#F0F1F4] px-2.5 py-1 text-xs font-medium text-ink'
  return (
    <div className="pointer-events-auto w-full sm:w-[340px]">
      <article aria-labelledby="map-card-title" aria-live="polite" className="relative rounded-xl bg-white p-5 shadow-[0_16px_40px_-12px_rgba(2,27,58,.35)] ring-1 ring-black/5">
        <button type="button" onClick={onClose} aria-label="Close trial details" className="focus-ring-light absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full text-navy hover:bg-[#F0F1F4]">
          <CloseIcon className="h-4 w-4" />
        </button>
        <h2 id="map-card-title" className="pr-8 text-[17px] font-semibold leading-snug text-navy">{trial.title}</h2>
        <p className="mt-2 flex items-center gap-1 text-[13px] text-ink"><PinIcon className="h-3.5 w-3.5" />{trial.city}</p>
        <p className="mt-2.5 line-clamp-4 text-[13px] leading-relaxed text-[#4A5068]">{trial.summary}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink"><FlaskIcon className="h-4 w-4 text-navy" />{phaseLabel[trial.phase]}</p>
        <p className="mt-4 text-xs text-muted">Trial Details</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          <li className={chip}>Age: {trial.age}</li>
          <li className={chip}>Sex: {trial.sex}</li>
          <li className={chip}>Phase {trial.phase}</li>
          {trial.paid && <li className={chip}>Paid</li>}
        </ul>
        <p className="mt-4 text-center text-xs text-muted">{trial.participants} Participants Needed</p>
        <Link to={`/trials/${trial.id}`} className="focus-ring-light mt-2 flex min-h-[48px] items-center justify-center rounded-xl bg-navy text-[15px] font-semibold text-white transition hover:bg-navy-800">
          Learn More
        </Link>
      </article>
      {total > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button type="button" onClick={onPrev} aria-label="Previous trial at this location" className="focus-ring-light grid h-10 w-10 place-items-center rounded-lg bg-white text-navy shadow ring-1 ring-black/5 hover:bg-[#F0F1F4]">
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <span className="rounded-md bg-white px-2 py-1 text-xs text-ink shadow ring-1 ring-black/5">{index + 1} / {total}</span>
          <button type="button" onClick={onNext} aria-label="Next trial at this location" className="focus-ring-light grid h-10 w-10 place-items-center rounded-lg bg-white text-navy shadow ring-1 ring-black/5 hover:bg-[#F0F1F4]">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
