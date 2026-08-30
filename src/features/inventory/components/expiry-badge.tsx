import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { expiryMeta } from '../data/data'
import { daysUntil, formatDate, getExpiryStatus } from '../utils'

export function ExpiryBadge({
  date,
  showDate = true,
  className,
}: {
  date: string | null
  showDate?: boolean
  className?: string
}) {
  if (!date) {
    return <span className='text-muted-foreground'>—</span>
  }

  const status = getExpiryStatus(date)
  const meta = expiryMeta(status)
  const days = daysUntil(date)

  const remark =
    status === 'expired'
      ? `quá ${Math.abs(days)} ngày`
      : days === 0
        ? 'hết hạn hôm nay'
        : `còn ${days} ngày`

  return (
    <div className={cn('flex items-center gap-2 whitespace-nowrap', className)}>
      {showDate && <span className='tabular-nums'>{formatDate(date)}</span>}
      <Badge
        variant='outline'
        className={cn('gap-1 font-normal', meta.badgeClass)}
      >
        <meta.icon className='size-3' />
        {remark}
      </Badge>
    </div>
  )
}
