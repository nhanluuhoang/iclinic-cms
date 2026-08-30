import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash } from 'lucide-react'
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
import { GetMedicines, GetStock, type Medicine } from '../api'
import { medicineGroupLabel, medicineGroups } from '../data/data'
import { formatNumber } from '../utils'
import { useInventory } from './inventory-provider'
import { InventoryTable } from './inventory-table'

function RowActions({ medicine }: { medicine: Medicine }) {
  const { setOpen, setCurrentMedicine } = useInventory()

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

type MedicineRow = Medicine & { totalQty: number }

const columns: ColumnDef<MedicineRow>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs'>{row.original.code}</span>
    ),
  },
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
    accessorKey: 'totalQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tồn hiện tại' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(row.original.totalQty)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
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

export function MedicinesTab() {
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['inventory', 'medicines'],
    queryFn: GetMedicines,
  })

  const { data: stock } = useQuery({
    queryKey: ['inventory', 'stock'],
    queryFn: GetStock,
  })

  const rows: MedicineRow[] = (medicines ?? []).map((m) => ({
    ...m,
    totalQty: stock?.find((s) => s.medicineId === m.id)?.totalQty ?? 0,
  }))

  return (
    <InventoryTable
      columns={columns}
      data={rows}
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
