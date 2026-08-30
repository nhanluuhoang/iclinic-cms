import { createFileRoute } from '@tanstack/react-router'
import { ExaminationQueue } from '@/features/examination-queue'

export const Route = createFileRoute('/_authenticated/examination-queue/')({
  component: ExaminationQueue,
})
