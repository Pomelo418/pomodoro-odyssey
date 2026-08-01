import { NavLink, Outlet } from 'react-router-dom'
import {
  Timer as TimerIcon,
  LayoutGrid,
  BarChart3,
  Award,
  User,
  Trophy,
  Settings as SettingsIcon,
  Moon,
  Sun,
} from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { SyncIndicator } from '@/components/shared/SyncIndicator'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: TimerIcon, end: true },
  { to: '/gallery', label: 'Gallery', icon: LayoutGrid },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function AppShell() {
  const theme = useSettingsStore((s) => s.theme)
  const update = useSettingsStore((s) => s.update)

  function toggleTheme() {
    update({ theme: theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 text-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200/60 bg-white/70 px-4 py-3 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍅</span>
          <span className="font-heading text-base font-semibold">Pomodoro Odyssey</span>
        </div>
        <div className="flex items-center gap-2">
          <SyncIndicator />
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:scale-105 dark:bg-zinc-800 dark:text-zinc-300"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <nav className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 flex-col gap-1 border-r border-zinc-200/60 p-3 md:flex dark:border-zinc-800/60">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-zinc-200/60 bg-white/90 py-2 backdrop-blur md:hidden dark:border-zinc-800/60 dark:bg-zinc-950/90">
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 text-[10px] ${
                isActive ? 'text-violet-500' : 'text-zinc-400'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
