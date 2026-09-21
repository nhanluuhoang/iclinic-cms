import { createFileRoute } from '@tanstack/react-router'
import { ClinicDaysOff } from '@/features/clinic-days-off'

export const Route = createFileRoute('/_authenticated/clinic-days-off/')({
  component: ClinicDaysOff,
})
