import { AlertTriangle, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'

const WARNING_DAYS = 14
const DAY_IN_MS = 24 * 60 * 60 * 1000

export function SubscriptionExpiryNotice() {
  const tenant = useAuthStore((state) => state.auth.user?.tenant)
  const [currentTime] = useState(() => Date.now())

  if (
    tenant?.subscriptionStatus === 'TRIAL' ||
    tenant?.subscriptionStatus === 'SUSPENDED' ||
    !tenant?.subscriptionEndsAt
  ) {
    return null
  }

  const remainingMs =
    new Date(tenant.subscriptionEndsAt).getTime() - currentTime
  const remainingDays = Math.max(0, Math.ceil(remainingMs / DAY_IN_MS))
  const isExpired = remainingMs <= 0

  if (!isExpired && remainingDays > WARNING_DAYS) return null

  const Icon = isExpired ? AlertTriangle : Clock3

  return (
    <div
      role='status'
      className={`flex items-center justify-center gap-2 border-b px-4 py-2 text-center text-xs font-medium ${
        isExpired
          ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300'
          : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
      }`}
    >
      <Icon className='size-4 shrink-0' />
      {isExpired
        ? `Gói ${tenant.servicePlan} của phòng khám đã hết hạn.`
        : `Gói ${tenant.servicePlan} sẽ hết hạn sau ${remainingDays} ngày.`}
    </div>
  )
}
