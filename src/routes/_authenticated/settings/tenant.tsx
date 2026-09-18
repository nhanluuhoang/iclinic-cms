import { createFileRoute } from '@tanstack/react-router'
import { SettingsTenant } from '@/features/settings/tenant'

export const Route = createFileRoute('/_authenticated/settings/tenant')({
  component: SettingsTenant,
})
