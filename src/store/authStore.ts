import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types'
import * as authApi from '@/services/mockAuthApi'

interface AuthState {
  profile: UserProfile | null
  token: string | null
  isLoading: boolean
  error: string | null

  register: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  logout: () => void
  updateProfile: (patch: Partial<UserProfile>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      token: null,
      isLoading: false,
      error: null,

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null })
        try {
          const { profile, token } = await authApi.registerWithEmail(email, password, displayName)
          set({ profile, token, isLoading: false })
        } catch (e) {
          set({ error: (e as Error).message, isLoading: false })
          throw e
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { profile, token } = await authApi.loginWithEmail(email, password)
          set({ profile, token, isLoading: false })
        } catch (e) {
          set({ error: (e as Error).message, isLoading: false })
          throw e
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })
        const { profile, token } = await authApi.loginWithGoogle()
        set({ profile, token, isLoading: false })
      },

      sendMagicLink: async (email) => {
        await authApi.sendMagicLink(email)
      },

      logout: () => set({ profile: null, token: null }),

      updateProfile: (patch) =>
        set((state) => ({ profile: state.profile ? { ...state.profile, ...patch } : null })),
    }),
    { name: 'pomodoro-odyssey:auth' },
  ),
)
