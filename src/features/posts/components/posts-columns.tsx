import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from '@/features/posts/components/data-table-row-actions'
import { postStatuses } from '@/features/posts/data/data'
import { type Post } from '../api'

export const columns: ColumnDef<Post>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => row.toggleExpanded()}
      >
        {row.getIsExpanded() ? (
          <ChevronDownIcon className='h-4 w-4' />
        ) : (
          <ChevronRightIcon className='h-4 w-4' />
        )}
      </Button>
    ),
  },
  {
    accessorKey: 'thumbnail',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Thumbnail' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          <img
            src={row.getValue('thumbnail')}
            alt={row.getValue('thumbnail')}
            className='h-12 w-20 rounded-md object-cover shadow-sm'
          />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[300px] truncate font-medium'>
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'content',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Content' />
    ),
    cell: ({ row }) => {
      const content = row.getValue('content') as string
      return (
        <div className='max-w-[400px] truncate text-muted-foreground'>
          {content.length > 100 ? content.substring(0, 100) + '...' : content}
        </div>
      )
    },
  },
  {
    accessorKey: 'isPublic',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const status = postStatuses.find(
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
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
