import { createFileRoute } from '@tanstack/react-router'
import { Prescriptions } from '@/features/prescriptions'

export const Route = createFileRoute('/_authenticated/prescriptions/')({
  component: Prescriptions,
})
