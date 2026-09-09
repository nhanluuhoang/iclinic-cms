import { createFileRoute } from '@tanstack/react-router'
import { MonthlyDashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/monthly-statistics/')({
  component: MonthlyDashboard,
})
