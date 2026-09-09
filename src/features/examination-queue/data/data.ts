import { type QueueStatus } from '../api'

export const activeQueueStatuses: QueueStatus[] = [
  'BOOKED',
  'WAITING',
  'CALLED',
  'IN_EXAMINATION',
  'SKIPPED',
]

export const processedQueueStatuses: QueueStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]

export const statusMeta: Record<
  QueueStatus,
  { label: string; className: string }
> = {
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

export const transitions: Partial<
  Record<QueueStatus, Array<{ label: string; status: QueueStatus }>>
> = {
  WAITING: [
    { label: 'Gọi khám', status: 'IN_EXAMINATION' },
    { label: 'Bỏ qua', status: 'SKIPPED' },
    { label: 'Hủy', status: 'CANCELLED' },
  ],
  CALLED: [
    { label: 'Tiếp tục khám', status: 'IN_EXAMINATION' },
    { label: 'Bỏ qua', status: 'SKIPPED' },
    { label: 'Trở lại chờ', status: 'WAITING' },
  ],
  IN_EXAMINATION: [
    { label: 'Hoàn tất', status: 'COMPLETED' },
    { label: 'Quay lại', status: 'WAITING' },
    { label: 'Hủy', status: 'CANCELLED' },
  ],
  SKIPPED: [{ label: 'Trở lại chờ', status: 'WAITING' }],
  BOOKED: [
    { label: 'Hủy', status: 'CANCELLED' },
    { label: 'Không đến', status: 'NO_SHOW' },
  ],
}
