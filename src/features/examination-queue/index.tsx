import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListOrdered,
  Megaphone,
  Plus,
  Stethoscope,
  UserRoundCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Textarea } from '@/components/ui/textarea'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  callNext,
  changeQueueStatus,
  checkIn,
  createQueueEntry,
  getPatients,
  getQueue,
  getQueueDashboard,
  type QueueEntry,
  type QueueStatus,
} from './api'

const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

const statusMeta: Record<QueueStatus, { label: string; className: string }> = {
  BOOKED: {
    label: 'Đã đặt lịch',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  WAITING: {
    label: 'Đang chờ',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  CALLED: {
    label: 'Đã gọi',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  IN_EXAMINATION: {
    label: 'Đang khám',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  SKIPPED: {
    label: 'Đã bỏ qua',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  NO_SHOW: {
    label: 'Không đến',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
}

const transitions: Partial<
  Record<QueueStatus, Array<{ label: string; status: QueueStatus }>>
> = {
  WAITING: [
    { label: 'Gọi khám', status: 'CALLED' },
    { label: 'Hủy', status: 'CANCELLED' },
  ],
  CALLED: [
    { label: 'Bắt đầu khám', status: 'IN_EXAMINATION' },
    { label: 'Bỏ qua', status: 'SKIPPED' },
    { label: 'Trở lại chờ', status: 'WAITING' },
  ],
  IN_EXAMINATION: [{ label: 'Hoàn tất', status: 'COMPLETED' }],
  SKIPPED: [{ label: 'Trở lại chờ', status: 'WAITING' }],
  BOOKED: [
    { label: 'Hủy', status: 'CANCELLED' },
    { label: 'Không đến', status: 'NO_SHOW' },
  ],
}

const formatTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export function ExaminationQueue() {
  const [queueDate, setQueueDate] = useState(today)
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()
  const queue = useQuery({
    queryKey: ['examination-queue', 'list', queueDate],
    queryFn: () => getQueue(queueDate),
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
    onError: showError,
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) =>
      changeQueueStatus(id, status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      refresh()
    },
    onError: showError,
  })
  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success('Check-in thành công')
      refresh()
    },
    onError: showError,
  })

  const counts = dashboard.data?.counts ?? {}
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
              <ListOrdered className='size-6' /> Hàng đợi khám
            </h2>
            <p className='text-muted-foreground'>
              Tiếp nhận và điều phối lượt khám trong ngày.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Input
              type='date'
              className='w-auto'
              value={queueDate}
              onChange={(e) => setQueueDate(e.target.value)}
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
              {(dashboard.data?.serving ?? []).length ? (
                dashboard.data?.serving.map((item) => (
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
              {dashboard.data?.next ? (
                <QueueHighlight item={dashboard.data.next} />
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Không còn bệnh nhân đang chờ.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className='gap-0 overflow-hidden py-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>Số thứ tự</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Lý do khám</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : (queue.data?.data ?? []).length ? (
                queue.data?.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='text-center text-lg font-bold'>
                      {item.queueNumber ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{item.patient.fullName}</div>
                      <div className='text-xs text-muted-foreground'>
                        {item.patient.phone || 'Không có SĐT'}
                        {item.isLate ? ' · Đến muộn' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.appointmentAt
                        ? `Hẹn ${formatTime(item.appointmentAt)}`
                        : `Đến ${formatTime(item.checkInAt)}`}
                    </TableCell>
                    <TableCell className='max-w-56 truncate'>
                      {item.reason || '—'}
                    </TableCell>
                    <TableCell>
                      <QueueStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <QueueActions
                        item={item}
                        pending={
                          statusMutation.isPending || checkInMutation.isPending
                        }
                        onStatus={(status) =>
                          statusMutation.mutate({ id: item.id, status })
                        }
                        onCheckIn={() => checkInMutation.mutate(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='h-24 text-center text-muted-foreground'
                  >
                    Chưa có lượt khám trong ngày.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
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

function QueueStatusBadge({ status }: { status: QueueStatus }) {
  const meta = statusMeta[status]
  return (
    <Badge variant='outline' className={meta.className}>
      {meta.label}
    </Badge>
  )
}

function QueueHighlight({ item }: { item: QueueEntry }) {
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

function QueueActions({
  item,
  pending,
  onStatus,
  onCheckIn,
}: {
  item: QueueEntry
  pending: boolean
  onStatus: (status: QueueStatus) => void
  onCheckIn: () => void
}) {
  return (
    <div className='flex flex-wrap justify-end gap-1'>
      {item.status === 'BOOKED' && (
        <Button
          size='sm'
          variant='outline'
          disabled={pending}
          onClick={onCheckIn}
        >
          <UserRoundCheck /> Check-in
        </Button>
      )}
      {(transitions[item.status] ?? []).map((action) => (
        <Button
          key={action.status}
          size='sm'
          variant={
            action.status === 'CANCELLED' || action.status === 'NO_SHOW'
              ? 'ghost'
              : 'outline'
          }
          disabled={pending}
          onClick={() => onStatus(action.status)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

function CreateQueueDialog({
  open,
  onOpenChange,
  queueDate,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueDate: string
  onCreated: () => void
}) {
  const [patientId, setPatientId] = useState('')
  const [priority, setPriority] = useState(0)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const patients = useQuery({
    queryKey: ['queue-patients'],
    queryFn: getPatients,
    enabled: open,
  })
  const create = useMutation({
    mutationFn: () =>
      createQueueEntry({
        patientId,
        queueDate,
        priority,
        reason: reason.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã tiếp nhận bệnh nhân')
      setPatientId('')
      setReason('')
      setNote('')
      setPriority(0)
      onOpenChange(false)
      onCreated()
    },
    onError: showError,
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tiếp nhận bệnh nhân</DialogTitle>
          <DialogDescription>
            Thêm bệnh nhân vào hàng đợi khám ngày {queueDate}.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label>Bệnh nhân *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={
                    patients.isLoading ? 'Đang tải...' : 'Chọn bệnh nhân'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(patients.data ?? []).map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.fullName}
                    {patient.phone ? ` · ${patient.phone}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='queue-priority'>Mức ưu tiên (0–100)</Label>
            <Input
              id='queue-priority'
              type='number'
              min={0}
              max={100}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='queue-reason'>Lý do khám</Label>
            <Input
              id='queue-reason'
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='queue-note'>Ghi chú</Label>
            <Textarea
              id='queue-note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            disabled={!patientId || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? 'Đang lưu...' : 'Tiếp nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function showError(error: unknown) {
  const message =
    typeof error === 'string' ? error : (error as { message?: string })?.message
  toast.error(message || 'Không thể cập nhật hàng đợi')
}
