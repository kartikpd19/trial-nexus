import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchDropdown, { EmptyNote, OptionRow } from './SearchDropdown.jsx'
import { CheckIcon, NavigateIcon, SearchIcon } from './Icons.jsx'
import { conditionTaxonomy, locations } from '../data.js'

const conditionNames = Object.keys(conditionTaxonomy)
const match = (s, q) => s.toLowerCase().includes(q.trim().toLowerCase())

function FieldTrigger({ id, label, value, placeholder, active, onOpen, disabled = false, disabledHint }) {
  return (
    <button
      type="button"
      id={`${id}-trigger`}
      aria-haspopup="dialog"
      aria-expanded={active}
      aria-controls={active ? `${id}-panel` : undefined}
      aria-describedby={disabled && disabledHint ? `${id}-hint` : undefined}
      disabled={disabled}
      onClick={onOpen}
      className={`flex w-full min-w-0 flex-col justify-center rounded-2xl px-5 py-2 text-left md:py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 disabled:cursor-not-allowed md:h-full md:rounded-full md:px-6 ${
        active ? 'bg-segment' : disabled ? '' : 'hover:bg-segment/60'
      }`}
    >
      <span className={`text-[10px] font-semibold uppercase leading-4 tracking-[.06em] ${disabled ? 'text-[#A7ACBA]' : 'text-ink'}`}>{label}</span>
      <span className={`mt-0.5 block w-full truncate text-[13px] leading-5 ${disabled ? 'text-[#BCC0CC]' : value ? 'text-[#4A5068]' : 'text-muted'}`}>{value || placeholder}</span>
      {disabled && disabledHint && <span id={`${id}-hint`} className="sr-only">{disabledHint}</span>}
    </button>
  )
}

const Divider = ({ hidden }) => (
  <span aria-hidden="true" className={`hidden w-px self-stretch bg-black/10 md:my-3 md:block ${hidden ? 'md:invisible' : ''}`} />
)

