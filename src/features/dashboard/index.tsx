import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  Banknote,
  Package,
  Pill,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerInput } from '@/components/date-picker-input'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  getQueueDashboard,
  type QueueDashboard,
  type QueueStatus,
} from '@/features/examination-queue/api'

const today = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const statusMeta: Array<{
  status: QueueStatus
  label: string
  color: string
}> = [
  { status: 'BOOKED', label: 'Đã đặt lịch', color: '#3b82f6' },
  { status: 'WAITING', label: 'Đang chờ', color: '#f59e0b' },
  { status: 'CALLED', label: 'Đã gọi', color: '#8b5cf6' },
  { status: 'IN_EXAMINATION', label: 'Đang khám', color: '#06b6d4' },
  { status: 'COMPLETED', label: 'Hoàn tất', color: '#22c55e' },
  { status: 'CANCELLED', label: 'Đã hủy', color: '#ef4444' },
  { status: 'SKIPPED', label: 'Bỏ qua', color: '#64748b' },
  { status: 'NO_SHOW', label: 'Vắng mặt', color: '#f97316' },
]

function SummaryCards({ dashboard }: { dashboard?: QueueDashboard }) {
  const cards = [
    {
      label: 'Tổng lượt khám', value: dashboard?.billing.invoiceCount ?? 0, icon: Users, money: false,
    },
    {
      label: 'Tổng thu', value: dashboard?.billing.totalAmount ?? 0, icon: Banknote, money: true,
    },
    {
      label: 'Tiền thuốc bán ra', value: dashboard?.billing.medicineRevenue ?? 0, icon: Pill, money: true,
    },
    {
      label: 'Giá vốn thuốc', value: dashboard?.billing.medicineCost ?? 0, icon: Package, money: true,
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>{card.label}</CardTitle>
            <card.icon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold tabular-nums'>
              {card.money
                ? `${new Intl.NumberFormat('vi-VN').format(card.value)} ₫`
                : card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function Dashboard() {
  const [date, setDate] = useState(today)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', date],
    queryFn: () => getQueueDashboard(date),
  })
  const chartData = statusMeta.map((item) => ({
    ...item,
    total: data?.counts[item.status] ?? 0,
  }))

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Thống kê</h1>
            <p className='text-muted-foreground'>
              Tổng quan hoạt động khám bệnh theo ngày.
            </p>
          </div>
          <div className='w-full space-y-1.5 sm:w-52'>
            <label className='flex items-center gap-1.5 text-sm font-medium'>
              <CalendarDays className='size-4' /> Ngày thống kê
            </label>
            <DatePickerInput value={date} onChange={setDate} />
          </div>
        </div>

        {isError && (
          <p className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            Không thể tải dữ liệu thống kê. Vui lòng thử lại.
          </p>
        )}

        <div className={isLoading ? 'animate-pulse opacity-60' : undefined}>
          <SummaryCards dashboard={data} />
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Phân bổ trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={320}>
                <BarChart data={chartData} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    interval={0}
                    angle={-20}
                    textAnchor='end'
                    height={65}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey='total' name='Số lượt' fill='currentColor' radius={[4, 4, 0, 0]} className='fill-primary' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đang phục vụ</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {data?.serving.length ? (
                data.serving.map((entry) => (
                  <div key={entry.id} className='rounded-md border p-3'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='font-medium'>{entry.patient.fullName}</p>
                      <span className='text-sm font-semibold tabular-nums'>
                        #{entry.queueNumber ?? '—'}
                      </span>
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {entry.doctor?.fullName ?? 'Chưa phân công bác sĩ'}
                    </p>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Không có bệnh nhân đang phục vụ trong ngày này.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
