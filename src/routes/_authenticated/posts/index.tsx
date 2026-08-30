import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import Posts from '@/features/posts'

const postSearchSchema = z.object({
  page: z.number().optional().catch(0),
  isPublic: z.boolean().optional(),
  title: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/posts/')({
  validateSearch: postSearchSchema,
  component: Posts,
})
