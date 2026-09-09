import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Banknote, CalendarDays, Pill, Stethoscope, Users } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getYearlyQueueDashboard } from '@/features/examination-queue/api'
import {
  formatDashboardMoney as formatMoney,
  getCurrentYear,
  YEAR_OPTIONS,
} from './utils'

export function YearlyDashboard() {
  const [year, setYear] = useState(getCurrentYear)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'year', year],
    queryFn: () => getYearlyQueueDashboard(year),
    enabled: /^\d{4}$/.test(year),
  })
  const chartData = (data?.monthlyRevenue ?? []).map((item) => ({
    ...item,
    label: `Tháng ${item.month}`,
  }))
  const cards = [
    {
      label: 'Tổng lượt khám',
      value: data?.billing.invoiceCount ?? 0,
      icon: Users,
      money: false,
    },
    {
      label: 'Tổng thu trong năm',
      value: data?.billing.totalAmount ?? 0,
      icon: Banknote,
      money: true,
    },
    {
      label: 'Doanh thu thuốc',
      value: data?.billing.medicineRevenue ?? 0,
      icon: Pill,
      money: true,
    },
    {
      label: 'Doanh thu khám',
      value: data?.billing.consultationRevenue ?? 0,
      icon: Stethoscope,
      money: true,
    },
  ]

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
            <h1 className='text-2xl font-bold tracking-tight'>Thống kê năm</h1>
            <p className='text-muted-foreground'>
              Tổng quan doanh thu của từng tháng trong năm.
            </p>
          </div>
          <div className='w-full space-y-1.5 sm:w-auto'>
            <label className='flex items-center gap-1.5 text-sm font-medium'>
              <CalendarDays className='size-4' /> Năm thống kê
            </label>
            <div className='rounded-lg border bg-card p-1.5 shadow-sm'>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className='w-36 border-0 font-semibold shadow-none'>
                  <SelectValue placeholder='Chọn năm' />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      Năm {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isError && (
          <p className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            Không thể tải dữ liệu thống kê. Vui lòng thử lại.
          </p>
        )}

        <div
          className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${isLoading ? 'animate-pulse opacity-60' : ''}`}
        >
          {cards.map((card) => (
            <Card key={card.label}>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {card.label}
                </CardTitle>
                <card.icon className='size-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold tabular-nums'>
                  {card.money
                    ? `${formatMoney(card.value)} VNĐ`
                    : formatMoney(card.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu từng tháng năm {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={380}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={85}
                  tickFormatter={(value) => formatMoney(Number(value))}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${formatMoney(Number(value))} VNĐ`,
                    name,
                  ]}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey='totalAmount'
                  name='Tổng thu'
                  fill='#2f66d8'
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
