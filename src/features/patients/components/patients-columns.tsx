import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Patient } from '../api'
import { formatDate, genderLabel } from '../data/data'
import { DataTableRowActions } from './data-table-row-actions'

/**
 * `address` và `note` cố ý không lên bảng — hai cột nữa sẽ làm bảng phải scroll
 * ngang liên tục. Xem/sửa chúng trong form.
 *
 * Sắp xếp và lọc là manual (server-side), nên cột nào backend chưa hỗ trợ sort
 * thì đặt `enableSorting: false` để không hiện mũi tên gây hiểu nhầm.
 */
export const patientsColumns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên đăng nhập' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.userName}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Họ tên' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-44'>{row.original.fullName}</LongText>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) =>
      row.original.email ? (
        <LongText className='max-w-44'>{row.original.email}</LongText>
      ) : (
        <span className='text-muted-foreground'>—</span>
      ),
    enableSorting: false,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số điện thoại' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {row.original.phone || <span className='text-muted-foreground'>—</span>}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Giới tính' />
    ),
    cell: ({ row }) => <span>{genderLabel(row.original.gender)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'dateOfBirth',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày sinh' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatDate(row.original.dateOfBirth)}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày tạo' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground tabular-nums'>
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
