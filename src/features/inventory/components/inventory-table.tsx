import { Fragment, useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type ColumnDef,
  type ExpandedState,
  type Row,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'

const route = getRouteApi('/_authenticated/inventory/')

type ToolbarFilter = {
  columnId: string
  /**
   * Tên param trên URL. Mặc định lấy theo `columnId`, chỉ cần khai khi hai cái
   * lệch nhau — ví dụ tab Lô hàng lọc trên cột `expiryDate` nhưng giá trị lọc
   * là mức cảnh báo, nên URL đọc là `expiryStatus` cho dễ hiểu.
   *
   * Mọi key khai ở đây PHẢI có trong schema của route, nếu không TanStack Router
   * sẽ loại nó khỏi URL.
   */
  searchKey?: string
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  variant?: 'checkbox' | 'radio'
}

type InventoryTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  searchPlaceholder?: string
  filters?: ToolbarFilter[]
  emptyMessage?: string
  initialSorting?: SortingState
  pageSize?: number
  renderSubRow?: (row: Row<TData>) => React.ReactNode
  rowClassName?: (row: Row<TData>) => string | undefined
  getSearchText?: (row: TData) => string
}

export function InventoryTable<TData>({
  columns,
  data,
  isLoading,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
  emptyMessage = 'Không có dữ liệu.',
  initialSorting = [],
  pageSize = 10,
  renderSubRow,
  rowClassName,
  getSearchText,
}: InventoryTableProps<TData>) {
  // Mở rộng dòng là trạng thái xem tạm, không đáng đưa lên URL.
  const [expanded, setExpanded] = useState<ExpandedState>({})

  // Mỗi filter tự lấy `searchKey` làm param; dùng type 'array' vì faceted
  // filter là multi-select. Memo hoá để không tạo config mới mỗi lần render.
  const columnFiltersCfg = useMemo(
    () =>
      filters.map((f) => ({
        columnId: f.columnId,
        searchKey: f.searchKey ?? f.columnId,
        type: 'array' as const,
      })),
    [filters]
  )

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: pageSize },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: columnFiltersCfg,
    sorting: { defaultSort: '' },
  })

  /**
   * Hook trả `[]` khi URL không có param `sort`, nên phải tự fallback về
   * `initialSorting` — nếu không thì thứ tự mặc định của tab (Lô hàng sắp theo
   * HSD, Phiếu nhập sắp theo ngày nhập) sẽ mất.
   *
   * Cố ý KHÔNG đẩy sort mặc định lên URL: URL chỉ mang thứ tự do người dùng
   * chủ động chọn, còn xoá sort thì quay về mặc định của tab.
   */
  const effectiveSorting = sorting.length > 0 ? sorting : initialSorting

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: effectiveSorting,
      columnFilters,
      globalFilter,
      pagination,
      expanded,
    },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => !!renderSubRow,
    globalFilterFn: getSearchText
      ? (row, _columnId, filterValue) =>
          getSearchText(row.original)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())
      : 'auto',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Lọc bớt dữ liệu có thể làm số trang tụt xuống dưới trang đang xem; không có
  // dòng này thì người dùng nhìn thấy bảng trống mà không hiểu tại sao.
  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  const rows = table.getRowModel().rows

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
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
            ) : rows.length ? (
              rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow className={rowClassName?.(row)}>
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
                  {row.getIsExpanded() && renderSubRow && (
                    <TableRow className='hover:bg-transparent'>
                      <TableCell
                        colSpan={columns.length}
                        className='bg-muted/30 p-0'
                      >
                        {renderSubRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  {emptyMessage}
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
