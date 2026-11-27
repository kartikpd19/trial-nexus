import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import TrialsPage from './pages/TrialsPage.jsx'
import TrialDetailPage from './pages/TrialDetailPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import { useAuth } from './auth.jsx'

// Scrolls to #hash targets (e.g. /#faq) after route changes.
function HashScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
  }, [pathname, hash])
  return null
}

// Signed-in users skip the auth pages and go where they were headed.
function GuestOnly({ children }) {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const next = params.get('next')
  return user ? <Navigate to={next && next.startsWith('/') ? next : '/'} replace /> : children
}

export default function App() {
  return (
    <>
      <HashScroll />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trials" element={<TrialsPage />} />
        <Route path="/trials/:id" element={<TrialDetailPage />} />
        <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><SignUpPage /></GuestOnly>} />
        <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
        <Route path="/welcome" element={<OnboardingPage />} />
        <Route path="/account" element={<Navigate to="/account/profile" replace />} />
        <Route path="/account/:tab" element={<AccountPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  )
}
