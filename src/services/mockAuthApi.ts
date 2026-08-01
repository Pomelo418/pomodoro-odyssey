// MOCK auth backend. Persists a fake "users table" to localStorage so
// register/login feel real within a browser session. No real password
// hashing, JWTs, or network calls happen here — swap for real endpoints later.
import { mockDelay } from './mockDelay'
import type { UserProfile } from '@/types'

interface StoredAccount {
  email: string
  password: string
  profile: UserProfile
}

const ACCOUNTS_KEY = 'pomodoro-odyssey:mock-accounts'

function loadAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]')
  } catch {
    return []
  }
}
function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function makeProfile(email: string, displayName: string): UserProfile {
  return {
    id: crypto.randomUUID(),
    username: email.split('@')[0],
    displayName,
    email,
    bio: '',
    socialLinks: {},
    privacy: {
      profileVisible: true,
      leaderboardOptIn: true,
      hideStreak: false,
      anonymousMode: false,
    },
    createdAt: new Date().toISOString(),
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<{ profile: UserProfile; token: string }> {
  const accounts = loadAccounts()
  if (accounts.some((a) => a.email === email)) {
    throw new Error('An account with that email already exists.')
  }
  const profile = makeProfile(email, displayName)
  accounts.push({ email, password, profile })
  saveAccounts(accounts)
  return mockDelay({ profile, token: `mock-jwt-${profile.id}` }, 500)
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ profile: UserProfile; token: string }> {
  const account = loadAccounts().find((a) => a.email === email && a.password === password)
  if (!account) throw new Error('Invalid email or password.')
  return mockDelay({ profile: account.profile, token: `mock-jwt-${account.profile.id}` }, 500)
}

export async function loginWithGoogle(): Promise<{ profile: UserProfile; token: string }> {
  const profile = makeProfile('demo.user@gmail.com', 'Demo User')
  return mockDelay({ profile, token: `mock-jwt-${profile.id}` }, 700)
}

export async function sendMagicLink(email: string): Promise<{ sent: true }> {
  void email
  return mockDelay({ sent: true }, 500)
}

export async function requestPasswordReset(email: string): Promise<{ sent: true }> {
  void email
  return mockDelay({ sent: true }, 500)
}
