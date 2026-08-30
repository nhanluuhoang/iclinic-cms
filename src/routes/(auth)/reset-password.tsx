import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/reset-password'

const searchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  component: ResetPassword,
  validateSearch: searchSchema,
})
