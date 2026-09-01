import { toast } from 'sonner'

export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const formatTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export function showQueueError(error: unknown) {
  const message =
    typeof error === 'string' ? error : (error as { message?: string })?.message
  toast.error(message || 'Không thể cập nhật thứ tự khám')
}
