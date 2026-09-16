import { createFileRoute } from '@tanstack/react-router'
import { LandingConfigPage } from '@/features/landing-config'

export const Route = createFileRoute('/_authenticated/landing-config/')({
  component: LandingConfigPage,
})
