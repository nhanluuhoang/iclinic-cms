import {
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Layers,
  PackagePlus,
  Pill,
  TriangleAlert,
  Warehouse,
} from 'lucide-react'
import { type ExpiryStatus, type MedicineGroup } from '../api/types'
import { EXPIRY_CRITICAL_DAYS, EXPIRY_WARNING_DAYS } from '../utils'

/**
 * Các tab của page kho thuốc. Khai báo ở một chỗ để `index.tsx` dựng tab bar và
 * route dùng luôn làm schema cho search param `tab`, khỏi lệch nhau.
 */
export const INVENTORY_TAB_VALUES = [
  'stock',
  'batches',
  'receipts',
  'stocktakes',
  'medicines',
] as const

export type InventoryTab = (typeof INVENTORY_TAB_VALUES)[number]

export const inventoryTabs: {
  value: InventoryTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'stock', label: 'Tồn kho', icon: Warehouse },
  { value: 'batches', label: 'Lô hàng', icon: Layers },
  { value: 'receipts', label: 'Phiếu nhập', icon: PackagePlus },
  { value: 'stocktakes', label: 'Kiểm kê', icon: ClipboardCheck },
  { value: 'medicines', label: 'Danh mục thuốc', icon: Pill },
]

export const medicineGroups: { label: string; value: MedicineGroup }[] = [
  { label: 'Kháng sinh', value: 'antibiotic' },
  { label: 'Giảm đau / hạ sốt', value: 'analgesic' },
  { label: 'Vitamin / khoáng chất', value: 'vitamin' },
  { label: 'Tim mạch', value: 'cardio' },
  { label: 'Tiêu hoá', value: 'digestive' },
  { label: 'Hô hấp / dị ứng', value: 'respiratory' },
  { label: 'Khác', value: 'other' },
]

export const medicineGroupLabel = (value: MedicineGroup) =>
  medicineGroups.find((g) => g.value === value)?.label ?? value

type ExpiryMeta = {
  label: string
  value: ExpiryStatus
  icon: React.ComponentType<{ className?: string }>
  /** Màu chữ + icon, dùng cho cell trong bảng. */
  textClass: string
  /** Màu nền badge. */
  badgeClass: string
}

export const expiryStatuses: ExpiryMeta[] = [
  {
    label: 'Đã hết hạn',
    value: 'expired',
    icon: CircleX,
    textClass: 'text-red-600 dark:text-red-400',
    badgeClass:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  },
  {
    label: `Còn dưới ${EXPIRY_CRITICAL_DAYS} ngày`,
    value: 'critical',
    icon: TriangleAlert,
    textClass: 'text-orange-600 dark:text-orange-400',
    badgeClass:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
  },
  {
    label: `Còn dưới ${EXPIRY_WARNING_DAYS} ngày`,
    value: 'warning',
    icon: CircleAlert,
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    label: 'Còn hạn dài',
    value: 'ok',
    icon: CircleCheck,
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  },
]

export const expiryMeta = (status: ExpiryStatus): ExpiryMeta =>
  expiryStatuses.find((s) => s.value === status) ?? expiryStatuses[3]

/** Đơn vị tính hay dùng, cho dropdown ở form danh mục thuốc. */
export const medicineUnits = [
  'viên',
  'vỉ',
  'hộp',
  'lọ',
  'ống',
  'tuýp',
  'gói',
  'chai',
]
