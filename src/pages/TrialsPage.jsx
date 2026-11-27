import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import FilterSidebar from '../components/FilterSidebar.jsx'
import SignupBanner from '../components/SignupBanner.jsx'
import TrialCard from '../components/TrialCard.jsx'
import HeaderSearch from '../components/HeaderSearch.jsx'
import TrialMap from '../components/TrialMap.jsx'
import { MapDetailCard, MapListItem } from '../components/MapTrialCard.jsx'
import { ChevronDown, CloseIcon, FilterIcon, GridIcon, ListIcon } from '../components/Icons.jsx'
import { conditionTaxonomy, footer } from '../data.js'
import { cityCoords, matchStrength, milesBetween, trials } from '../trials.js'

const PAGE = 8
const RADIUS_MILES = 40
const emptyFilters = { keywords: [], phases: [], types: [], statuses: [], compensation: [] }
const trialCities = [...new Set(trials.map((t) => t.city))].sort()

const TrialsIcon = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 006.2 21.5h11.6a2 2 0 001.7-3L14 9V3" /></svg>)
const MapIcon = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5z" /><path d="M9 4v13M15 6.5v13" /></svg>)

function PillSelect({ id, label, value, onChange, children }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring-light h-9 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-[13px] font-medium text-ink hover:border-[#C9CCD6]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
    </div>
  )
}

function ViewToggle({ view, setView }) {
  const btn = (v, Icon, label) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => setView(v)}
      className={`focus-ring-light inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
        view === v ? 'bg-white text-ink shadow-sm ring-1 ring-line' : 'text-[#9A9FAE] hover:text-ink'
      }`}
    >
      <Icon className="h-4 w-4" />{label}
    </button>
  )
  return (
    <div role="group" aria-label="Results layout" className="inline-flex gap-1 rounded-lg bg-[#F0F1F4] p-1">
      {btn('list', ListIcon, 'List')}
      {btn('grid', GridIcon, 'Grid')}
    </div>
  )
}

