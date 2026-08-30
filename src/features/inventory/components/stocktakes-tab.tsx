import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { GetStockTakes, type StockTake } from '../api'
import { formatDate, formatNumber } from '../utils'
import { ExpiryBadge } from './expiry-badge'
import { InventoryTable } from './inventory-table'

const diffClass = (diff: number) =>
  diff === 0
    ? 'text-muted-foreground'
    : diff > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'

const withSign = (diff: number) =>
  diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)

function StockTakeLines({ row }: { row: Row<StockTake> }) {
  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        Điều chỉnh theo từng lô — hạn sử dụng giữ nguyên, chỉ số lượng thay đổi
      </p>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='text-xs text-muted-foreground'>
            <tr className='border-b'>
              <th className='py-1.5 pe-4 text-start font-medium'>Thuốc</th>
              <th className='py-1.5 pe-4 text-start font-medium'>Số lô</th>
              <th className='py-1.5 pe-4 text-start font-medium'>Hạn dùng</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Tồn hệ thống</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Thực đếm</th>
              <th className='py-1.5 text-end font-medium'>Lệch</th>
            </tr>
          </thead>
          <tbody>
            {row.original.lines.map((line) => (
              <tr key={line.batchId} className='border-b last:border-0'>
                <td className='py-1.5 pe-4 font-medium'>{line.medicineName}</td>
                <td className='py-1.5 pe-4 font-mono text-xs'>
                  {line.batchNo}
                </td>
                <td className='py-1.5 pe-4'>
                  <ExpiryBadge date={line.expiryDate} />
                </td>
                <td className='py-1.5 pe-4 text-end text-muted-foreground tabular-nums'>
                  {formatNumber(line.systemQty)}
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatNumber(line.countedQty)}
                </td>
                <td
                  className={cn(
                    'py-1.5 text-end font-medium tabular-nums',
                    diffClass(line.diff)
                  )}
                >
                  {withSign(line.diff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const columns: ColumnDef<StockTake>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        className='size-7'
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Thu gọn' : 'Xem chi tiết'}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className='size-4' />
        ) : (
          <ChevronRight className='size-4' />
        )}
      </Button>
    ),
    meta: { className: 'w-10' },
    enableSorting: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã phiếu' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-medium'>{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'countedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày kiểm kê' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{formatDate(row.original.countedAt)}</span>
    ),
  },
  {
    id: 'lineCount',
    accessorFn: (row) => row.lines.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số lô' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.lines.length}</span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'totalDiff',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tổng lệch' />
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          'font-medium tabular-nums',
          diffClass(row.original.totalDiff)
        )}
      >
        {withSign(row.original.totalDiff)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ghi chú' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.original.note || '—'}</span>
    ),
  },
]

export function StockTakesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'stocktakes'],
    queryFn: GetStockTakes,
  })

  return (
    <InventoryTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      searchPlaceholder='Tìm theo mã phiếu, thuốc, số lô...'
      emptyMessage='Chưa có phiếu kiểm kê nào. Bấm "Kiểm kê" để tạo phiếu đầu tiên.'
      getSearchText={(s) =>
        `${s.code} ${s.note} ${s.lines.map((l) => `${l.medicineName} ${l.batchNo}`).join(' ')}`
      }
      initialSorting={[{ id: 'countedAt', desc: true }]}
      renderSubRow={(row) => <StockTakeLines row={row} />}
    />
  )
}
