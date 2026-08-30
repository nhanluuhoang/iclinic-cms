import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Admins } from '@/features/admins'

const adminsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  fullName: z.string().optional().catch(''),
  phone: z.string().optional().catch(''),
  gender: z.string().optional().catch(''),
  sort: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/admins/')({
  validateSearch: adminsSearchSchema,
  component: Admins,
})
