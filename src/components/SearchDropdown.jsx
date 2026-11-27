import { useRef } from 'react'
import { SearchIcon } from './Icons.jsx'

// Moves focus between [data-opt] buttons with the arrow keys.
function moveFocus(container, dir) {
  const opts = [...container.querySelectorAll('[data-opt]')]
  if (!opts.length) return
  const i = opts.indexOf(document.activeElement)
  const next = i === -1 ? (dir > 0 ? 0 : opts.length - 1) : Math.min(opts.length - 1, Math.max(0, i + dir))
  opts[next].focus()
}

export default function SearchDropdown({ id, title, searchLabel, query, setQuery, onClose, className = '', children }) {
  const ref = useRef(null)
  const inputRef = useRef(null)

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(true) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(ref.current, 1) }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const opts = [...ref.current.querySelectorAll('[data-opt]')]
      if (opts[0] === document.activeElement) inputRef.current?.focus()
      else moveFocus(ref.current, -1)
    }
  }

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={title || searchLabel}
      onKeyDown={onKeyDown}
      className={`absolute top-[calc(100%+10px)] z-30 w-full rounded-2xl bg-[#FAFAFB] p-3 text-left shadow-[0_16px_40px_-10px_rgba(2,27,58,.45)] ring-1 ring-black/5 md:w-[420px] ${className}`}
    >
      {title && <p className="mb-2.5 px-1 text-lg font-semibold text-ink">{title}</p>}
      <label className="relative block">
        <span className="sr-only">{searchLabel}</span>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchLabel}
          className="h-11 w-full rounded-lg border border-[#DCDEE5] bg-white pl-3 pr-10 text-base text-ink placeholder:text-[#3b3f4a] focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 md:text-[15px]"
        />
        <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink" />
      </label>
      <div className="nice-scroll mt-2 max-h-[280px] overflow-y-auto pr-1">{children}</div>
    </div>
  )
}

export function OptionRow({ selected, onSelect, children }) {
  return (
    <button
      type="button"
      data-opt
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-[40px] w-full items-center justify-between rounded-lg px-2 text-left text-[15px] transition focus:bg-[#EEF0F4] focus:outline-none hover:bg-[#EEF0F4] ${
        selected ? 'font-semibold text-navy' : 'text-[#5A5F6E]'
      }`}
    >
      {children}
    </button>
  )
}

export function EmptyNote({ children }) {
  return <p className="px-2 py-3 text-sm text-muted">{children}</p>
}
