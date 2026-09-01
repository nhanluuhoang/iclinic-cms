import { type QueueEntry } from '../api'
import { QueueStatusBadge } from './queue-status-badge'

export function QueueHighlight({ item }: { item: QueueEntry }) {
  return (
    <div className='flex items-center justify-between rounded-lg border p-3'>
      <div>
        <p className='font-medium'>{item.patient.fullName}</p>
        <p className='text-xs text-muted-foreground'>
          {item.reason || 'Không ghi lý do'}
        </p>
      </div>
      <div className='text-right'>
        <p className='text-xl font-bold'>#{item.queueNumber ?? '—'}</p>
        <QueueStatusBadge status={item.status} />
      </div>
    </div>
  )
}
