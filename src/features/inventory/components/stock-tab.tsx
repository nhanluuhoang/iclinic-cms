import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { ChevronDown, ChevronRight, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApiSearch } from '@/hooks/use-api-search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import {
  medicineGroupLabel,
  medicineGroups,
} from '@/features/medicines/data/data'
import { GetStock, type StockSummary } from '../api'
import { expiryMeta, expiryStatuses } from '../data/data'
import { formatMoney, formatNumber } from '../utils'
import { ExpiryBadge } from './expiry-badge'

function BatchBreakdown({ row }: { row: Row<StockSummary> }) {
  const { batches, unit } = row.original

  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        {batches.length} đợt nhập đang còn tồn — sắp theo hạn dùng, lô hết hạn
        sớm nhất lên đầu
      </p>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='text-xs text-muted-foreground'>
            <tr className='border-b'>
              <th className='py-1.5 pe-4 text-start font-medium'>Số lô</th>
              <th className='py-1.5 pe-4 text-start font-medium'>Hạn dùng</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Tồn</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Đã nhập</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Giá nhập</th>
              <th className='py-1.5 pe-4 text-start font-medium'>Phiếu nhập</th>
              <th className='py-1.5 text-start font-medium'>Nhà cung cấp</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className='border-b last:border-0'>
                <td className='py-1.5 pe-4 font-mono text-xs'>
                  {batch.batchNo}
                </td>
                <td className='py-1.5 pe-4'>
                  <ExpiryBadge date={batch.expiryDate} />
                </td>
                <td className='py-1.5 pe-4 text-end font-medium tabular-nums'>
                  {formatNumber(batch.qtyRemaining)} {unit}
                </td>
                <td className='py-1.5 pe-4 text-end text-muted-foreground tabular-nums'>
                  {formatNumber(batch.qtyReceived)}
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatMoney(batch.unitCost)}
                </td>
                <td className='py-1.5 pe-4 font-mono text-xs'>
                  {batch.receiptCode}
                </td>
                <td className='py-1.5 text-muted-foreground'>
                  {batch.supplierName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const columns: ColumnDef<StockSummary>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        className='size-7'
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Thu gọn' : 'Xem các lô'}
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Thuốc' />
    ),
    cell: ({ row }) => (
      <div className='min-w-48'>
        <div className='font-medium'>{row.original.name}</div>
        <div className='text-xs text-muted-foreground'>
          {row.original.code} · {row.original.manufacturer}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'group',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nhóm' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal'>
        {medicineGroupLabel(row.original.group)}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'totalQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tồn kho' />
    ),
    cell: ({ row }) => {
      const { totalQty, unit, minStock, belowMinStock } = row.original
      return (
        <div className='flex items-center gap-2 whitespace-nowrap'>
          <span className='font-medium tabular-nums'>
            {formatNumber(totalQty)} {unit}
          </span>
          {belowMinStock && (
            <Badge
              variant='outline'
              className='gap-1 border-amber-200 bg-amber-50 font-normal text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
              title={`Định mức tối thiểu: ${formatNumber(minStock)} ${unit}`}
            >
              <TrendingDown className='size-3' />
              dưới định mức
            </Badge>
          )}
        </div>
      )
    },
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'batchCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số lô' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.batchCount}</span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'nearestExpiry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='HSD gần nhất' />
    ),
    cell: ({ row }) => <ExpiryBadge date={row.original.nearestExpiry} />,
  },
  {
    accessorKey: 'expiryStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cảnh báo' />
    ),
    cell: ({ row }) => {
      const meta = expiryMeta(row.original.expiryStatus)
      return (
        <div className={cn('flex items-center gap-1.5', meta.textClass)}>
          <meta.icon className='size-4' />
          <span className='text-sm'>{meta.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'stockValue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Giá trị tồn' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatMoney(row.original.stockValue)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
]

export function StockTab() {
  const search = useApiSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'stock', search],
    queryFn: () => GetStock(search),
  })

  return (
    <UrlDataTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      searchPlaceholder='Tìm theo tên thuốc, mã, nhà sản xuất...'
      emptyMessage='Chưa có thuốc nào trong kho.'
      getSearchText={(s) => `${s.name} ${s.code} ${s.manufacturer}`}
      renderSubRow={(row) => <BatchBreakdown row={row} />}
      filters={[
        {
          columnId: 'group',
          title: 'Nhóm thuốc',
          options: medicineGroups.map((g) => ({
            label: g.label,
            value: g.value,
          })),
        },
        {
          columnId: 'expiryStatus',
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
