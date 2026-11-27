import { useCallback, useEffect, useRef, useState } from 'react'
import { docs } from '../../profileStore.js'
import { DocIcon, DownloadIcon, MoreIcon, ShieldIcon } from './AccountIcons.jsx'

const MAX_BYTES = 50 * 1024 * 1024
const ACCEPT = { 'application/pdf': 'PDF', 'image/jpeg': 'JPEG', 'image/png': 'PNG' }

const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
const fmtDate = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const extOf = (name) => (name.includes('.') ? name.slice(name.lastIndexOf('.')) : '')
const baseOf = (name) => (name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name)

function saveBlob(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function UploadArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
      <path d="M10 4h18l10 10v28a2 2 0 01-2 2H10a2 2 0 01-2-2V6a2 2 0 012-2z" fill="#E6E8EE" />
      <path d="M28 4v8a2 2 0 002 2h8z" fill="#CDD1DB" />
      <path d="M14 20h16M14 25h16M14 30h10" stroke="#B5BAC6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="36" r="9" fill="#2F6FD6" />
      <path d="M36 41v-9M32 35.5l4-4 4 4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RowMenu({ doc, onView, onDownload, onRename, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus() } }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  const item = 'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[#F0F1F4] focus:bg-[#F0F1F4] focus:outline-none'
  const pick = (fn) => () => { setOpen(false); fn() }
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${doc.name}`} onClick={() => setOpen((o) => !o)} className="focus-ring-light grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-[#F0F1F4]">
        <MoreIcon className="h-5 w-5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-20 w-40 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5">
          <button role="menuitem" className={`${item} text-ink`} onClick={pick(onView)}>View</button>
          <button role="menuitem" className={`${item} text-ink`} onClick={pick(onDownload)}>Download</button>
          <button role="menuitem" className={`${item} text-ink`} onClick={pick(onRename)}>Rename</button>
          <button role="menuitem" className={`${item} text-[#B42318]`} onClick={pick(onDelete)}>Delete</button>
        </div>
      )}
    </div>
  )
}

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel, danger }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.querySelector('[data-cancel]')?.focus()
    const esc = (e) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-[1300] grid place-items-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-navy/50" onClick={onCancel} />
      <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-body" className="relative w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="cd-title" className="text-lg font-semibold text-ink">{title}</h2>
        <p id="cd-body" className="mt-2 text-sm leading-relaxed text-[#4A5068]">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button data-cancel type="button" onClick={onCancel} className="focus-ring-light h-10 rounded-full border border-line px-5 text-sm font-medium text-ink">Cancel</button>
          <button type="button" onClick={onConfirm} className={`focus-ring-light h-10 rounded-full px-5 text-sm font-semibold text-white ${danger ? 'bg-[#B42318] hover:bg-[#912018]' : 'bg-navy hover:bg-navy-800'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function MedicalDocuments({ email }) {
  const [list, setList] = useState(null) // null = loading
  const [uploading, setUploading] = useState([]) // names currently being saved
  const [errors, setErrors] = useState([])
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState(false)
  const [renaming, setRenaming] = useState(null) // { id, value, error }
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const inputRef = useRef(null)
  const dragDepth = useRef(0)

  const refresh = useCallback(async () => {
    try { setList(await docs.list(email)); setLoadError(false) } catch { setLoadError(true); setList([]) }
  }, [email])
  useEffect(() => { refresh() }, [refresh])

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3000) }

  const handleFiles = async (fileList) => {
    const files = [...fileList]
    if (!files.length) return
    const errs = []
    const ok = []
    const existing = new Set((list || []).map((d) => d.name.toLowerCase()))
    for (const f of files) {
      if (!ACCEPT[f.type]) errs.push(`${f.name}: only JPEG, PNG and PDF files can be uploaded.`)
      else if (f.size > MAX_BYTES) errs.push(`${f.name}: this file is ${fmtSize(f.size)}. The limit is 50 MB.`)
      else if (f.size === 0) errs.push(`${f.name}: this file is empty.`)
      else {
        // Avoid duplicate names: "report.pdf" -> "report (2).pdf"
        let name = f.name
        let n = 2
        while (existing.has(name.toLowerCase())) { name = `${baseOf(f.name)} (${n})${extOf(f.name)}`; n += 1 }
        existing.add(name.toLowerCase())
        ok.push({ file: f, name })
      }
    }
    setErrors(errs)
    if (!ok.length) return
    setUploading(ok.map((o) => o.name))
    try {
      for (const { file, name } of ok) {
        await docs.add({ id: crypto.randomUUID(), owner: email, name, type: file.type, size: file.size, uploadedAt: Date.now(), blob: file })
      }
      flash(`${ok.length} ${ok.length === 1 ? 'file' : 'files'} uploaded.`)
    } catch {
      setErrors((e) => [...e, 'Upload failed. Your browser may be out of storage space. Remove some files and try again.'])
    } finally {
      setUploading([])
      refresh()
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e) => { e.preventDefault(); dragDepth.current = 0; setDragging(false); handleFiles(e.dataTransfer.files) }
  const dragProps = {
    onDragEnter: (e) => { e.preventDefault(); dragDepth.current += 1; setDragging(true) },
    onDragLeave: () => { dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false) },
    onDragOver: (e) => e.preventDefault(),
    onDrop,
  }

  const view = (d) => {
    const url = URL.createObjectURL(d.blob)
    const a = document.createElement('a')
    a.href = url; a.target = '_blank'; a.rel = 'noopener'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }
  const downloadAll = async () => {
    for (const d of list) { saveBlob(d.blob, d.name); await new Promise((r) => setTimeout(r, 300)) }
  }
  const saveRename = async (e) => {
    e.preventDefault()
    const doc = list.find((d) => d.id === renaming.id)
    const base = renaming.value.trim()
    if (!base) { setRenaming((r) => ({ ...r, error: 'Enter a file name.' })); return }
    if (/[\\/:*?"<>|]/.test(base)) { setRenaming((r) => ({ ...r, error: 'Remove these characters: \\ / : * ? " < > |' })); return }
    const name = `${base}${extOf(doc.name)}`
    if (list.some((d) => d.id !== doc.id && d.name.toLowerCase() === name.toLowerCase())) { setRenaming((r) => ({ ...r, error: 'Another file already has this name.' })); return }
    await docs.rename(doc.id, name)
    setRenaming(null)
    refresh()
    flash('File renamed.')
  }
  const doDelete = async () => {
    const d = confirmDelete
    setConfirmDelete(null)
    await docs.remove(d.id)
    refresh()
    flash(`${d.name} deleted.`)
  }

  const fileInput = (
    <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => handleFiles(e.target.files)} />
  )
  const hasFiles = list && list.length > 0

  return (
    <div {...dragProps} className="relative">
      {fileInput}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="text-lg font-semibold text-ink">Medical Documents</h2>
        {hasFiles && (
          <div className="flex gap-2">
            <button type="button" onClick={downloadAll} className="focus-ring-light inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-ink hover:border-ink/40">
              <DownloadIcon className="h-4 w-4" />Download All
            </button>
            <button type="button" onClick={() => inputRef.current?.click()} className="focus-ring-light h-9 rounded-lg bg-navy px-3 text-[13px] font-medium text-white hover:bg-navy-800">Upload file</button>
          </div>
        )}
      </div>

      <div aria-live="polite" className="sr-only">{notice}</div>
      {notice && <p className="mt-3 rounded-lg bg-mint-bg px-3 py-2 text-[13px] text-mint-fg">{notice}</p>}
      {errors.length > 0 && (
        <div role="alert" className="mt-3 rounded-lg border border-[#F5C2BE] bg-[#FEF3F2] px-3 py-2 text-[13px] text-[#912018]">
          <ul className="space-y-1">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          <button type="button" onClick={() => setErrors([])} className="mt-1 text-xs underline">Dismiss</button>
        </div>
      )}
      {loadError && <p role="alert" className="mt-3 text-[13px] text-[#912018]">We couldn’t load your documents in this browser. Private browsing can block file storage.</p>}

      {list === null ? (
        <p className="py-16 text-center text-sm text-muted">Loading documents…</p>
      ) : !hasFiles ? (
        <div className={`mt-4 flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${dragging ? 'border-navy bg-[#EEF2FC]' : 'border-[#D6D8E4]'}`}>
          <UploadArt />
          <p className="mt-3 text-[15px] font-semibold text-ink">Choose a file or drag &amp; drop it here</p>
          <p className="mt-1 text-[13px] text-muted">JPEG, PNG, PDF format, up to 50MB</p>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading.length > 0} className="focus-ring-light mt-4 h-9 rounded-lg bg-[#EEEFF2] px-4 text-[13px] font-medium text-ink hover:bg-[#E2E4EA] disabled:opacity-60">
            {uploading.length ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className="text-xs text-ink">
                <th scope="col" className="py-3 pr-3 font-semibold">Report Name</th>
                <th scope="col" className="py-3 pr-3 font-semibold">File Type</th>
                <th scope="col" className="py-3 pr-3 font-semibold">Date Uploaded</th>
                <th scope="col" className="w-10 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {uploading.map((n) => (
                <tr key={`up-${n}`} className="text-muted">
                  <td className="py-2.5 pr-3" colSpan={4}><span className="inline-flex items-center gap-2"><DocIcon className="h-5 w-5 animate-pulse motion-reduce:animate-none" />Uploading {n}…</span></td>
                </tr>
              ))}
              {list.map((d) => (
                <tr key={d.id} className="align-middle">
                  <td className="max-w-[260px] py-2.5 pr-3">
                    <div className="flex items-start gap-3">
                      <DocIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#5A5F6E]" />
                      {renaming?.id === d.id ? (
                        <form onSubmit={saveRename} onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)} className="min-w-0 flex-1">
                          <label htmlFor={`rn-${d.id}`} className="sr-only">New name for {d.name}</label>
                          <div className="flex items-center gap-1">
                            <input id={`rn-${d.id}`} autoFocus value={renaming.value} onChange={(e) => setRenaming({ ...renaming, value: e.target.value, error: null })} maxLength={120} aria-invalid={Boolean(renaming.error)} className="h-8 min-w-0 flex-1 rounded-md border border-[#D6D8E4] px-2 text-base focus:border-navy focus:outline-none sm:text-[13px]" />
                            <span className="text-xs text-muted">{extOf(d.name)}</span>
                          </div>
                          {renaming.error && <p role="alert" className="mt-1 text-xs text-[#B42318]">{renaming.error}</p>}
                          <div className="mt-1.5 flex gap-1.5">
                            <button type="submit" className="h-7 rounded-full bg-navy px-3 text-xs font-semibold text-white">Save</button>
                            <button type="button" onClick={() => setRenaming(null)} className="h-7 rounded-full border border-line px-3 text-xs">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="min-w-0">
                          <p className="truncate text-ink" title={d.name}>{d.name}</p>
                          <p className="text-xs text-muted">{ACCEPT[d.type]} • {fmtSize(d.size)}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-[#4A5068]">{ACCEPT[d.type]}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-[#4A5068]">{fmtDate(d.uploadedAt)}</td>
                  <td className="py-2.5">
                    <RowMenu
                      doc={d}
                      onView={() => view(d)}
                      onDownload={() => saveBlob(d.blob, d.name)}
                      onRename={() => setRenaming({ id: d.id, value: baseOf(d.name), error: null })}
                      onDelete={() => setConfirmDelete(d)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasFiles && dragging && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl border-2 border-dashed border-navy bg-[#EEF2FC]/90 text-sm font-semibold text-navy">Drop files to upload</div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-[#4A5068]">
        <ShieldIcon className="h-4 w-4 shrink-0 text-[#5A5F6E]" />
        Files you upload stay in this browser and are only visible to you.
      </div>

      {confirmDelete && (
        <ConfirmDialog
          danger
          title="Delete this document?"
          body={`${confirmDelete.name} will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete"
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

export { ConfirmDialog }
