import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { MasterData } from '@/features/master-data'

const masterDataSearchSchema = z.object({
  page: z.number().optional().catch(1),
  sort: z.string().optional().catch(''),
  key: z.string().optional(),
  searchKey: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/master-data/')({
  validateSearch: masterDataSearchSchema,
  component: MasterData,
})
