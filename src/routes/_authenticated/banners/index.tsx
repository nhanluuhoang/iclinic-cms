import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Banners } from '@/features/banners'

const bannerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  isPublic: z.boolean().optional(),
  sort: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/banners/')({
  validateSearch: bannerSearchSchema,
  component: Banners,
})
