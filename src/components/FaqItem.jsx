import { useId, useState } from 'react'
import { ChevronDown } from './Icons.jsx'

export default function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  const btnId = `${id}-btn`
  const panelId = `${id}-panel`
  return (
    <li className="rounded-xl border border-line bg-white transition-colors hover:border-[#D6D8E4]">
      <h3>
        <button
          id={btnId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="focus-ring-light flex min-h-[64px] w-full items-center justify-between gap-4 rounded-xl px-6 py-4 text-left text-base font-semibold text-navy"
        >
          {q}
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={btnId} hidden={!open} className="px-6 pb-5 text-[15px] leading-relaxed text-muted">
        {a}
      </div>
    </li>
  )
}
