import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash } from 'lucide-react'
import { useApiSearch } from '@/hooks/use-api-search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetMedicines, type Medicine } from '../api'
import { medicineGroupLabel, medicineGroups } from '../data/data'
import { useMedicines } from './medicines-provider'

function RowActions({ medicine }: { medicine: Medicine }) {
  const { setOpen, setCurrentMedicine } = useMedicines()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentMedicine(medicine)
            setOpen('medicine-update')
          }}
        >
          Sửa
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentMedicine(medicine)
            setOpen('medicine-delete')
          }}
          className='!text-red-500'
        >
          Xoá
          <DropdownMenuShortcut>
            <Trash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value)

const columns: ColumnDef<Medicine>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên thuốc' />
    ),
    cell: ({ row }) => (
      <div className='min-w-48'>
        <div className='font-medium'>{row.original.name}</div>
        <div className='text-xs text-muted-foreground'>
          {row.original.activeIngredient}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'strength',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hàm lượng' />
    ),
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Đơn vị' />
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
  },
  {
    accessorKey: 'manufacturer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nhà sản xuất' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.original.manufacturer}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'minStock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Định mức tối thiểu' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground tabular-nums'>
        {formatNumber(row.original.minStock)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions medicine={row.original} />,
  },
]

export function MedicinesTable() {
  const search = useApiSearch()
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', search],
    queryFn: () => GetMedicines(search),
  })

  return (
    <UrlDataTable
      columns={columns}
      data={medicines ?? []}
      isLoading={isLoading}
      searchPlaceholder='Tìm theo tên, mã, hoạt chất...'
      emptyMessage='Chưa có thuốc nào trong danh mục.'
      getSearchText={(m) =>
        `${m.name} ${m.code} ${m.activeIngredient} ${m.manufacturer}`
      }
      pageSize={15}
      filters={[
        {
          columnId: 'group',
          title: 'Nhóm thuốc',
          options: medicineGroups.map((g) => ({
            label: g.label,
            value: g.value,
          })),
        },
      ]}
    />
  )
}
