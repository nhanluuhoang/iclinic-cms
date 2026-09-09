import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  phone?: string
  fullName?: string
  dateOfBirth?: string
  gender?: number
  isSuperAdmin: boolean
  role?: string
  tenant?: {
    servicePlan: 'BASIC' | 'PLUS' | 'PRO'
  } | null
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    setUser: (user) =>
      set((state) => ({ ...state, auth: { ...state.auth, user } })),
    reset: () =>
      set((state) => ({
        ...state,
        auth: { ...state.auth, user: null },
      })),
  },
}))
