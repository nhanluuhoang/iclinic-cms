import { CalendarClock, CheckCircle2, Clock3, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type QueueDashboard } from '../api'
import { QueueHighlight } from './queue-highlight'

export function QueueOverview({ dashboard }: { dashboard?: QueueDashboard }) {
  const counts = dashboard?.counts ?? {}
  const stats = [
    { label: 'Đã đặt lịch', value: counts.BOOKED ?? 0, icon: CalendarClock },
    { label: 'Đang chờ', value: counts.WAITING ?? 0, icon: Clock3 },
    {
      label: 'Đang phục vụ',
      value: (counts.CALLED ?? 0) + (counts.IN_EXAMINATION ?? 0),
      icon: Stethoscope,
    },
    { label: 'Hoàn tất', value: counts.COMPLETED ?? 0, icon: CheckCircle2 },
  ]

  return (
    <>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.label} className='py-4'>
            <CardContent className='flex items-center justify-between px-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{stat.label}</p>
                <p className='text-2xl font-bold'>{stat.value}</p>
              </div>
              <stat.icon className='size-5 text-muted-foreground' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='py-4'>
          <CardHeader className='px-4'>
            <CardTitle className='text-base'>Đang phục vụ</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-2 px-4'>
            {(dashboard?.serving ?? []).length ? (
              dashboard?.serving.map((item) => (
                <QueueHighlight key={item.id} item={item} />
              ))
            ) : (
              <p className='text-sm text-muted-foreground'>
                Chưa có bệnh nhân đang được gọi hoặc khám.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className='py-4'>
          <CardHeader className='px-4'>
            <CardTitle className='text-base'>Lượt kế tiếp dự kiến</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            {dashboard?.next ? (
              <QueueHighlight item={dashboard.next} />
            ) : (
              <p className='text-sm text-muted-foreground'>
                Không còn bệnh nhân đang chờ.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
