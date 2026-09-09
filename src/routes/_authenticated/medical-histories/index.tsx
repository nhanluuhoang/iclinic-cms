import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { MedicalHistories } from '@/features/medical-histories'

const stringParam = z
  .union([z.string(), z.number()])
  .transform(String)
  .optional()
  .catch('')

export const Route = createFileRoute('/_authenticated/medical-histories/')({
  validateSearch: z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),
    patientName: stringParam,
    doctorName: stringParam,
    date: stringParam,
    sort: stringParam,
  }),
  component: MedicalHistories,
})
