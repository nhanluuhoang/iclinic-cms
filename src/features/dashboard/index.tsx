import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Banknote, CalendarDays, Package, Pill, Users } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatePickerInput } from '@/components/date-picker-input'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  getQueueDashboard,
  getMonthlyQueueDashboard,
  type QueueDashboard,
} from '@/features/examination-queue/api'
import {
  formatDashboardMoney as formatMoney,
  getCurrentMonth,
  getToday,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
} from './utils'

function DailyRevenueChart({
  dashboard,
  periodLabel,
}: {
  dashboard?: QueueDashboard
  periodLabel: string
}) {
  const chartData = [
    {
      name: 'Thuốc',
      value: dashboard?.billing.medicineRevenue ?? 0,
      color: '#2f66d8',
    },
    {
      name: 'Khám',
      value: dashboard?.billing.consultationRevenue ?? 0,
      color: '#32b890',
    },
  ]

  if (!chartData.some((item) => item.value > 0)) {
    return (
      <div className='flex h-[320px] flex-col items-center justify-center gap-1'>
        <span className='text-sm text-muted-foreground'>
          Tổng thu {periodLabel}
        </span>
        <strong className='text-xl tabular-nums'>
          {formatMoney(dashboard?.billing.totalAmount ?? 0)} VNĐ
        </strong>
      </div>
    )
  }

  return (
    <>
      <div className='relative'>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='48%'
              innerRadius={58}
              outerRadius={125}
              paddingAngle={2}
              stroke='hsl(var(--card))'
              strokeWidth={3}
              labelLine={{ stroke: 'hsl(var(--foreground))' }}
              label={({ value }) => formatMoney(Number(value))}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${formatMoney(Number(value))} VNĐ`,
                'Doanh thu',
              ]}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute top-[48%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
          <span className='text-xs text-muted-foreground'>
            Tổng thu {periodLabel}
          </span>
          <strong className='text-sm whitespace-nowrap tabular-nums'>
            {formatMoney(dashboard?.billing.totalAmount ?? 0)} VNĐ
          </strong>
        </div>
      </div>
      <div className='flex items-center justify-center gap-4 text-sm'>
        {chartData.map((entry) => (
          <div key={entry.name} className='flex items-center gap-2'>
            <span
              className='size-2.5 rounded-sm'
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function SummaryCards({ dashboard }: { dashboard?: QueueDashboard }) {
  const cards = [
    {
      label: 'Tổng lượt khám',
      value: dashboard?.billing.invoiceCount ?? 0,
      icon: Users,
      money: false,
    },
    {
      label: 'Tổng thu',
      value: dashboard?.billing.totalAmount ?? 0,
      icon: Banknote,
      money: true,
    },
    {
      label: 'Tiền thuốc bán ra',
      value: dashboard?.billing.medicineRevenue ?? 0,
      icon: Pill,
      money: true,
    },
    {
      label: 'Giá vốn thuốc',
      value: dashboard?.billing.medicineCost ?? 0,
      icon: Package,
      money: true,
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
              {card.money ? `${formatMoney(card.value)} VNĐ` : card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StatisticsPage({ period }: { period: 'day' | 'month' }) {
  const isMonthly = period === 'month'
  const [selectedPeriod, setSelectedPeriod] = useState(
    isMonthly ? getCurrentMonth : getToday
  )
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', period, selectedPeriod, isMonthly],
    queryFn: () =>
      isMonthly
        ? getMonthlyQueueDashboard(selectedPeriod)
        : getQueueDashboard(selectedPeriod),
    enabled: isMonthly
      ? /^\d{4}-\d{2}$/.test(selectedPeriod)
      : /^\d{4}-\d{2}-\d{2}$/.test(selectedPeriod),
  })
  const periodLabel = isMonthly ? 'trong tháng' : 'trong ngày'
  const totalMedicineQuantity =
    data?.medicineUsage.reduce(
      (total, medicine) => total + medicine.quantity,
      0
    ) ?? 0

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
              Tổng quan hoạt động khám bệnh {periodLabel}.
            </p>
          </div>
          <div className='w-full space-y-1.5 sm:w-auto'>
            <label className='flex items-center gap-1.5 text-sm font-medium'>
              <CalendarDays className='size-4' />{' '}
              {isMonthly ? 'Tháng thống kê' : 'Ngày thống kê'}
            </label>
            {isMonthly ? (
              <div className='grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm sm:flex'>
                <Select
                  value={selectedPeriod.slice(5, 7)}
                  onValueChange={(month) =>
                    setSelectedPeriod(`${selectedPeriod.slice(0, 4)}-${month}`)
                  }
                >
                  <SelectTrigger className='w-full min-w-0 border-0 shadow-none sm:w-36'>
                    <SelectValue placeholder='Chọn tháng' />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='my-1 w-px bg-border' />
                <Select
                  value={selectedPeriod.slice(0, 4)}
                  onValueChange={(year) =>
                    setSelectedPeriod(`${year}-${selectedPeriod.slice(5, 7)}`)
                  }
                >
                  <SelectTrigger className='w-full min-w-0 border-0 shadow-none sm:w-36'>
                    <SelectValue placeholder='Chọn năm' />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        Năm {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <DatePickerInput
                value={selectedPeriod}
                onChange={setSelectedPeriod}
              />
            )}
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

        <Card>
          <CardHeader>
            <CardTitle>Thống kê {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-6 lg:grid-cols-2 lg:divide-x'>
            <div>
              <h3 className='mb-2 text-sm font-medium'>Cơ cấu doanh thu</h3>
              <DailyRevenueChart dashboard={data} periodLabel={periodLabel} />
            </div>
            <div className='min-w-0 lg:pl-6'>
              <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                <h3 className='text-sm font-medium'>
                  Thuốc sử dụng {periodLabel}
                </h3>
                <div className='rounded-md bg-primary/10 px-3 py-1.5 text-sm text-primary'>
                  Tổng số lượng:{' '}
                  <strong className='tabular-nums'>
                    {formatMoney(totalMedicineQuantity)}
                  </strong>
                </div>
              </div>
              <div className='max-h-[340px] overflow-auto rounded-md border'>
                <Table>
                  <TableHeader className='sticky top-0 bg-card'>
                    <TableRow>
                      <TableHead>Thuốc</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className='text-right'>Số lượng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.medicineUsage.length ? (
                      data.medicineUsage.map((medicine) => (
                        <TableRow
                          key={medicine.medicineId ?? medicine.medicineName}
                        >
                          <TableCell className='max-w-64 truncate font-medium'>
                            {medicine.medicineName}
                          </TableCell>
                          <TableCell>{medicine.unit || '-'}</TableCell>
                          <TableCell className='text-right font-semibold tabular-nums'>
                            {formatMoney(medicine.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='h-24 text-center text-muted-foreground'
                        >
                          Chưa có thuốc được sử dụng {periodLabel} này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

export function Dashboard() {
  return <StatisticsPage period='day' />
}

export function MonthlyDashboard() {
  return <StatisticsPage period='month' />
}
