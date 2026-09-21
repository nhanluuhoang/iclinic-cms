import { createFileRoute } from '@tanstack/react-router'
import { YearlyDashboard } from '@/features/dashboard/yearly'

export const Route = createFileRoute('/_authenticated/yearly-statistics/')({
  component: YearlyDashboard,
})