export default function HeroSearch({ values, setValues }) {
  const [open, setOpen] = useState(null) // 'condition' | 'sub' | 'location' | null
  const [query, setQuery] = useState('')
  const [geo, setGeo] = useState({ status: 'idle', coords: null })
  const navigate = useNavigate()
  const formRef = useRef(null)
  const submitRef = useRef(null)

  const openPanel = (name) => { setQuery(''); setOpen((o) => (o === name ? null : name)) }
  const close = (returnFocus) => {
    const was = open
    setOpen(null)
    if (returnFocus && was) document.getElementById(`${was}-trigger`)?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!formRef.current?.contains(e.target)) setOpen(null) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const pickCondition = (c) => {
    setValues((s) => ({ ...s, condition: c, subCondition: s.condition === c ? s.subCondition : '' }))
    setQuery('')
    setOpen('sub')
  }
  const pickSub = (s) => {
    setValues((v) => ({ ...v, subCondition: s }))
    setQuery('')
    setOpen('location')
  }
  const pickLocation = (l, coords = null) => {
    setValues((v) => ({ ...v, location: l }))
    setGeo((g) => ({ ...g, coords }))
    setOpen(null)
    submitRef.current?.focus()
  }

  const useNearby = () => {
    if (!navigator.geolocation) { setGeo({ status: 'error', coords: null }); return }
    setGeo({ status: 'locating', coords: null })
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo({ status: 'idle', coords: null }); pickLocation('Near me', { lat: p.coords.latitude, lng: p.coords.longitude }) },
      () => setGeo({ status: 'error', coords: null }),
      { timeout: 10000 },
    )
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setOpen(null)
    console.log('Search submitted:', { ...values, coords: geo.coords })
    const p = new URLSearchParams()
    if (values.condition) p.set('condition', values.condition)
    if (values.subCondition) p.set('sub', values.subCondition)
    if (values.location) p.set('location', values.location)
    navigate(`/trials?${p}`)
  }

  const q = query.trim()
  const conditionList = conditionNames.filter((c) => match(c, q))
  const subGroups = (conditionTaxonomy[values.condition] || [])
    .map((g) => ({ ...g, items: g.items.filter((i) => match(i, q)) }))
    .filter((g) => g.items.length)
  const locationList = locations.filter((l) => match(l, q))

  return (
    <form
      ref={formRef}
      id="search"
      role="search"
      aria-label="Find a clinical trial"
      onSubmit={onSubmit}
      className="relative mx-auto flex w-full max-w-[720px] flex-col gap-1 rounded-3xl border-2 border-white/70 bg-white p-1.5 text-left shadow-lg shadow-black/20 md:min-h-[64px] md:flex-row md:items-stretch md:gap-0 md:rounded-full"
    >
      <input type="hidden" name="condition" value={values.condition} />
      <input type="hidden" name="subCondition" value={values.subCondition} />
      <input type="hidden" name="location" value={values.location} />

      {/* Type of condition */}
      <div className="relative md:w-[28%]">
        <FieldTrigger id="condition" label="Type of condition" placeholder="e.g., Cancer, Diabetes" value={values.condition} active={open === 'condition'} onOpen={() => openPanel('condition')} />
        {open === 'condition' && (
          <SearchDropdown id="condition-panel" searchLabel="Search Condition" query={query} setQuery={setQuery} onClose={close} className="left-0">
            {conditionList.map((c) => (
              <OptionRow key={c} selected={values.condition === c} onSelect={() => pickCondition(c)}>
                {c}{values.condition === c && <CheckIcon className="h-4 w-4" />}
              </OptionRow>
            ))}
            {q && !conditionNames.some((c) => c.toLowerCase() === q.toLowerCase()) && (
              <OptionRow onSelect={() => pickCondition(q)}>Search for “{q}”</OptionRow>
            )}
          </SearchDropdown>
        )}
      </div>

      <Divider hidden={open === 'condition' || open === 'sub'} />

      {/* Sub-condition */}
      <div className="relative md:flex-1">
        <FieldTrigger
          id="sub"
          label="Sub-condition"
          placeholder="e.g., Breast Cancer, Leukemia"
          value={values.subCondition}
          active={open === 'sub'}
          onOpen={() => openPanel('sub')}
          disabled={!values.condition}
          disabledHint="Choose a type of condition first"
        />
        {open === 'sub' && values.condition && (
          <SearchDropdown id="sub-panel" title={values.condition} searchLabel="Search Sub-Condition" query={query} setQuery={setQuery} onClose={close} className="left-0 md:w-[440px]">
            {subGroups.map((g) => (
              <div key={g.group} className="px-1 pb-2 pt-3 first:pt-2">
                <p className="text-[15px]">
                  <span className="font-semibold text-ink">{g.group}</span>{' '}
                  <span className="text-[13px] text-[#9A9FAE]">{g.note}</span>
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {g.items.map((i) => {
                    const sel = values.subCondition === i
                    return (
                      <button
                        key={i}
                        type="button"
                        data-opt
                        aria-pressed={sel}
                        onClick={() => pickSub(i)}
                        className={`min-h-[32px] rounded-md px-2.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 ${
                          sel ? 'bg-navy text-white' : 'bg-[#EEEFF2] text-[#5A5F6E] hover:bg-[#E2E4EA] hover:text-ink'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {values.condition && q && (
              <div className="px-1 pt-2">
                <OptionRow onSelect={() => pickSub(q)}>Search for “{q}”</OptionRow>
              </div>
            )}
            {values.condition && !q && !subGroups.length && (
              <EmptyNote>Type a sub-condition to search within {values.condition}.</EmptyNote>
            )}
          </SearchDropdown>
        )}
      </div>

      <Divider hidden={open === 'sub' || open === 'location'} />

      {/* Location: panel anchors to the form's right edge on desktop */}
      <div className="relative md:static md:w-[26%]">
        <FieldTrigger id="location" label="Location" placeholder="e.g., Phoenix, AZ" value={values.location} active={open === 'location'} onOpen={() => openPanel('location')} />
        {open === 'location' && (
          <SearchDropdown id="location-panel" searchLabel="Search Location" query={query} setQuery={setQuery} onClose={close} className="left-0 md:left-auto md:right-[-40px]">
            {!q && (
              <button
                type="button"
                data-opt
                onClick={useNearby}
                disabled={geo.status === 'locating'}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[#EEF0F4] focus:bg-[#EEF0F4] focus:outline-none"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#E1EAF7] text-[#2F6FD6]">
                  <NavigateIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-ink">Nearby</span>
                  <span className="block text-sm text-[#5A5F6E]" aria-live="polite">
                    {geo.status === 'locating' ? 'Finding your location…' : geo.status === 'error' ? 'Couldn’t get your location. Pick a city below.' : 'Find what’s around you'}
                  </span>
                </span>
              </button>
            )}
            {locationList.map((l) => (
              <OptionRow key={l} selected={values.location === l} onSelect={() => pickLocation(l)}>
                {l}{values.location === l && <CheckIcon className="h-4 w-4" />}
              </OptionRow>
            ))}
            {q && !locations.some((l) => l.toLowerCase() === q.toLowerCase()) && (
              <OptionRow onSelect={() => pickLocation(q)}>Use “{q}”</OptionRow>
            )}
          </SearchDropdown>
        )}
      </div>

      <button
        ref={submitRef}
        type="submit"
        className="focus-ring-light inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-6 text-[15px] font-medium text-white transition hover:bg-navy-800 md:ml-1"
      >
        <SearchIcon className="h-[18px] w-[18px]" />
        Search
      </button>
    </form>
  )
}
