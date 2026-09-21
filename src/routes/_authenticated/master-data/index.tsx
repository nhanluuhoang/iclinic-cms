import { createFileRoute } from '@tanstack/react-router'
import { MasterData } from '@/features/master-data'

export const Route = createFileRoute('/_authenticated/master-data/')({
  component: MasterData,
})
