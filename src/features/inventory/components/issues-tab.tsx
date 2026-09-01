import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetGoodsIssues, type GoodsIssue } from '../api'
import { formatDate, formatNumber } from '../utils'

function IssueLines({ row }: { row: Row<GoodsIssue> }) {
  return (
    <div className='px-4 py-3'>
      <table className='w-full text-sm'>
        <thead className='text-xs text-muted-foreground'>
          <tr className='border-b'>
            <th className='py-1.5 pe-4 text-start font-medium'>Thuốc</th>
            <th className='py-1.5 pe-4 text-start font-medium'>Số lô</th>
            <th className='py-1.5 text-end font-medium'>Số lượng xuất</th>
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
              <td className='py-1.5 pe-4 font-mono text-xs'>{line.batchNo}</td>
              <td className='py-1.5 text-end tabular-nums'>
                {formatNumber(line.quantity)} {line.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const columns: ColumnDef<GoodsIssue>[] = [
  {
    id: 'expander',
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        className='size-7'
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Thu gọn' : 'Xem chi tiết'}
      >
        {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
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
    cell: ({ row }) => <span className='font-mono'>{row.original.code}</span>,
  },
  {
    accessorKey: 'issuedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày xuất' />
    ),
    cell: ({ row }) => formatDate(row.original.issuedAt),
  },
  {
    accessorKey: 'recipientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Người nhận' />
    ),
  },
  {
    accessorKey: 'totalQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tổng SL' />
    ),
    cell: ({ row }) => formatNumber(row.original.totalQty),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
]

export function IssuesTab() {
  const search = useApiSearch()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory', 'issues', search],
    queryFn: () => GetGoodsIssues(search),
    retry: false,
  })

  return (
    <>
      {isError && (
        <p className='rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'>
          Không tải được danh sách phiếu xuất. Vui lòng kiểm tra kết nối backend
          và thử lại.
        </p>
      )}
      <UrlDataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchPlaceholder='Tìm mã phiếu hoặc người nhận...'
        emptyMessage='Chưa có phiếu xuất nào.'
        getSearchText={(issue) =>
          `${issue.code} ${issue.recipientName} ${issue.lines.map((line) => `${line.medicineName} ${line.batchNo}`).join(' ')}`
        }
        initialSorting={[{ id: 'issuedAt', desc: true }]}
        renderSubRow={(row) => <IssueLines row={row} />}
      />
    </>
  )
}
