import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ClipboardCheck,
  ListOrdered,
  Megaphone,
  Plus,
  Stethoscope,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePickerInput } from '@/components/date-picker-input'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  callNext,
  changeQueueStatus,
  checkIn,
  getQueue,
  getQueueDashboard,
  type QueueStatus,
} from './api'
import { CreateQueueDialog } from './components/create-queue-dialog'
import { QueueOverview } from './components/queue-overview'
import { QueueTable } from './components/queue-table'
import { activeQueueStatuses, processedQueueStatuses } from './data/data'
import { showQueueError, today } from './utils'

type QueueTab = 'active' | 'processed'
const PAGE_SIZE = 20

export function ExaminationQueue() {
  const [queueDate, setQueueDate] = useState(today)
  const [createOpen, setCreateOpen] = useState(false)
  const [tab, setTab] = useState<QueueTab>('active')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const statuses =
    tab === 'active' ? activeQueueStatuses : processedQueueStatuses
  const queryClient = useQueryClient()
  const queue = useQuery({
    queryKey: [
      'examination-queue',
      'list',
      queueDate,
      tab,
      statuses,
      page,
      debouncedSearch,
    ],
    queryFn: () =>
      getQueue({
        queueDate,
        statuses,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      }),
  })
  const dashboard = useQuery({
    queryKey: ['examination-queue', 'dashboard', queueDate],
    queryFn: () => getQueueDashboard(queueDate),
  })

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['examination-queue'] })
  const callNextMutation = useMutation({
    mutationFn: () => callNext(queueDate),
    onSuccess: () => {
      toast.success('Đã gọi bệnh nhân tiếp theo')
      refresh()
    },
    onError: showQueueError,
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) =>
      changeQueueStatus(id, status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      if ((queue.data?.data.length ?? 0) === 1 && page > 1) {
        setPage(page - 1)
      }
      refresh()
    },
    onError: showQueueError,
  })
  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success('Check-in thành công')
      refresh()
    },
    onError: showQueueError,
  })

  const activeCount = activeQueueStatuses.reduce(
    (total, status) => total + (dashboard.data?.counts[status] ?? 0),
    0
  )
  const processedCount = processedQueueStatuses.reduce(
    (total, status) => total + (dashboard.data?.counts[status] ?? 0),
    0
  )

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
            <h2 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
              <ListOrdered className='size-6' /> Thứ tự khám
            </h2>
            <p className='text-muted-foreground'>
              Tiếp nhận và điều phối lượt khám trong ngày.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <DatePickerInput
              className='w-52'
              value={queueDate}
              onChange={(value) => {
                setQueueDate(value)
                setPage(1)
              }}
              minDate={today()}
            />
            <Button variant='outline' onClick={() => setCreateOpen(true)}>
              <Plus /> Tiếp nhận
            </Button>
            <Button
              onClick={() => callNextMutation.mutate()}
              disabled={callNextMutation.isPending}
            >
              <Megaphone /> Gọi tiếp theo
            </Button>
          </div>
        </div>

        <QueueOverview dashboard={dashboard.data} />
        <div
          role='tablist'
          className='inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-muted p-[3px] text-muted-foreground'
        >
          {[
            {
              value: 'active' as const,
              label: `Đang khám (${activeCount})`,
              icon: Stethoscope,
            },
            {
              value: 'processed' as const,
              label: `Đã xử lý (${processedCount})`,
              icon: ClipboardCheck,
            },
          ].map((item) => {
            const isActive = tab === item.value
            return (
              <button
                key={item.value}
                role='tab'
                type='button'
                aria-selected={isActive}
                onClick={() => {
                  setTab(item.value)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
                  'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                  isActive
                    ? 'bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30'
                    : 'hover:text-foreground'
                )}
              >
                <item.icon className='size-4' />
                {item.label}
              </button>
            )
          })}
        </div>
        <div className='flex flex-1 flex-col gap-4'>
          <Input
            className='h-8 w-[150px] lg:w-[250px]'
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder='Tìm bệnh nhân, lý do khám...'
          />
          <QueueTable
            data={queue.data?.data ?? []}
            isLoading={queue.isLoading}
            isPending={statusMutation.isPending || checkInMutation.isPending}
            onStatus={(id, status) => statusMutation.mutate({ id, status })}
            onCheckIn={(id) => checkInMutation.mutate(id)}
            page={page}
            total={queue.data?.total ?? 0}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            showActions={tab === 'active'}
            emptyMessage={
              tab === 'active'
                ? 'Không có bệnh nhân đang chờ xử lý.'
                : 'Chưa có lượt khám đã xử lý.'
            }
          />
        </div>
      </Main>
      <CreateQueueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        queueDate={queueDate}
        onCreated={refresh}
      />
    </>
  )
}
