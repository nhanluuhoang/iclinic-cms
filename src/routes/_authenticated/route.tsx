import { createFileRoute, redirect } from '@tanstack/react-router'
import { Profile } from '@/features/auth/api'
import { canAccessPath } from '@/config/access-control'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()
    let user = auth.user
    if (!auth.user) {
      try {
        const profile = await Profile()
        auth.setUser(profile.data)
        user = profile.data
      } catch {
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }

    if (!canAccessPath(user?.role, location.pathname)) {
      throw redirect({ to: '/403' })
    }
  },
  component: AuthenticatedLayout,
})
