import { useState } from 'react'
import { CloseIcon, InfoIcon, SearchIcon } from './Icons.jsx'

export const filterGroups = [
  { key: 'phases', title: 'Trial Phase', info: 'Phases describe how far along a treatment is in testing, from first safety studies (Phase 1) to studies after approval (Phase 4).', options: [1, 2, 3, 4].map((p) => ({ value: p, label: `Phase 0${p}` })) },
  { key: 'types', title: 'Trial Type', info: 'Interventional trials test a treatment. Observational studies follow people without changing their care.', options: ['Interventional', 'Observational', 'Others'].map((v) => ({ value: v, label: v })) },
  { key: 'statuses', title: 'Recruitment Status', info: 'Whether the study is currently enrolling volunteers.', options: ['Recruiting', 'Not Recruiting', 'Upcoming'].map((v) => ({ value: v, label: v })) },
  { key: 'compensation', title: 'Compensation', info: 'Studies that pay participants for their time or travel.', options: [{ value: 'Paid', label: 'Paid' }] },
]

function InfoTip({ id, text }) {
  return (
    <span className="group relative inline-flex">
      <button type="button" aria-describedby={id} className="focus-ring-light grid h-5 w-5 place-items-center rounded-full text-navy">
        <InfoIcon className="h-4 w-4" />
        <span className="sr-only">More info</span>
      </button>
      <span id={id} role="tooltip" className="pointer-events-none invisible absolute left-6 top-1/2 z-20 w-56 -translate-y-1/2 rounded-lg bg-navy px-3 py-2 text-xs normal-case leading-snug tracking-normal text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  )
}

const Heading = ({ id, children, info }) => (
  <div className="flex items-center gap-1.5">
    <h3 id={id} className="text-[11px] font-medium uppercase tracking-[.06em] text-[#6B7591]">{children}</h3>
    {info && <InfoTip id={`${id}-tip`} text={info} />}
  </div>
)

export default function FilterSidebar({ filters, setFilters, onClearAll }) {
  const [kw, setKw] = useState('')
  const addKeyword = (e) => {
    e.preventDefault()
    const v = kw.trim()
    if (v && !filters.keywords.includes(v)) setFilters((f) => ({ ...f, keywords: [...f.keywords, v] }))
    setKw('')
  }
  const toggle = (key, value) =>
    setFilters((f) => {
      const set = new Set(f[key])
      set.has(value) ? set.delete(value) : set.add(value)
      return { ...f, [key]: [...set] }
    })

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Filter</h2>
        <button type="button" onClick={onClearAll} className="focus-ring-light rounded px-1 text-xs text-ink hover:underline">Clear all</button>
      </div>

      <section aria-labelledby="f-keywords" className="mt-5 border-b border-line pb-4">
        <Heading id="f-keywords" info="Add words to look for in trial titles and descriptions. Press Enter to add each one.">Keywords</Heading>
        <form onSubmit={addKeyword} className="relative mt-2.5" role="search" aria-label="Filter by keyword">
          <label htmlFor="kw-input" className="sr-only">Add a keyword</label>
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
          <input
            id="kw-input"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder='e.g. "blood pressure"'
            className="h-10 w-full rounded-md border border-[#DCDEE5] bg-white pl-8 pr-2 text-base text-ink placeholder:text-[#9A9FAE] focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 md:text-[13px]"
          />
        </form>
        {filters.keywords.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Active keywords">
            {filters.keywords.map((k) => (
              <li key={k} className="inline-flex items-center gap-1 rounded-md border border-[#C9D3F0] bg-[#EEF2FC] py-0.5 pl-2 pr-0.5 text-xs text-navy">
                {k}
                <button
                  type="button"
                  aria-label={`Remove keyword ${k}`}
                  onClick={() => setFilters((f) => ({ ...f, keywords: f.keywords.filter((x) => x !== k) }))}
                  className="focus-ring-light grid h-6 w-6 place-items-center rounded hover:bg-white"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {filterGroups.map((g, i) => (
        <fieldset key={g.key} className={`py-4 ${i < filterGroups.length - 1 ? 'border-b border-line' : ''}`}>
          <legend className="contents">
            <Heading id={`f-${g.key}`} info={g.info}>{g.title}</Heading>
          </legend>
          <div className="mt-2.5 space-y-0.5">
            {g.options.map((o) => {
              const id = `f-${g.key}-${o.value}`
              return (
                <label key={o.value} htmlFor={id} className="flex min-h-[32px] cursor-pointer items-center gap-2.5 rounded text-[13px] text-ink">
                  <input
                    id={id}
                    type="checkbox"
                    checked={filters[g.key].includes(o.value)}
                    onChange={() => toggle(g.key, o.value)}
                    className="h-4 w-4 rounded border-[#C9CCD6] accent-navy"
                  />
                  {o.label}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
