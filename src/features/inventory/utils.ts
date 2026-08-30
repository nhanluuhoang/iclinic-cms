import { type ExpiryStatus } from './api/types'

export const EXPIRY_CRITICAL_DAYS = 30
export const EXPIRY_WARNING_DAYS = 90

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysUntil(date: string): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - startOfToday().getTime()) / 86_400_000)
}

export function getExpiryStatus(date: string | null): ExpiryStatus {
  if (!date) return 'ok'
  const days = daysUntil(date)
  if (days < 0) return 'expired'
  if (days <= EXPIRY_CRITICAL_DAYS) return 'critical'
  if (days <= EXPIRY_WARNING_DAYS) return 'warning'
  return 'ok'
}

export const isExpired = (date: string) => daysUntil(date) < 0

export function worstExpiryStatus(dates: string[]): ExpiryStatus {
  const order: ExpiryStatus[] = ['expired', 'critical', 'warning', 'ok']
  const statuses = dates.map(getExpiryStatus)
  return order.find((s) => statuses.includes(s)) ?? 'ok'
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatMonthYear(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN')
}

export function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString('vi-VN')} ₫`
}

export function toDateInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
