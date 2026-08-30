import { useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Patient } from '../api'
import { genders } from '../data/data'
import { patientsColumns as columns } from './patients-columns'

type PatientsTableProps = {
  data: Patient[]
  total: number
  search: Record<string, unknown>
  navigate: NavigateFn
  isLoading?: boolean
}

export function PatientsTable({
  data,
  total,
  search,
  navigate,
  isLoading,
}: PatientsTableProps) {
  const [rowSelection, setRowSelection] = useState({})

  // Lọc / phân trang / sắp xếp đều đẩy sang server và đồng bộ lên URL, giống
  // bảng Admins. Nhờ vậy F5 hay share link vẫn giữ đúng trang và bộ lọc.
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    columnFilters: [
      // fullName do ô tìm kiếm của toolbar set (một chuỗi) nên type 'string' đúng.
      { columnId: 'fullName', searchKey: 'fullName', type: 'string' },
      // phone hiện chỉ lọc được qua URL, không có ô nào trên toolbar.
      { columnId: 'phone', searchKey: 'phone', type: 'string' },
      {
        columnId: 'gender',
        searchKey: 'gender',
        // KHÔNG dùng type 'string': DataTableFacetedFilter luôn set giá trị là
        // MẢNG (`setFilterValue([value])`), còn nhánh 'string' của hook đòi
        // `typeof === 'string'` nên sẽ bỏ qua và không ghi gì lên URL. Đây đúng
        // là lý do filter giới tính trước đó không hoạt động.
        //
        // API nhận `gender` là một giá trị đơn (PatientParams.gender?: string),
        // nên rút mảng về phần tử đầu khi ghi và bọc lại thành mảng khi đọc —
        // giống cách bảng Banners xử lý filter trạng thái.
        serialize: (val) => {
          const a = val as string[]
          return a.length > 0 ? a[0] : undefined
        },
        deserialize: (val) => (val ? [String(val)] : []),
      },
    ],
    sorting: { defaultSort: '' },
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, rowSelection, columnFilters },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
  })

  // Xoá bệnh nhân hoặc siết bộ lọc có thể làm số trang tụt xuống dưới trang
  // đang xem; không có dòng này thì người dùng thấy bảng trống mà không hiểu vì
  // sao. `getPageCount()` tính từ `rowCount` = total của server.
  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchKey='fullName'
        searchPlaceholder='Tìm theo họ tên...'
        filters={[
          {
            columnId: 'gender',
            title: 'Giới tính',
            options: genders.map((g) => ({
              label: g.label,
              value: String(g.value),
            })),
            // radio vì API chỉ nhận một giá trị gender. Để multi-select thì
            // người dùng tick được 2 mục nhưng chỉ mục đầu thực sự được gửi —
            // giao diện nói dối kết quả.
            variant: 'radio',
          },
        ]}
      />
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'whitespace-nowrap',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  Chưa có bệnh nhân nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
