import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/*
 * MOCK AUTH for front-end development only.
 * Accounts live in this browser's localStorage (passwords stored as SHA-256 hashes, never plain text).
 * Replace these functions with calls to your real auth backend before launch.
 */
const ACCOUNTS_KEY = 'tn-mock-accounts'
const SESSION_KEY = 'tn-session'

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export class AuthError extends Error {
  constructor(code) { super(code); this.code = code }
}

export const normalizeEmail = (e) => e.trim().toLowerCase()
export const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())
export const isName = (n) => /^[\p{L}][\p{L}\s'.-]{0,49}$/u.test(n.trim())
export const passwordRules = [
  { id: 'len', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'num', label: 'One number', test: (p) => /\d/.test(p) },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(SESSION_KEY, null))

  const startSession = (acc) => {
    const u = { firstName: acc.firstName, lastName: acc.lastName, email: acc.email }
    write(SESSION_KEY, u)
    setUser(u)
    return u
  }

  const emailExists = useCallback(async (email) => {
    await delay(350)
    return Boolean(read(ACCOUNTS_KEY, {})[normalizeEmail(email)])
  }, [])

  const signIn = useCallback(async (email, password) => {
    await delay(700)
    const acc = read(ACCOUNTS_KEY, {})[normalizeEmail(email)]
    if (!acc) throw new AuthError('no-account')
    if (acc.hash !== (await hash(password))) throw new AuthError('wrong-password')
    return startSession(acc)
  }, [])

  const signUp = useCallback(async ({ firstName, lastName, email, password }) => {
    await delay(800)
    const accounts = read(ACCOUNTS_KEY, {})
    const key = normalizeEmail(email)
    if (accounts[key]) throw new AuthError('exists')
    const acc = { firstName: firstName.trim(), lastName: lastName.trim(), email: key, hash: await hash(password) }
    write(ACCOUNTS_KEY, { ...accounts, [key]: acc })
    return startSession(acc)
  }, [])

  const requestReset = useCallback(async () => { await delay(700) }, [])

  const signInWithGoogle = useCallback(async () => {
    await delay(500)
    throw new AuthError('google-unavailable')
  }, [])

  const signOut = useCallback(() => { write(SESSION_KEY, null); setUser(null) }, [])

  /** Update name and/or email for the signed-in account. */
  const updateAccount = useCallback(async ({ firstName, lastName, email }) => {
    await delay(500)
    const current = read(SESSION_KEY, null)
    if (!current) throw new AuthError('signed-out')
    const accounts = read(ACCOUNTS_KEY, {})
    const acc = accounts[current.email]
    if (!acc) throw new AuthError('no-account')
    const nextEmail = email ? normalizeEmail(email) : acc.email
    if (nextEmail !== acc.email && accounts[nextEmail]) throw new AuthError('exists')
    const updated = { ...acc, firstName: firstName?.trim() || acc.firstName, lastName: lastName?.trim() || acc.lastName, email: nextEmail }
    delete accounts[acc.email]
    write(ACCOUNTS_KEY, { ...accounts, [nextEmail]: updated })
    return { previousEmail: acc.email, user: startSession(updated) }
  }, [])

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await delay(600)
    const current = read(SESSION_KEY, null)
    const accounts = read(ACCOUNTS_KEY, {})
    const acc = current && accounts[current.email]
    if (!acc) throw new AuthError('no-account')
    if (acc.hash !== (await hash(currentPassword))) throw new AuthError('wrong-password')
    write(ACCOUNTS_KEY, { ...accounts, [acc.email]: { ...acc, hash: await hash(newPassword) } })
  }, [])

  const deleteAccount = useCallback(async (password) => {
    await delay(700)
    const current = read(SESSION_KEY, null)
    const accounts = read(ACCOUNTS_KEY, {})
    const acc = current && accounts[current.email]
    if (!acc) throw new AuthError('no-account')
    if (acc.hash !== (await hash(password))) throw new AuthError('wrong-password')
    delete accounts[acc.email]
    write(ACCOUNTS_KEY, accounts)
    write(SESSION_KEY, null)
    setUser(null)
    return acc.email
  }, [])

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut, emailExists, requestReset, signInWithGoogle, updateAccount, changePassword, deleteAccount }),
    [user, signIn, signUp, signOut, emailExists, requestReset, signInWithGoogle, updateAccount, changePassword, deleteAccount],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
