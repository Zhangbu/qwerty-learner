import { checkSession } from '@/auth/client'
import Loading from './components/Loading'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import { FriendLinks } from './pages/FriendLinks'
import LoginPage from './pages/Login'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import { Analytics } from '@vercel/analytics/react'
import 'animate.css'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import process from 'process'
import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))

if (process.env.NODE_ENV === 'production') {
  mixpanel.init('bdc492847e9340eeebd53cc35f321691')
} else {
  mixpanel.init('5474177127e4767124c123b2d7846e2a', { debug: true })
}

type AuthStatus = 'loading' | 'authed' | 'guest'

function ProtectedRoute({ authStatus, children }: { authStatus: AuthStatus; children: React.ReactElement }) {
  const location = useLocation()

  if (authStatus === 'loading') return <Loading />

  if (authStatus === 'guest') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={'/login?next=' + next} replace />
  }

  return children
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  const refreshSession = useCallback(async () => {
    try {
      const authed = await checkSession()
      setAuthStatus(authed ? 'authed' : 'guest')
    } catch {
      setAuthStatus('guest')
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  useEffect(() => {
    const handleResize = () => {
      const nextMobile = window.innerWidth <= 600
      if (!nextMobile) {
        window.location.href = '/'
      }
      setIsMobile(nextMobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path='/login'
              element={
                authStatus === 'authed' ? <Navigate to='/' replace /> : <LoginPage onLoginSuccess={refreshSession} />
              }
            />
            <Route
              path='/mobile'
              element={
                <ProtectedRoute authStatus={authStatus}>
                  <MobilePage />
                </ProtectedRoute>
              }
            />

            {isMobile ? (
              <Route path='/*' element={<Navigate to='/mobile' />} />
            ) : (
              <>
                <Route
                  index
                  element={
                    <ProtectedRoute authStatus={authStatus}>
                      <TypingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/gallery'
                  element={
                    <ProtectedRoute authStatus={authStatus}>
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/analysis'
                  element={
                    <ProtectedRoute authStatus={authStatus}>
                      <AnalysisPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/error-book'
                  element={
                    <ProtectedRoute authStatus={authStatus}>
                      <ErrorBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/friend-links'
                  element={
                    <ProtectedRoute authStatus={authStatus}>
                      <FriendLinks />
                    </ProtectedRoute>
                  }
                />
                <Route path='/*' element={<Navigate to='/' />} />
              </>
            )}
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)
