import { type ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type MedicalHistoryListItem } from '../api'

export const medicalHistoryColumns: ColumnDef<MedicalHistoryListItem>[] = [
  {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => (
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8'
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Thu gọn chi tiết' : 'Mở chi tiết'}
      >
        <ChevronRight
          className={cn(
            'size-4 transition-transform',
            row.getIsExpanded() && 'rotate-90'
          )}
        />
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'patientName',
    accessorFn: (row) => row.user.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bệnh nhân' />
    ),
    cell: ({ row }) => (
      <div>
        <LongText className='max-w-52 font-medium'>
          {row.original.user.fullName}
        </LongText>
        <p className='text-xs text-muted-foreground'>
          {row.original.user.phone || 'Chưa có số điện thoại'}
        </p>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Thời gian khám' />
    ),
    cell: ({ row }) => (
      <span className='whitespace-nowrap tabular-nums'>
        {new Date(row.original.createdAt).toLocaleString('vi-VN')}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'doctorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bác sĩ' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>{row.original.doctorName}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'diagnosis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Chẩn đoán' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-72'>{row.original.diagnosis}</LongText>
    ),
    enableSorting: false,
  },
  {
    id: 'medicineCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số thuốc' />
    ),
    cell: ({ row }) => (
      <div className='text-right tabular-nums'>
        {row.original.prescription?.items.length ?? 0}
      </div>
    ),
    meta: {
      thClassName: 'text-right',
      tdClassName: 'text-right',
    },
    enableSorting: false,
  },
]
