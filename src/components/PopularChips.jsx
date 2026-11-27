export default function PopularChips({ items, active, onSelect }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-sm font-semibold text-white" id="popular-label">Popular:</span>
      <ul className="flex flex-wrap justify-center gap-2" aria-labelledby="popular-label">
        {items.map((c) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              aria-pressed={active === c}
              className={`focus-ring min-h-[36px] rounded-full border px-4 text-[13px] text-white transition ${
                active === c ? 'border-white bg-white/15' : 'border-white/60 hover:border-white hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
