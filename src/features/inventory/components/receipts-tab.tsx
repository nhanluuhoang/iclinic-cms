import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import {
  GetReceipt,
  GetReceipts,
  type GoodsReceiptSummary,
} from '../api'
import { formatDate, formatMoney, formatNumber } from '../utils'
import { ExpiryBadge } from './expiry-badge'

function ReceiptLines({ row }: { row: Row<GoodsReceiptSummary> }) {
  const { data: receipt, isLoading, isError } = useQuery({
    queryKey: ['inventory', 'receipt', row.original.id],
    queryFn: () => GetReceipt(row.original.id),
  })

  if (isLoading) {
    return <div className='px-4 py-6 text-sm'>Đang tải chi tiết...</div>
  }

  if (isError || !receipt) {
    return (
      <div className='px-4 py-6 text-sm text-destructive'>
        Không thể tải chi tiết phiếu nhập.
      </div>
    )
  }

  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        {receipt.lines.length} dòng — tổng {formatNumber(receipt.totalQty)} ·{' '}
        {formatMoney(receipt.totalAmount)}
      </p>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='text-xs text-muted-foreground'>
            <tr className='border-b'>
              <th className='py-1.5 pe-4 text-start font-medium'>Thuốc</th>
              <th className='py-1.5 pe-4 text-start font-medium'>Số lô</th>
              <th className='py-1.5 pe-4 text-start font-medium'>Hạn dùng</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Số lượng</th>
              <th className='py-1.5 pe-4 text-end font-medium'>Đơn giá</th>
              <th className='py-1.5 text-end font-medium'>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((line) => (
              <tr key={line.batchId} className='border-b last:border-0'>
                <td className='py-1.5 pe-4'>
                  <span className='font-medium'>{line.medicineName}</span>
                  <span className='ms-2 text-xs text-muted-foreground'>
                    {line.medicineCode}
                  </span>
                </td>
                <td className='py-1.5 pe-4 font-mono text-xs'>
                  {line.batchNo}
                </td>
                <td className='py-1.5 pe-4'>
                  <ExpiryBadge date={line.expiryDate} />
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatNumber(line.qty)} {line.unit}
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatMoney(line.unitCost)}
                </td>
                <td className='py-1.5 text-end font-medium tabular-nums'>
                  {formatMoney(line.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const columns: ColumnDef<GoodsReceiptSummary>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        className='size-7'
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Thu gọn' : 'Xem các dòng'}
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
    accessorKey: 'receivedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày nhập' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatDate(row.original.receivedAt)}
      </span>
    ),
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nhà cung cấp' />
    ),
    cell: ({ row }) => (
      <div className='min-w-44'>
        <div>{row.original.supplierName}</div>
        <div className='text-xs text-muted-foreground'>
          HĐ {row.original.invoiceNo}
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'lineCount',
    accessorKey: 'lineCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số lô' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.lineCount}</span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
]

export function ReceiptsTab() {
  const search = useApiSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'receipts', search],
    queryFn: () => GetReceipts(search),
  })

  return (
    <UrlDataTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      searchPlaceholder='Tìm theo mã phiếu, nhà cung cấp, số hoá đơn...'
      emptyMessage='Chưa có phiếu nhập nào.'
      getSearchText={(r) =>
        `${r.code} ${r.supplierName} ${r.invoiceNo}`
      }
      initialSorting={[{ id: 'receivedAt', desc: true }]}
      renderSubRow={(row) => <ReceiptLines row={row} />}
    />
  )
}
