import { createFileRoute } from '@tanstack/react-router'
import { PrescriptionTemplates } from '@/features/prescription-templates'

export const Route = createFileRoute('/_authenticated/prescription-templates/')(
  { component: PrescriptionTemplates }
)
