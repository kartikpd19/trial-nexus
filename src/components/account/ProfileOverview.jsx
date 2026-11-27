import { useEffect, useRef, useState } from 'react'
import { isEmail, isName, useAuth } from '../../auth.jsx'
import { moveUserData } from '../../profileStore.js'
import { locations } from '../../data.js'
import {
  BodyIcon, CakeIcon, GenderIcon, HandIcon, LockFilled, MailIcon, NavIcon, PencilIcon, PersonIcon, PillIcon, PinIcon, PlusIcon,
} from './AccountIcons.jsx'

const inputCls = 'h-9 w-full rounded-lg border border-[#D6D8E4] bg-white px-3 text-base text-ink focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 sm:text-sm'
const addLink = 'focus-ring-light inline-flex items-center gap-1 rounded text-[13px] text-[#2F6FD6] underline underline-offset-2 hover:text-navy'
const iconBtn = 'focus-ring-light grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink hover:bg-[#F0F1F4]'

const formatDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

function Row({ icon: Icon, label, children, action }) {
  return (
    <div className="flex items-start gap-4 py-2.5">
      <Icon className="mt-2 h-5 w-5 shrink-0 text-[#9A9FAE]" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[.04em] text-[#5A5F6E]">{label}</p>
        <div className="mt-0.5 text-sm text-ink">{children}</div>
      </div>
      {action}
    </div>
  )
}

function EditActions({ onCancel, saving }) {
  return (
    <div className="mt-2 flex gap-2">
      <button type="submit" disabled={saving} className="focus-ring-light h-8 rounded-full bg-navy px-4 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
      <button type="button" onClick={onCancel} className="focus-ring-light h-8 rounded-full border border-line px-4 text-xs font-medium text-ink hover:border-ink/40">Cancel</button>
    </div>
  )
}

const ErrorText = ({ id, children }) => (children ? <p id={id} role="alert" className="mt-1.5 text-xs text-[#B42318]">{children}</p> : null)

/* Generic single-value field: shows value, "Add …" link when empty, inline editor when editing. */
function EditableField({ id, icon, label, value, display, addLabel, locked, lockHint, editHint, renderInput, validate, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const firstInput = useRef(null)
  const trigger = useRef(null)

  useEffect(() => { if (editing) firstInput.current?.focus() }, [editing])
  const open = () => { setDraft(value); setError(null); setEditing(true) }
  const close = () => { setEditing(false); setError(null); requestAnimationFrame(() => document.getElementById(`${id}-trigger`)?.focus()) }

  const submit = async (e) => {
    e.preventDefault()
    const err = validate?.(draft)
    if (err) { setError(err); return }
    setSaving(true)
    try {
      const res = await onSave(draft)
      if (res?.error) { setError(res.error); return }
      close()
    } finally { setSaving(false) }
  }

  const action = locked && value ? (
    <span className="mt-2 text-[#B8BCC8]" title={lockHint}><LockFilled className="h-5 w-5" /><span className="sr-only">{lockHint}</span></span>
  ) : value && !editing ? (
    <button ref={trigger} id={`${id}-trigger`} type="button" onClick={open} aria-label={`Edit ${label.toLowerCase()}`} className={iconBtn}><PencilIcon className="h-[18px] w-[18px]" /></button>
  ) : null

  return (
    <Row icon={icon} label={label} action={action}>
      {editing ? (
        <form onSubmit={submit} onKeyDown={(e) => e.key === 'Escape' && close()} noValidate>
          {renderInput({ draft, setDraft, ref: firstInput, error, errorId: `${id}-error` })}
          <ErrorText id={`${id}-error`}>{error}</ErrorText>
          {editHint && !error && <p className="mt-1.5 text-xs text-[#9A6200]">{editHint}</p>}
          <EditActions onCancel={close} saving={saving} />
        </form>
      ) : value ? (
        <span className="break-words">{display ? display(value) : value}</span>
      ) : (
        <button id={`${id}-trigger`} type="button" onClick={open} className={addLink}>{addLabel}</button>
      )}
    </Row>
  )
}

/* Chip list for medications, symptoms and allergies */
function ChipList({ id, icon, label, singular, items, onChange }) {
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  const add = (e) => {
    e.preventDefault()
    const v = text.trim()
    if (!v) { setError(`Type a ${singular.toLowerCase()} to add.`); return }
    if (v.length > 60) { setError('Keep it under 60 characters.'); return }
    if (items.some((i) => i.toLowerCase() === v.toLowerCase())) { setError(`${v} is already on your list.`); return }
    onChange([...items, v])
    setText('')
    setError(null)
    inputRef.current?.focus() // stay open to add another
  }
  const remove = (item) => {
    onChange(items.filter((i) => i !== item))
    requestAnimationFrame(() => document.getElementById(`${id}-trigger`)?.focus())
  }

  return (
    <Row icon={icon} label={label}>
      {items.length > 0 && (
        <ul className="mb-1.5 mt-1 flex flex-wrap gap-2" aria-label={label}>
          {items.map((item) => (
            <li key={item} className="inline-flex h-8 items-center gap-1 rounded-full border border-[#D6D8E4] pl-3 pr-1 text-sm text-ink">
              {item}
              <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item}`} className="focus-ring-light grid h-6 w-6 place-items-center rounded-full text-[#5A5F6E] hover:bg-[#F0F1F4] hover:text-ink">×</button>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <form onSubmit={add} onKeyDown={(e) => e.key === 'Escape' && (setAdding(false), setError(null))} className="mt-1" noValidate>
          <label htmlFor={`${id}-input`} className="sr-only">Add {singular.toLowerCase()}</label>
          <div className="flex gap-2">
            <input id={`${id}-input`} ref={inputRef} value={text} onChange={(e) => { setText(e.target.value); setError(null) }} placeholder={`e.g. ${singular === 'Medication' ? 'Metformin' : singular === 'Symptom' ? 'Fatigue' : 'Penicillin'}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} className={inputCls} />
            <button type="submit" className="focus-ring-light h-9 shrink-0 rounded-full bg-navy px-4 text-xs font-semibold text-white hover:bg-navy-800">Add</button>
            <button type="button" onClick={() => { setAdding(false); setError(null); setText('') }} className="focus-ring-light h-9 shrink-0 rounded-full border border-line px-3 text-xs font-medium text-ink">Done</button>
          </div>
          <ErrorText id={`${id}-err`}>{error}</ErrorText>
        </form>
      ) : (
        <button id={`${id}-trigger`} type="button" onClick={() => setAdding(true)} className={addLink}>
          <PlusIcon className="h-3.5 w-3.5" />Add {singular}
        </button>
      )}
    </Row>
  )
}

const Section = ({ title, children }) => (
  <section className="mt-4">
    <h3 className="text-[13px] font-medium text-[#5A5F6E]">{title}</h3>
    <div className="mt-1">{children}</div>
  </section>
)

export default function ProfileOverview({ profile, update }) {
  const { user, updateAccount } = useAuth()
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <h2 className="border-b border-line pb-3 text-lg font-semibold text-ink">Profile Overview</h2>

      <Section title="Basic Info">
        <EditableField
          id="pf-name" icon={PersonIcon} label="Full name"
          value={`${user.firstName} ${user.lastName}`}
          renderInput={({ draft, setDraft, ref, error, errorId }) => {
            const [first = '', ...rest] = typeof draft === 'string' ? draft.split(' ') : []
            const d = typeof draft === 'object' ? draft : { first, last: rest.join(' ') }
            const set = (k) => (e) => setDraft({ ...d, [k]: e.target.value })
            return (
              <div className="grid grid-cols-2 gap-2">
                <div><label htmlFor="pf-first" className="sr-only">First name</label><input id="pf-first" ref={ref} value={d.first} onChange={set('first')} placeholder="First name" autoComplete="given-name" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputCls} /></div>
                <div><label htmlFor="pf-last" className="sr-only">Last name</label><input id="pf-last" value={d.last} onChange={set('last')} placeholder="Last name" autoComplete="family-name" aria-invalid={Boolean(error)} className={inputCls} /></div>
              </div>
            )
          }}
          validate={(d) => {
            const v = typeof d === 'object' ? d : { first: user.firstName, last: user.lastName }
            if (!isName(v.first) || !isName(v.last)) return 'Enter a first and last name using letters only.'
            return null
          }}
          onSave={async (d) => {
            const v = typeof d === 'object' ? d : { first: user.firstName, last: user.lastName }
            await updateAccount({ firstName: v.first, lastName: v.last })
          }}
        />
        <EditableField
          id="pf-email" icon={MailIcon} label="Email" value={user.email}
          renderInput={({ draft, setDraft, ref, error, errorId }) => (
            <><label htmlFor="pf-email-input" className="sr-only">Email</label><input id="pf-email-input" ref={ref} type="email" inputMode="email" autoComplete="email" value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputCls} /></>
          )}
          validate={(v) => (!isEmail(v) ? 'Enter a valid email address, like name@example.com.' : null)}
          onSave={async (v) => {
            if (v.trim().toLowerCase() === user.email) return null
            try {
              const { previousEmail, user: u } = await updateAccount({ email: v })
              await moveUserData(previousEmail, u.email)
              return null
            } catch (err) {
              return { error: err.code === 'exists' ? 'Another account already uses this email.' : 'We couldn’t update your email. Try again.' }
            }
          }}
        />
        <EditableField
          id="pf-birthday" icon={CakeIcon} label="Birthday" value={profile.birthday} addLabel="Add Birthday"
          locked lockHint="Birthday can’t be changed after it’s saved. Contact support if it’s wrong."
          editHint="Check carefully. You won’t be able to change this later."
          display={formatDate}
          renderInput={({ draft, setDraft, ref, error, errorId }) => (
            <><label htmlFor="pf-bday" className="sr-only">Birthday</label><input id="pf-bday" ref={ref} type="date" max={today} min="1900-01-01" value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputCls} /></>
          )}
          validate={(v) => {
            if (!v) return 'Choose your date of birth.'
            if (v > today) return 'Birthday can’t be in the future.'
            const age = (Date.now() - new Date(v)) / 31557600000
            if (age < 13) return 'You need to be at least 13 to use Trial Nexus.'
            if (age > 120) return 'Check the year. That date looks too early.'
            return null
          }}
          onSave={(v) => update({ birthday: v })}
        />
        <EditableField
          id="pf-gender" icon={GenderIcon} label="Gender" value={profile.gender} addLabel="Add Gender"
          locked lockHint="Gender can’t be changed after it’s saved. Contact support to update it."
          editHint="You won’t be able to change this later."
          display={(v) => v.toUpperCase()}
          renderInput={({ draft, setDraft, ref, error, errorId }) => (
            <><label htmlFor="pf-gender-input" className="sr-only">Gender</label>
              <select id="pf-gender-input" ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputCls}>
                <option value="">Choose…</option>
                <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
              </select></>
          )}
          validate={(v) => (!v ? 'Choose an option.' : null)}
          onSave={(v) => update({ gender: v })}
        />
      </Section>

      <Section title="Location Info">
        <EditableField
          id="pf-location" icon={PinIcon} label="Location" value={profile.location} addLabel="Add Location"
          renderInput={({ draft, setDraft, ref, error, errorId }) => (
            <><label htmlFor="pf-loc" className="sr-only">Location</label>
              <input id="pf-loc" ref={ref} list="pf-loc-list" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="City, State" autoComplete="address-level2" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputCls} />
              <datalist id="pf-loc-list">{locations.map((l) => <option key={l} value={l} />)}</datalist></>
          )}
          validate={(v) => (!v.trim() ? 'Enter your city and state.' : v.trim().length < 3 ? 'That location looks too short.' : null)}
          onSave={(v) => update({ location: v.trim() })}
        />
        <EditableField
          id="pf-postal" icon={NavIcon} label="Postal code" value={profile.postalCode} addLabel="Add Postal Code"
          renderInput={({ draft, setDraft, ref, error, errorId }) => (
            <><label htmlFor="pf-zip" className="sr-only">Postal code</label><input id="pf-zip" ref={ref} inputMode="numeric" autoComplete="postal-code" maxLength={10} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. 85004" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputCls} /></>
          )}
          validate={(v) => (!/^\d{5}(-\d{4})?$/.test(v.trim()) ? 'Enter a 5-digit ZIP code, like 85004.' : null)}
          onSave={(v) => update({ postalCode: v.trim() })}
        />
      </Section>

      <Section title="Health Info">
        <ChipList id="pf-meds" icon={PillIcon} label="Medication" singular="Medication" items={profile.medications} onChange={(v) => update({ medications: v })} />
        <ChipList id="pf-symptoms" icon={BodyIcon} label="Symptoms" singular="Symptom" items={profile.symptoms} onChange={(v) => update({ symptoms: v })} />
        <ChipList id="pf-allergy" icon={HandIcon} label="Allergy" singular="Allergy" items={profile.allergies} onChange={(v) => update({ allergies: v })} />
      </Section>
    </div>
  )
}
