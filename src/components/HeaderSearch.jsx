import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon } from './Icons.jsx'
import { conditionTaxonomy, locations } from '../data.js'

// Compact Condition + Location search used in the inner-page header.
export default function HeaderSearch({ condition = '', location = '', className = '' }) {
  const navigate = useNavigate()
  const [c, setC] = useState(condition)
  const [l, setL] = useState(location)
  useEffect(() => { setC(condition); setL(location) }, [condition, location])

  const onSubmit = (e) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (c.trim()) p.set('condition', c.trim())
    if (l.trim()) p.set('location', l.trim())
    navigate(`/trials?${p}`)
  }

  const field = 'w-full truncate bg-transparent text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-muted focus:outline-none'
  return (
    <form role="search" aria-label="Change search" onSubmit={onSubmit} className={`flex h-[52px] items-stretch rounded-xl border border-line bg-white shadow-sm focus-within:border-navy/40 ${className}`}>
      <label className="flex min-w-0 flex-1 flex-col justify-center px-4">
        <span className="text-[11px] leading-4 text-muted">Condition</span>
        <input list="hs-conditions" value={c} onChange={(e) => setC(e.target.value)} placeholder="Any condition" className={field} />
      </label>
      <span className="my-2.5 w-px bg-line" aria-hidden="true" />
      <label className="flex min-w-0 flex-1 flex-col justify-center px-4">
        <span className="text-[11px] leading-4 text-muted">Location</span>
        <input list="hs-locations" value={l} onChange={(e) => setL(e.target.value)} placeholder="Any location" className={field} />
      </label>
      <button type="submit" aria-label="Search trials" className="focus-ring-light grid w-12 shrink-0 place-items-center rounded-r-xl border-l border-line text-ink hover:bg-[#F0F1F4]">
        <SearchIcon className="h-5 w-5" />
      </button>
      <datalist id="hs-conditions">{Object.keys(conditionTaxonomy).map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="hs-locations">{locations.map((x) => <option key={x} value={x} />)}</datalist>
    </form>
  )
}
