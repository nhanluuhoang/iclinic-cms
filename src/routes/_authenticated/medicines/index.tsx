import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Medicines } from '@/features/medicines'

const medicinesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(15),
  sort: z.string().optional().catch(''),
  filter: z.string().optional().catch(''),
  group: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/medicines/')({
  validateSearch: medicinesSearchSchema,
  component: Medicines,
})
