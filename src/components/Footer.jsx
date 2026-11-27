import { useEffect, useState } from 'react'
import { Logo } from './Navbar.jsx'
import { ChevronDown, ChevronUp, MailIcon, PhoneIcon, PinIcon } from './Icons.jsx'

const linkCls = 'focus-ring rounded text-sm text-white underline-offset-4 hover:underline max-sm:flex max-sm:min-h-[44px] max-sm:items-center'

function useIsMobile(query = '(max-width: 639px)') {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return m
}

function LinkColumn({ heading, links, index, isMobile }) {
  const [open, setOpen] = useState(false)
  const listId = `footer-col-${index}`
  const show = !isMobile || open
  return (
    <div className="max-sm:border-t max-sm:border-white/15">
      <h3 className="text-[13px] font-medium text-footmuted">
        {isMobile ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((o) => !o)}
            className="focus-ring flex min-h-[52px] w-full items-center justify-between rounded"
          >
            {heading}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          heading
        )}
      </h3>
      <ul id={listId} hidden={!show} className="mt-2 space-y-1.5 max-sm:mt-0 max-sm:space-y-0 max-sm:pb-3">
        {links.map((l) => (
          <li key={l}><a href="#" className={linkCls}>{l}</a></li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer({ data }) {
  const isMobile = useIsMobile()
  const { contact, quickLinks, columns, legal } = data
  return (
    <footer className="navy-surface text-white">
      <div className="mx-auto max-w-page px-5 pb-10 pt-14 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo className="text-xl" />
          <a href="#top" className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-semibold text-white underline-offset-4 hover:underline">
            <ChevronUp className="h-4 w-4" />
            Back to top
          </a>
        </div>

        <nav aria-label="Footer" className="mt-10 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="flex flex-col gap-8 max-sm:pb-6">
            <address className="space-y-2.5 text-sm not-italic">
              <p className="flex gap-2.5"><PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-footmuted" />{contact.address}</p>
              <p><a href={`mailto:${contact.email}`} className={`${linkCls} inline-flex gap-2.5`}><MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-footmuted" />{contact.email}</a></p>
              <p><a href={`tel:${contact.phone}`} className={`${linkCls} inline-flex gap-2.5`}><PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-footmuted" />{contact.phone}</a></p>
            </address>
            <ul className="space-y-2" aria-label="Quick links">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a href="#" className={`${linkCls} inline-flex items-center gap-2`}>
                    {q.label}
                    {q.count != null && (
                      <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white px-1 text-[11px] font-semibold text-navy" aria-label={`${q.count} open role`}>
                        {q.count}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {columns.map((c, i) => (
            <LinkColumn key={c.heading} {...c} index={i} isMobile={isMobile} />
          ))}
        </nav>

        <div className="mt-12 border-t border-white/15 pt-6">
          <ul className="flex flex-wrap gap-x-7 gap-y-1 max-sm:flex-col" aria-label="Legal">
            {legal.map((l) => (
              <li key={l}><a href="#" className={linkCls}>{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
