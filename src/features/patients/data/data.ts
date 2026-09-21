export const genders = [
  { label: 'Nam', value: '1' },
  { label: 'Nữ', value: '2' },
] as const

export const genderLabel = (value?: string | null) =>
  genders.find((g) => g.value === value)?.label ?? '—'

/**
 * Giới hạn độ dài lấy từ @db.VarChar trong Prisma model.
 * Không có `userName` vì field đó không nằm trong form — backend tự sinh.
 */
export const MAX = {
  password: 255,
  fullName: 150,
  email: 150,
  phone: 15,
  address: 255,
  note: 150,
}

/** Hiển thị ngày theo định dạng Việt Nam; chuỗi rỗng/null thành dấu gạch. */
export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—'
