import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { GetReceipts, type GoodsReceipt } from '../api'
import { formatDate, formatMoney, formatNumber } from '../utils'
import { ExpiryBadge } from './expiry-badge'
import { InventoryTable } from './inventory-table'

function ReceiptLines({ row }: { row: Row<GoodsReceipt> }) {
  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        {row.original.lines.length} dòng — mỗi dòng tạo ra một lô riêng trong
        kho
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
            {row.original.lines.map((line) => (
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

const columns: ColumnDef<GoodsReceipt>[] = [
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
    accessorKey: 'totalQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tổng SL' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(row.original.totalQty)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Giá trị' />
    ),
    cell: ({ row }) => (
      <span className='font-medium tabular-nums'>
        {formatMoney(row.original.totalAmount)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
]

export function ReceiptsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'receipts'],
    queryFn: GetReceipts,
  })

  return (
    <InventoryTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      searchPlaceholder='Tìm theo mã phiếu, nhà cung cấp, số hoá đơn...'
      emptyMessage='Chưa có phiếu nhập nào.'
      getSearchText={(r) =>
        `${r.code} ${r.supplierName} ${r.invoiceNo} ${r.lines.map((l) => `${l.medicineName} ${l.batchNo}`).join(' ')}`
      }
      initialSorting={[{ id: 'receivedAt', desc: true }]}
      renderSubRow={(row) => <ReceiptLines row={row} />}
    />
  )
}
