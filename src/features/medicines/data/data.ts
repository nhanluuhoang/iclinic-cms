import { type MedicineGroup } from '../api/types'

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
  medicineGroups.find((group) => group.value === value)?.label ?? value

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
