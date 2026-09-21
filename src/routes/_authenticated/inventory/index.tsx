import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Inventory } from '@/features/inventory'
import { INVENTORY_TAB_VALUES } from '@/features/inventory/data/data'

/**
 * Năm tab dùng chung một route nên cũng dùng chung bộ param này. Không tab nào
 * dùng hết cả bộ, và đổi tab sẽ xoá sạch param cũ (xem `TabBar` trong
 * `features/inventory/index.tsx`) nên không bị dây filter từ tab này sang tab kia.
 *
 * Param nào không khai ở đây sẽ bị TanStack Router loại khỏi URL — thêm filter
 * mới ở tab thì phải thêm key tương ứng vào đây.
 */
const inventorySearchSchema = z.object({
  tab: z.enum(INVENTORY_TAB_VALUES).optional().catch('stock'),

  // Phân trang + sắp xếp (sort dạng 'id' tăng, '-id' giảm).
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sort: z.string().optional().catch(''),

  // Ô tìm kiếm chung của toolbar.
  filter: z.string().optional().catch(''),

  // Faceted filter là multi-select nên giá trị là mảng.
  // group        -> tab Tồn kho
  // expiryStatus -> tab Tồn kho, Lô hàng
  group: z.array(z.string()).optional().catch([]),
  expiryStatus: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/inventory/')({
  validateSearch: inventorySearchSchema,
  component: Inventory,
})
