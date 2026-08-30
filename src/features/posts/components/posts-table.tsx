import { Fragment, useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type ExpandedState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
import { postStatuses } from '@/features/posts/data/data'
import { type Post } from '../api'
import { columns } from './posts-columns'

const route = getRouteApi('/_authenticated/posts/')

type PostsTableProps = {
  data: Post[]
  total: number
  isLoading?: boolean
}

export function PostsTable({ data, total, isLoading }: PostsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

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
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'title' },
    columnFilters: [
      {
        columnId: 'isPublic',
        searchKey: 'isPublic',
        serialize: (val) => {
          const a = val as string[]
          return a.length > 0 ? a[0] === 'true' : undefined
        },
        deserialize: (val) => (val === undefined ? [] : [String(val)]),
      },
    ],
    sorting: { defaultSort: '' },
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
      expanded,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        showSearch={true}
        searchPlaceholder='Filter by title...'
        filters={[
          {
            columnId: 'isPublic',
            title: 'Status',
            options: postStatuses.map((s) => ({
              ...s,
              value: String(s.value),
            })),
            variant: 'radio',
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border text-nowrap'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(row.getIsSelected() && 'bg-muted')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <div className='mx-4 mb-4 rounded-lg bg-muted/50 p-4'>
                          <h4 className='mb-2 text-center text-sm font-semibold'>
                            Ảnh trong bài viết
                          </h4>
                          {row.original.postImages.length > 0 ? (
                            <ul className='grid grid-cols-1 gap-2 justify-items-center md:grid-cols-2 lg:grid-cols-3'>
                              {row.original.postImages.map((pir) => (
                                <li
                                  key={pir.imageId}
                                  className='flex items-center justify-center gap-2 text-sm text-muted-foreground'
                                >
                                  <img
                                    src={pir.image.fileName}
                                    alt={pir.image.fileName}
                                    className='h-12 w-20 rounded-md object-cover shadow-sm'
                                  />
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className='text-center text-sm text-muted-foreground italic'>
                              Không có ảnh nào được đính kèm.
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
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
