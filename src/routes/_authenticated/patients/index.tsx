import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Patients } from '@/features/patients'

/**
 * Param chuỗi trên URL, nhận cả number.
 *
 * TanStack Router parse search bằng `JSON.parse`, nên `?gender=1` gõ tay sẽ ra
 * number `1`; `z.string()` thuần loại nó rồi `.catch('')` biến thành rỗng —
 * filter mất mà không báo gì. App tự ghi thì luôn ra `gender="1"` (có quote) nên
 * không bị, nhưng link sửa tay hoặc chia sẻ rút gọn thì bị.
 */
const stringParam = z
  .union([z.string(), z.number()])
  .transform(String)
  .optional()
  .catch('')

const patientsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Ô tìm kiếm của toolbar ghi vào `fullName`; `phone` chỉ lọc được qua URL.
  fullName: stringParam,
  phone: stringParam,
  gender: stringParam,
  // Dạng 'id' tăng, '-id' giảm.
  sort: stringParam,
})

export const Route = createFileRoute('/_authenticated/patients/')({
  validateSearch: patientsSearchSchema,
  component: Patients,
})
