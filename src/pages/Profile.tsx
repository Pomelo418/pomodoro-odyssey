import { useState } from 'react'
import { LogOut, AtSign, Code2, MessageCircle, Camera } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { shareProfile } from '@/services/shareService'

function AuthForm() {
  const { login, register, loginWithGoogle, sendMagicLink, isLoading, error } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register' | 'magic'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'login') await login(email, password)
    else if (mode === 'register') await register(email, password, displayName || email.split('@')[0])
    else {
      await sendMagicLink(email)
      setMagicSent(true)
    }
  }

  return (
    <div className="glass mx-auto max-w-sm rounded-2xl p-6">
      <h2 className="mb-1 text-center font-heading text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        {mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : 'Magic link'}
      </h2>
      <p className="mb-4 text-center text-xs text-zinc-400">
        Mock authentication — no real backend yet, but flows work end-to-end locally.
      </p>

      {magicSent ? (
        <p className="text-center text-sm text-emerald-500">
          Magic link "sent" to {email}. (Mocked — just log in normally to continue.)
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          />
          {mode !== 'magic' && (
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
            />
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-violet-400 py-2 text-sm font-medium text-white transition hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Log in' : mode === 'register' ? 'Register' : 'Send magic link'}
          </button>
        </form>
      )}

      <button
        onClick={() => void loginWithGoogle()}
        className="mt-3 w-full rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 transition hover:border-violet-300 dark:border-zinc-700 dark:text-zinc-300"
      >
        Continue with Google
      </button>

      <div className="mt-3 flex justify-center gap-3 text-xs text-violet-500">
        {mode !== 'login' && <button onClick={() => setMode('login')}>Log in</button>}
        {mode !== 'register' && <button onClick={() => setMode('register')}>Register</button>}
        {mode !== 'magic' && <button onClick={() => setMode('magic')}>Magic link</button>}
      </div>
    </div>
  )
}

export default function Profile() {
  const { profile, logout, updateProfile } = useAuthStore()

  if (!profile) return <AuthForm />

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="glass flex items-center gap-4 rounded-2xl p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-fuchsia-300 text-2xl font-semibold text-white">
          {profile.displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <input
            value={profile.displayName}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
            className="w-full bg-transparent font-heading text-lg font-semibold text-zinc-800 outline-none dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-400">@{profile.username}</p>
        </div>
        <button onClick={logout} className="text-zinc-400 hover:text-red-400" aria-label="Log out">
          <LogOut size={18} />
        </button>
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-2 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Bio
        </h2>
        <textarea
          maxLength={160}
          value={profile.bio}
          onChange={(e) => updateProfile({ bio: e.target.value })}
          placeholder="A short quote about your focus journey..."
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white/70 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          rows={2}
        />
        <p className="text-right text-[10px] text-zinc-400">{profile.bio.length}/160</p>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-2 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Social Links
        </h2>
        {(
          [
            ['twitter', AtSign],
            ['github', Code2],
            ['discord', MessageCircle],
            ['instagram', Camera],
          ] as const
        ).map(([key, Icon]) => (
          <div key={key} className="mb-2 flex items-center gap-2">
            <Icon size={15} className="text-zinc-400" />
            <input
              value={profile.socialLinks[key] ?? ''}
              onChange={(e) =>
                updateProfile({ socialLinks: { ...profile.socialLinks, [key]: e.target.value } })
              }
              placeholder={`${key} username`}
              className="flex-1 rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
            />
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-2 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Privacy
        </h2>
        {[
          ['profileVisible', 'Public profile visible'],
          ['leaderboardOptIn', 'Appear on leaderboards'],
          ['hideStreak', 'Hide streak from others'],
          ['anonymousMode', 'Anonymous mode'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">{label}</span>
            <input
              type="checkbox"
              checked={profile.privacy[key as keyof typeof profile.privacy]}
              onChange={(e) =>
                updateProfile({ privacy: { ...profile.privacy, [key]: e.target.checked } })
              }
              className="h-4 w-4 accent-violet-500"
            />
          </label>
        ))}
      </section>

      <button
        onClick={() => shareProfile(profile)}
        className="rounded-lg bg-violet-400 py-2 text-sm font-medium text-white transition hover:scale-[1.02]"
      >
        Share my profile
      </button>
    </div>
  )
}
