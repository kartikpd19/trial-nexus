import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordRules, useAuth } from '../../auth.jsx'
import { deleteUserData } from '../../profileStore.js'
import { PasswordField } from '../AuthUI.jsx'

const btn = 'focus-ring-light h-10 rounded-full px-5 text-sm font-semibold transition'

export default function AccountSettings() {
  const { user, changePassword, deleteAccount, signOut } = useAuth()
  const navigate = useNavigate()

  const [pw, setPw] = useState({ current: '', next: '' })
  const [pwState, setPwState] = useState({ loading: false, error: null, done: false, submitted: false })
  const rulesOk = passwordRules.every((r) => r.test(pw.next))

  const [del, setDel] = useState({ open: false, password: '', confirm: false, loading: false, error: null })

  const submitPw = async (e) => {
    e.preventDefault()
    setPwState((s) => ({ ...s, submitted: true, done: false }))
    if (!pw.current || !rulesOk) return
    if (pw.current === pw.next) { setPwState((s) => ({ ...s, error: 'Your new password must be different from the current one.' })); return }
    setPwState((s) => ({ ...s, loading: true, error: null }))
    try {
      await changePassword(pw.current, pw.next)
      setPw({ current: '', next: '' })
      setPwState({ loading: false, error: null, done: true, submitted: false })
    } catch (err) {
      setPwState((s) => ({ ...s, loading: false, error: err.code === 'wrong-password' ? 'Your current password isn’t right.' : 'We couldn’t change your password. Try again.' }))
    }
  }

  const submitDelete = async (e) => {
    e.preventDefault()
    if (!del.password || !del.confirm) { setDel((d) => ({ ...d, error: 'Enter your password and tick the box to confirm.' })); return }
    setDel((d) => ({ ...d, loading: true, error: null }))
    try {
      const email = await deleteAccount(del.password)
      await deleteUserData(email)
      navigate('/', { replace: true })
    } catch (err) {
      setDel((d) => ({ ...d, loading: false, error: err.code === 'wrong-password' ? 'That password isn’t right.' : 'We couldn’t delete your account. Try again.' }))
    }
  }

  return (
    <div>
      <h2 className="border-b border-line pb-3 text-lg font-semibold text-ink">Accounts</h2>

      <section aria-labelledby="acc-signin" className="mt-4 border-b border-line pb-5">
        <h3 id="acc-signin" className="text-[13px] font-medium text-[#5A5F6E]">Sign-in email</h3>
        <p className="mt-1 break-all text-sm text-ink">{user.email}</p>
        <p className="mt-1 text-xs text-muted">Change it from Profile Overview.</p>
      </section>

      <section aria-labelledby="acc-pw" className="mt-5 border-b border-line pb-6">
        <h3 id="acc-pw" className="text-[13px] font-medium text-[#5A5F6E]">Change password</h3>
        {pwState.done && <p role="status" className="mt-2 rounded-lg bg-mint-bg px-3 py-2 text-[13px] text-mint-fg">Password updated.</p>}
        {pwState.error && <p role="alert" className="mt-2 rounded-lg bg-[#FEF3F2] px-3 py-2 text-[13px] text-[#912018]">{pwState.error}</p>}
        <form onSubmit={submitPw} noValidate className="mt-3 max-w-[340px] space-y-3">
          <PasswordField id="acc-current" label="Current password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={pwState.submitted && !pw.current ? 'Enter your current password.' : null} />
          <PasswordField id="acc-new" label="New password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwState.submitted && !rulesOk ? 'Your new password needs to meet all the requirements.' : null}>
            <ul className="mt-2 space-y-1 px-1">
              {passwordRules.map((r) => <li key={r.id} className={`text-xs ${r.test(pw.next) ? 'text-mint-fg' : 'text-muted'}`}>{r.test(pw.next) ? '✓' : '○'} {r.label}</li>)}
            </ul>
          </PasswordField>
          <button type="submit" disabled={pwState.loading} className={`${btn} bg-navy text-white hover:bg-navy-800 disabled:opacity-60`}>{pwState.loading ? 'Updating…' : 'Update password'}</button>
        </form>
      </section>

      <section aria-labelledby="acc-out" className="mt-5 border-b border-line pb-5">
        <h3 id="acc-out" className="text-[13px] font-medium text-[#5A5F6E]">Sign out</h3>
        <button type="button" onClick={() => { signOut(); navigate('/') }} className={`${btn} mt-2 border border-line text-ink hover:border-ink/40`}>Sign out</button>
      </section>

      <section aria-labelledby="acc-del" className="mt-5">
        <h3 id="acc-del" className="text-[13px] font-medium text-[#B42318]">Delete account</h3>
        <p className="mt-1 text-[13px] text-[#4A5068]">Permanently removes your profile, documents and treatment records. This can’t be undone.</p>
        {!del.open ? (
          <button type="button" onClick={() => setDel((d) => ({ ...d, open: true }))} className={`${btn} mt-3 border border-[#F5C2BE] text-[#B42318] hover:bg-[#FEF3F2]`}>Delete my account</button>
        ) : (
          <form onSubmit={submitDelete} noValidate className="mt-3 max-w-[340px] space-y-3 rounded-xl border border-[#F5C2BE] bg-[#FEF3F2]/50 p-4">
            {del.error && <p role="alert" className="text-[13px] text-[#912018]">{del.error}</p>}
            <PasswordField id="acc-del-pw" label="Enter your password to confirm" autoComplete="current-password" value={del.password} onChange={(e) => setDel({ ...del, password: e.target.value, error: null })} />
            <label className="flex items-start gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={del.confirm} onChange={(e) => setDel({ ...del, confirm: e.target.checked, error: null })} className="mt-0.5 h-4 w-4 accent-[#B42318]" />
              I understand my account and all my data will be permanently deleted.
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={del.loading} className={`${btn} bg-[#B42318] text-white hover:bg-[#912018] disabled:opacity-60`}>{del.loading ? 'Deleting…' : 'Delete account'}</button>
              <button type="button" onClick={() => setDel({ open: false, password: '', confirm: false, loading: false, error: null })} className={`${btn} border border-line text-ink`}>Cancel</button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