function ModeTabs({ mode, setMode }) {
  const tab = (m, Icon, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => setMode(m)}
      className={`focus-ring-light inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-lg border text-sm font-medium transition ${
        mode === m ? 'border-navy/40 bg-[#E8ECF5] text-navy shadow-[0_0_0_3px_rgba(2,27,58,.08)]' : 'border-line bg-white text-ink hover:border-[#C9CCD6]'
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />{label}
    </button>
  )
  return (
    <div role="tablist" aria-label="Results view" className="flex gap-3">
      {tab('list', TrialsIcon, 'All Trials')}
      {tab('map', MapIcon, 'Map')}
    </div>
  )
}

function Breadcrumb({ condition, location }) {
  const parts = [{ label: 'Search', to: '/' }]
  if (condition) parts.push({ label: condition, to: `/trials?condition=${encodeURIComponent(condition)}` })
  if (location) parts.push({ label: location })
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronDown className="h-3 w-3 -rotate-90 text-[#9A9FAE]" />}
            {p.to && i < parts.length - 1 ? (
              <Link to={p.to} className="focus-ring-light rounded hover:underline">{p.label}</Link>
            ) : (
              <span aria-current="page">{p.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function TrialsPage() {
  const [params, setParams] = useSearchParams()
  const condition = params.get('condition') || ''
  const sub = params.get('sub') || ''
  const location = params.get('location') || ''
  const view = params.get('view') === 'grid' ? 'grid' : 'list'
  const mode = params.get('mode') === 'map' ? 'map' : 'list'

  const [filters, setFilters] = useState(emptyFilters)
  const [shown, setShown] = useState(PAGE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    if (key === 'condition') next.delete('sub')
    setParams(next, { replace: true })
  }

  const origin = cityCoords[location]
  const results = useMemo(() => {
    const kws = filters.keywords.map((k) => k.toLowerCase())
    const nearMe = location === 'Near me'
    return trials
      .map((t) => ({ ...t, distance: origin && cityCoords[t.city] ? milesBetween(origin, cityCoords[t.city]) : null }))
      .filter((t) => !condition || t.condition.toLowerCase() === condition.toLowerCase() || t.subCondition.toLowerCase().includes(condition.toLowerCase()))
      .filter((t) => !location || nearMe || (origin ? t.distance != null && t.distance <= RADIUS_MILES : t.city === location))
      .filter((t) => !filters.phases.length || filters.phases.includes(t.phase))
      .filter((t) => !filters.types.length || filters.types.includes(t.type))
      .filter((t) => !filters.statuses.length || filters.statuses.includes(t.status))
      .filter((t) => !filters.compensation.length || t.paid)
      .filter((t) => kws.every((k) => `${t.title} ${t.summary} ${t.subCondition}`.toLowerCase().includes(k)))
      // Exact sub-condition matches first, then closest, then newest
      .sort((a, b) => (b.subCondition === sub) - (a.subCondition === sub) || (a.distance ?? 0) - (b.distance ?? 0) || a.postedDaysAgo - b.postedDaysAgo)
  }, [condition, sub, location, origin, filters])

  useEffect(() => setShown(PAGE), [condition, sub, location, filters])
  useEffect(() => { window.scrollTo(0, 0) }, [mode])
  useEffect(() => { if (selectedId && !results.some((t) => t.id === selectedId)) setSelectedId(null) }, [results, selectedId])

  const selected = results.find((t) => t.id === selectedId)
  const cityTrials = selected ? results.filter((t) => t.city === selected.city) : []
  const cityIndex = selected ? cityTrials.findIndex((t) => t.id === selected.id) : -1
  const step = (d) => setSelectedId(cityTrials[(cityIndex + d + cityTrials.length) % cityTrials.length].id)

  const activeCount = Object.values(filters).reduce((n, v) => n + v.length, 0)
  const topic = sub || condition
  const place = location === 'Near me' ? ' near you' : location ? ` near ${location}` : ''
  const heading = `${results.length} ${topic ? `${topic} ` : 'Clinical '}${results.length === 1 ? 'Trial' : 'Trials'}${place}`
  const phaseValue = filters.phases.length === 1 ? String(filters.phases[0]) : filters.phases.length ? 'multi' : ''
  const clearAll = () => setFilters(emptyFilters)
  const headerSearch = <HeaderSearch condition={condition} location={location} />

  const toolbarSelects = (
    <>
      <PillSelect id="tb-condition" label="Condition" value={condition} onChange={(v) => setParam('condition', v)}>
        <option value="">All conditions</option>
        {Object.keys(conditionTaxonomy).map((c) => <option key={c} value={c}>{c}</option>)}
        {condition && !conditionTaxonomy[condition] && <option value={condition}>{condition}</option>}
      </PillSelect>
      <PillSelect id="tb-location" label="Location" value={location} onChange={(v) => setParam('location', v)}>
        <option value="">Any location</option>
        <option value="Near me">Near me</option>
        {trialCities.map((c) => <option key={c} value={c}>{c}</option>)}
        {location && location !== 'Near me' && !trialCities.includes(location) && <option value={location}>{location}</option>}
      </PillSelect>
      <PillSelect
        id="tb-phase"
        label="Phase"
        value={phaseValue}
        onChange={(v) => setFilters((f) => ({ ...f, phases: v && v !== 'multi' ? [Number(v)] : v === 'multi' ? f.phases : [] }))}
      >
        <option value="">Phase</option>
        {[1, 2, 3, 4].map((p) => <option key={p} value={p}>Phase {p}</option>)}
        {phaseValue === 'multi' && <option value="multi">{filters.phases.length} phases</option>}
      </PillSelect>
    </>
  )

  const emptyState = (
    <div className="rounded-xl border border-dashed border-[#C9CCD6] bg-white px-6 py-12 text-center">
      <p className="text-base font-semibold text-ink">No trials match these filters</p>
      <p className="mt-1 text-sm text-muted">Try a nearby location, a broader condition, or fewer filters.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {activeCount > 0 && <button type="button" onClick={clearAll} className="focus-ring-light min-h-[40px] rounded-full border border-line px-4 text-sm font-medium text-ink hover:border-ink/40">Clear filters</button>}
        {location && <button type="button" onClick={() => setParam('location', '')} className="focus-ring-light min-h-[40px] rounded-full border border-line px-4 text-sm font-medium text-ink hover:border-ink/40">Any location</button>}
        <Link to="/" className="focus-ring-light inline-flex min-h-[40px] items-center rounded-full bg-navy px-4 text-sm font-semibold text-white">New search</Link>
      </div>
    </div>
  )

  // Filters as a slide-over drawer (map view and small screens)
  const drawer = filtersOpen && (
    <div className="fixed inset-0 z-[1200] flex" role="dialog" aria-modal="true" aria-label="Filters">
      <button type="button" aria-label="Close filters" className="absolute inset-0 bg-navy/40" onClick={() => setFiltersOpen(false)} />
      <div className="relative h-full w-[300px] max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl">
        <div className="mb-3 flex justify-end">
          <button type="button" autoFocus onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="focus-ring-light grid h-9 w-9 place-items-center rounded-full hover:bg-[#F0F1F4]">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <FilterSidebar filters={filters} setFilters={setFilters} onClearAll={clearAll} />
      </div>
    </div>
  )

  const filtersButton = (extra = '') => (
    <button
      type="button"
      onClick={() => setFiltersOpen(true)}
      aria-haspopup="dialog"
      className={`focus-ring-light inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-medium text-ink hover:border-[#C9CCD6] ${extra}`}
    >
      <FilterIcon className="h-4 w-4" />Filters{activeCount ? ` (${activeCount})` : ''}
    </button>
  )

  /* ---------------- MAP MODE ---------------- */
  if (mode === 'map') {
    return (
      <div id="top" className="flex h-[100dvh] flex-col bg-white">
        <Navbar variant="light" search={headerSearch} />
        <div className="border-b border-line px-5 pb-4 pt-4 sm:px-8">
          <Breadcrumb condition={condition} location={location} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {filtersButton('md:w-[300px]')}
            <ModeTabs mode={mode} setMode={(m) => setParam('mode', m === 'map' ? 'map' : '')} />
            <p className="ml-auto text-sm text-muted" aria-live="polite">{heading}</p>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1">
          <div className="nice-scroll hidden w-[340px] shrink-0 overflow-y-auto border-r border-line md:block">
            <h1 className="sr-only">{heading}</h1>
            {results.length ? (
              <ul>
                {results.map((t) => (
                  <li key={t.id}><MapListItem trial={t} selected={t.id === selectedId} onSelect={() => setSelectedId(t.id)} /></li>
                ))}
              </ul>
            ) : <div className="p-4">{emptyState}</div>}
          </div>
          <div className="relative min-w-0 flex-1">
            <TrialMap
              trials={results}
              selectedCity={selected?.city}
              center={origin}
              onSelectCity={(city) => setSelectedId(results.find((t) => t.city === city)?.id ?? null)}
            />
            {selected && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-4">
                <MapDetailCard
                  trial={selected}
                  index={cityIndex}
                  total={cityTrials.length}
                  onPrev={() => step(-1)}
                  onNext={() => step(1)}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            )}
          </div>
        </div>
        {drawer}
      </div>
    )
  }

  /* ---------------- LIST / GRID MODE ---------------- */
  return (
    <div id="top" className="min-h-screen bg-white">
      <Navbar variant="light" search={headerSearch} />

      <div className="mx-auto max-w-page px-5 pb-20 pt-6 sm:px-8">
        <div className="mb-4 md:hidden">{headerSearch}</div>
        <Breadcrumb condition={condition} location={location} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {filtersButton('lg:hidden')}
          <ModeTabs mode={mode} setMode={(m) => setParam('mode', m === 'map' ? 'map' : '')} />
        </div>

        <div className="mt-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Filters" className="hidden lg:sticky lg:top-6 lg:block lg:self-start lg:border-r lg:border-line lg:pr-6">
            <FilterSidebar filters={filters} setFilters={setFilters} onClearAll={clearAll} />
          </aside>

          <main>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]" aria-live="polite">{heading}</h1>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted">
              Browse studies that are recruiting{place || ' across the U.S.'}, compare what each one involves, and save the ones you want to talk through with your doctor.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">{toolbarSelects}</div>
              <ViewToggle view={view} setView={(v) => setParam('view', v === 'grid' ? 'grid' : '')} />
            </div>

            {sub && (
              <p className="mt-3 inline-flex items-center gap-1 rounded-md border border-[#C9D3F0] bg-[#EEF2FC] py-0.5 pl-2 pr-0.5 text-xs text-navy">
                Sub-condition: {sub}
                <button type="button" aria-label={`Remove sub-condition ${sub}`} onClick={() => setParam('sub', '')} className="focus-ring-light grid h-6 w-6 place-items-center rounded hover:bg-white">
                  <CloseIcon className="h-3 w-3" />
                </button>
              </p>
            )}

            <div className="mt-5"><SignupBanner /></div>

            {results.length ? (
              <>
                <ul className={`mt-5 grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {results.slice(0, shown).map((t) => (
                    <li key={t.id}><TrialCard trial={t} view={view} match={matchStrength(t, { condition, sub, distance: t.distance })} /></li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col items-center gap-2">
                  {shown < results.length && (
                    <button
                      type="button"
                      onClick={() => setShown((s) => s + PAGE)}
                      className="focus-ring-light inline-flex min-h-[44px] items-center rounded-full bg-navy px-6 text-sm font-semibold text-white transition hover:bg-navy-800"
                    >
                      Load More
                    </button>
                  )}
                  <p className="text-xs text-muted">Showing {Math.min(shown, results.length)} of {results.length}</p>
                </div>
              </>
            ) : <div className="mt-6">{emptyState}</div>}
          </main>
        </div>
      </div>

      {drawer}
      <Footer data={footer} />
    </div>
  )
}
