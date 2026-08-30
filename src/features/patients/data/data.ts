/**
 * Giới tính lưu dạng số (Prisma: `gender Int? @db.SmallInt`).
 * Bộ giá trị 1/2/3 lấy theo đúng cái bảng Admins đang dùng để không lệch nhau.
 */
export const genders = [
  { label: 'Nam', value: 1 },
  { label: 'Nữ', value: 2 },
  { label: 'Khác', value: 3 },
]

export const genderLabel = (value?: number | null) =>
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
