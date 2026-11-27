/*
 * MOCK STORAGE for the account area (front-end development only).
 * Profile and treatment data: localStorage. Uploaded files: IndexedDB.
 * Everything stays in this browser. Replace with your secure backend before launch.
 */
import { useCallback, useEffect, useState } from 'react'

const key = (kind, email) => `tn-${kind}:${email}`
const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage full or blocked */ } }

export const emptyProfile = {
  role: '', birthday: '', gender: '', location: '', postalCode: '', trialExperience: [], medications: [], symptoms: [], allergies: [],
}

/** Write profile fields directly (used by onboarding before the account page mounts). */
export function saveProfileFields(email, patch) {
  write(key('profile', email), { ...emptyProfile, ...read(key('profile', email), {}), ...patch })
}
export const readProfile = (email) => ({ ...emptyProfile, ...read(key('profile', email), {}) })

/** Profile fields stored per account email. */
export function useProfile(email) {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...read(key('profile', email), {}) }))
  useEffect(() => { setProfile({ ...emptyProfile, ...read(key('profile', email), {}) }) }, [email])
  const update = useCallback((patch) => {
    setProfile((p) => {
      const next = { ...p, ...patch }
      write(key('profile', email), next)
      return next
    })
  }, [email])
  return [profile, update]
}

export function useTreatments(email) {
  const [items, setItems] = useState(() => read(key('treatments', email), []))
  const save = useCallback((next) => { setItems(next); write(key('treatments', email), next) }, [email])
  return [items, save]
}

/** Moves stored data when the account email changes. */
export function moveUserData(fromEmail, toEmail) {
  for (const kind of ['profile', 'treatments']) {
    const v = read(key(kind, fromEmail), null)
    if (v) { write(key(kind, toEmail), v); localStorage.removeItem(key(kind, fromEmail)) }
  }
  return docs.reassign(fromEmail, toEmail)
}

export async function deleteUserData(email) {
  for (const kind of ['profile', 'treatments']) { try { localStorage.removeItem(key(kind, email)) } catch { /* ignore */ } }
  await docs.removeAllFor(email)
}

/* ---------- IndexedDB for document files ---------- */
const DB = 'tn-docs'
const STORE = 'files'
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const s = req.result.createObjectStore(STORE, { keyPath: 'id' })
      s.createIndex('owner', 'owner')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
const tx = async (mode, fn) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const out = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(out?.result ?? out)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  })
}

export const docs = {
  async list(owner) {
    const all = await tx('readonly', (s) => s.index('owner').getAll(owner))
    return all.sort((a, b) => b.uploadedAt - a.uploadedAt)
  },
  add: (doc) => tx('readwrite', (s) => s.put(doc)),
  rename: async (id, name) => {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite')
      const s = t.objectStore(STORE)
      const g = s.get(id)
      g.onsuccess = () => { if (g.result) s.put({ ...g.result, name }) }
      t.oncomplete = resolve
      t.onerror = () => reject(t.error)
    })
  },
  remove: (id) => tx('readwrite', (s) => s.delete(id)),
  async removeAllFor(owner) {
    const list = await docs.list(owner).catch(() => [])
    await Promise.all(list.map((d) => docs.remove(d.id)))
  },
  async reassign(from, to) {
    const list = await docs.list(from).catch(() => [])
    await Promise.all(list.map((d) => docs.add({ ...d, owner: to })))
  },
}

/** Stable member ID shown under the name, e.g. TESUS48213 */
export function memberId(user) {
  let h = 0
  for (const c of user.email) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const letters = `${user.firstName.slice(0, 3)}${user.lastName.slice(0, 2)}`.toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(5, 'X')
  return `${letters}${String(h % 100000).padStart(5, '0')}`
}
