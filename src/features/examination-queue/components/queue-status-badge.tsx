import { Badge } from '@/components/ui/badge'
import { type QueueStatus } from '../api'
import { statusMeta } from '../data/data'

export function QueueStatusBadge({ status }: { status: QueueStatus }) {
  const meta = statusMeta[status]
  return (
    <Badge variant='outline' className={meta.className}>
      {meta.label}
    </Badge>
  )
}
