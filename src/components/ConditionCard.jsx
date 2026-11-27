import { Link } from 'react-router-dom'
import { ArrowUpRight } from './Icons.jsx'

export default function ConditionCard({ title, query, subs, count, badge }) {
  return (
    <article className="group relative flex min-h-[200px] flex-col rounded-2xl border border-line bg-white p-4 transition duration-200 hover:-translate-y-1 hover:bg-[linear-gradient(180deg,#FFFFFF_0%,#EEEEFA_100%)] hover:shadow-card focus-within:-translate-y-1 focus-within:shadow-card">
      <h3 className="text-lg font-semibold leading-tight text-navy">{title}</h3>
      <p className="mt-1 text-[13px] leading-snug text-muted">{subs}</p>
      <div className="mt-auto pt-6">
        {badge && (
          <span className="mb-2 inline-block rounded-full bg-mint-bg px-2.5 py-1 text-[10px] font-semibold tracking-wide text-mint-fg">{badge}</span>
        )}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-2xl font-semibold leading-none text-navy">{count}</p>
            <p className="mt-1 text-xs text-muted">Trials Available</p>
          </div>
          <Link
            to={`/trials?condition=${encodeURIComponent(query || title)}`}
            aria-label={`View ${title} trials`}
            className="focus-ring-light grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-navy transition group-hover:border-navy/20 hover:bg-navy hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
