import { useState } from 'react'
import { useTreatments } from '../../profileStore.js'
import { ConfirmDialog } from './MedicalDocuments.jsx'
import { PencilIcon, PlusIcon } from './AccountIcons.jsx'

const TYPES = ['Medication', 'Procedure', 'Therapy', 'Clinical trial', 'Other']
const blank = { name: '', type: 'Medication', start: '', end: '', ongoing: true, notes: '' }
const inputCls = 'h-10 w-full rounded-lg border border-[#D6D8E4] bg-white px-3 text-base text-ink focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 sm:text-sm'
const fmt = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')

function TreatmentForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial)
  const [err, setErr] = useState({})
  const today = new Date().toISOString().slice(0, 10)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (!f.name.trim()) x.name = 'Enter the treatment name.'
    if (f.start && f.start > today) x.start = 'Start date can’t be in the future.'
    if (!f.ongoing && f.end && f.start && f.end < f.start) x.end = 'End date must be after the start date.'
    setErr(x)
    if (Object.keys(x).length) return
    onSave({ ...f, name: f.name.trim(), notes: f.notes.trim(), end: f.ongoing ? '' : f.end })
  }
  const errP = (k) => err[k] && <p id={`tr-${k}-err`} role="alert" className="mt-1 text-xs text-[#B42318]">{err[k]}</p>

  return (
    <form onSubmit={submit} noValidate className="mt-4 space-y-3 rounded-xl border border-line p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tr-name" className="mb-1 block text-xs font-semibold text-ink">Treatment name</label>
          <input id="tr-name" autoFocus value={f.name} onChange={set('name')} maxLength={80} placeholder="e.g. Chemotherapy" aria-invalid={Boolean(err.name)} aria-describedby={err.name ? 'tr-name-err' : undefined} className={inputCls} />
          {errP('name')}
        </div>
        <div>
          <label htmlFor="tr-type" className="mb-1 block text-xs font-semibold text-ink">Type</label>
          <select id="tr-type" value={f.type} onChange={set('type')} className={inputCls}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div>
          <label htmlFor="tr-start" className="mb-1 block text-xs font-semibold text-ink">Start date <span className="font-normal text-muted">(optional)</span></label>
          <input id="tr-start" type="date" max={today} value={f.start} onChange={set('start')} aria-invalid={Boolean(err.start)} aria-describedby={err.start ? 'tr-start-err' : undefined} className={inputCls} />
          {errP('start')}
        </div>
        <div>
          <label htmlFor="tr-end" className="mb-1 block text-xs font-semibold text-ink">End date</label>
          <input id="tr-end" type="date" disabled={f.ongoing} min={f.start || undefined} value={f.ongoing ? '' : f.end} onChange={set('end')} aria-invalid={Boolean(err.end)} aria-describedby={err.end ? 'tr-end-err' : undefined} className={`${inputCls} disabled:bg-[#F5F6F8] disabled:text-muted`} />
          <label className="mt-1.5 flex items-center gap-2 text-xs text-ink"><input type="checkbox" checked={f.ongoing} onChange={set('ongoing')} className="h-4 w-4 accent-navy" />Still ongoing</label>
          {errP('end')}
        </div>
      </div>
      <div>
        <label htmlFor="tr-notes" className="mb-1 block text-xs font-semibold text-ink">Notes <span className="font-normal text-muted">(optional)</span></label>
        <textarea id="tr-notes" rows={2} maxLength={500} value={f.notes} onChange={set('notes')} placeholder="Dose, doctor, how it went…" className={`${inputCls} h-auto py-2`} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="focus-ring-light h-9 rounded-full bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800">Save</button>
        <button type="button" onClick={onCancel} className="focus-ring-light h-9 rounded-full border border-line px-5 text-[13px] font-medium text-ink">Cancel</button>
      </div>
    </form>
  )
}

export default function TreatmentRecords({ email }) {
  const [items, save] = useTreatments(email)
  const [editing, setEditing] = useState(null) // 'new' | id
  const [del, setDel] = useState(null)

  const upsert = (rec) => {
    if (editing === 'new') save([{ ...rec, id: crypto.randomUUID() }, ...items])
    else save(items.map((i) => (i.id === editing ? { ...rec, id: i.id } : i)))
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="text-lg font-semibold text-ink">Treatment Records</h2>
        {editing !== 'new' && (
          <button type="button" onClick={() => setEditing('new')} className="focus-ring-light inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-[13px] font-medium text-white hover:bg-navy-800">
            <PlusIcon className="h-4 w-4" />Add treatment
          </button>
        )}
      </div>
      <p className="mt-3 text-[13px] text-[#4A5068]">Past and current treatments help us skip trials you wouldn’t qualify for.</p>

      {editing === 'new' && <TreatmentForm initial={blank} onSave={upsert} onCancel={() => setEditing(null)} />}

      {items.length === 0 && editing !== 'new' ? (
        <div className="mt-4 rounded-xl border-2 border-dashed border-[#D6D8E4] px-6 py-10 text-center">
          <p className="text-[15px] font-semibold text-ink">No treatments added yet</p>
          <p className="mt-1 text-[13px] text-muted">Add medicines, procedures or therapies you’ve had.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((t) =>
            editing === t.id ? (
              <li key={t.id}><TreatmentForm initial={{ ...blank, ...t, ongoing: !t.end }} onSave={upsert} onCancel={() => setEditing(null)} /></li>
            ) : (
              <li key={t.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t.type}{t.start ? ` · ${fmt(t.start)} – ${t.end ? fmt(t.end) : 'Ongoing'}` : !t.end ? ' · Ongoing' : ''}
                  </p>
                  {t.notes && <p className="mt-2 break-words text-[13px] text-[#4A5068]">{t.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => setEditing(t.id)} aria-label={`Edit ${t.name}`} className="focus-ring-light grid h-9 w-9 place-items-center rounded-full hover:bg-[#F0F1F4]"><PencilIcon className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setDel(t)} aria-label={`Delete ${t.name}`} className="focus-ring-light grid h-9 w-9 place-items-center rounded-full text-[#B42318] hover:bg-[#FEF3F2]">×</button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {del && (
        <ConfirmDialog danger title="Delete this treatment?" body={`${del.name} will be removed from your records.`} confirmLabel="Delete" onCancel={() => setDel(null)} onConfirm={() => { save(items.filter((i) => i.id !== del.id)); setDel(null) }} />
      )}
    </div>
  )
}
