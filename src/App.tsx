import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState, Suspense, lazy } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { useTimerEngine, type UnlockEvent } from '@/hooks/useTimerEngine'
import { UnlockModal } from '@/components/collection/UnlockModal'
import Dashboard from '@/pages/Dashboard'

const Gallery = lazy(() => import('@/pages/Gallery'))
const Statistics = lazy(() => import('@/pages/Statistics'))
const Certificates = lazy(() => import('@/pages/Certificates'))
const Profile = lazy(() => import('@/pages/Profile'))
const Settings = lazy(() => import('@/pages/Settings'))
const Leaderboard = lazy(() => import('@/pages/Leaderboard'))

function PageFallback() {
  return <div className="p-10 text-center text-sm text-zinc-400">Loading...</div>
}

function App() {
  useTheme()
  const profile = useAuthStore((s) => s.profile)
  const [unlockEvent, setUnlockEvent] = useState<UnlockEvent | null>(null)

  // Mounted once at the root so the Pomodoro keeps ticking across page navigation.
  useTimerEngine((event) => setUnlockEvent(event))

  // Auto cloud sync every 30s while "logged in", per spec.
  useEffect(() => {
    if (!profile) return
    const interval = setInterval(() => void useSyncStore.getState().triggerSync(), 30_000)
    return () => clearInterval(interval)
  }, [profile])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route
            path="gallery"
            element={
              <Suspense fallback={<PageFallback />}>
                <Gallery />
              </Suspense>
            }
          />
          <Route
            path="statistics"
            element={
              <Suspense fallback={<PageFallback />}>
                <Statistics />
              </Suspense>
            }
          />
          <Route
            path="certificates"
            element={
              <Suspense fallback={<PageFallback />}>
                <Certificates />
              </Suspense>
            }
          />
          <Route
            path="leaderboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <Leaderboard />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<PageFallback />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <UnlockModal event={unlockEvent} onClose={() => setUnlockEvent(null)} />
    </BrowserRouter>
  )
}

export default App
