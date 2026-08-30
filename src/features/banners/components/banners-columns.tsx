import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Banner } from '@/features/banners/api'
import { DataTableRowActions } from '@/features/banners/components/data-table-row-actions'
import { bannerStatuses } from '../data/data'

export const bannersColumns: ColumnDef<Banner>[] = [
  {
    accessorKey: 'fileName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <img
          src={row.getValue('fileName')}
          alt={row.getValue('fileName')}
          className='h-12 w-20 rounded-md object-cover shadow-sm'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sort Order' />
    ),
    meta: {
      className: 'ps-1 max-w-0 w-1/3',
      tdClassName: 'ps-4',
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col space-y-1'>
          <span className='truncate font-medium'>
            {row.getValue('sortOrder')}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'isPublic',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const status = bannerStatuses.find(
        (status) => status.value === row.getValue('isPublic')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          {status.icon && (
            <status.icon
              className={`size-4 ${status.value ? 'text-green-500' : 'text-muted-foreground'}`}
            />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
