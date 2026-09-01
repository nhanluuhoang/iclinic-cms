import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetBatches, type StockBatch } from '../api'
import { expiryStatuses } from '../data/data'
import {
  formatDate,
  formatMoney,
  formatNumber,
  getExpiryStatus,
} from '../utils'
import { ExpiryBadge } from './expiry-badge'
import { useInventory } from './inventory-provider'

function DisposeButton({ batch }: { batch: StockBatch }) {
  const { setOpen, setCurrentBatch } = useInventory()

  return (
    <Button
      variant='ghost'
      size='icon'
      className='size-8 text-red-600 hover:text-red-700 dark:text-red-400'
      title='Huỷ toàn bộ tồn của lô này'
      onClick={() => {
        setCurrentBatch(batch)
        setOpen('batch-dispose')
      }}
    >
      <Trash2 className='size-4' />
      <span className='sr-only'>Huỷ lô</span>
    </Button>
  )
}

const columns: ColumnDef<StockBatch>[] = [
  {
    accessorKey: 'batchNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số lô' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-medium'>
        {row.original.batchNo}
      </span>
    ),
  },
  {
    accessorKey: 'medicineName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Thuốc' />
    ),
    cell: ({ row }) => (
      <div className='min-w-44'>
        <div className='font-medium'>{row.original.medicineName}</div>
        <div className='text-xs text-muted-foreground'>
          {row.original.medicineCode}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hạn sử dụng' />
    ),
    cell: ({ row }) => <ExpiryBadge date={row.original.expiryDate} />,
    // Lọc theo mức cảnh báo suy ra từ chính ngày HSD, khỏi cần cột phụ.
    filterFn: (row, id, value) =>
      (value as string[]).includes(getExpiryStatus(row.getValue(id))),
  },
  {
    accessorKey: 'qtyRemaining',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tồn' />
    ),
    cell: ({ row }) => (
      <span className='font-medium tabular-nums'>
        {formatNumber(row.original.qtyRemaining)} {row.original.unit}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'qtyReceived',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Đã nhập' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground tabular-nums'>
        {formatNumber(row.original.qtyReceived)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'unitCost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Giá nhập' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{formatMoney(row.original.unitCost)}</span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'receiptCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phiếu nhập' />
    ),
    cell: ({ row }) => (
      <div>
        <div className='font-mono text-xs'>{row.original.receiptCode}</div>
        <div className='text-xs text-muted-foreground'>
          {formatDate(row.original.receivedAt)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nhà cung cấp' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.original.supplierName}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DisposeButton batch={row.original} />,
  },
]

export function BatchesTab() {
  const search = useApiSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'batches', search],
    queryFn: () => GetBatches(search),
  })

  // Lô đã xuất/huỷ hết không còn ý nghĩa để theo dõi HSD.
  const batches = (data ?? []).filter((b) => b.qtyRemaining > 0)

  return (
    <UrlDataTable
      columns={columns}
      data={batches}
      isLoading={isLoading}
      searchPlaceholder='Tìm theo số lô, thuốc, nhà cung cấp...'
      emptyMessage='Chưa có lô hàng nào.'
      getSearchText={(b) =>
        `${b.batchNo} ${b.medicineName} ${b.medicineCode} ${b.supplierName} ${b.receiptCode}`
      }
      // Mặc định đưa lô sắp hết hạn lên trước, đó là việc cần xử lý sớm nhất.
      initialSorting={[{ id: 'expiryDate', desc: false }]}
      pageSize={15}
      rowClassName={(row) =>
        getExpiryStatus(row.original.expiryDate) === 'expired'
          ? 'bg-red-50/60 dark:bg-red-950/20'
          : undefined
      }
      filters={[
        {
          // Lọc trên cột `expiryDate` (nó mang filterFn quy HSD ra mức cảnh
          // báo). Trước đây trỏ 'expiryStatus' — cột đó không tồn tại nên
          // DataTableToolbar gặp `!column` và filter này âm thầm không hiện.
          columnId: 'expiryDate',
          searchKey: 'expiryStatus',
          title: 'Hạn sử dụng',
          options: expiryStatuses.map((s) => ({
            label: s.label,
            value: s.value,
            icon: s.icon,
          })),
        },
      ]}
    />
  )
}
