import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type QueueEntry, type QueueStatus } from '../api'
import { formatTime } from '../utils'
import { QueueActions } from './queue-actions'
import { QueueStatusBadge } from './queue-status-badge'

export function QueueTable({
  data,
  isLoading,
  isPending,
  onStatus,
  onCheckIn,
  page,
  total,
  limit,
  onPageChange,
  showActions = true,
  emptyMessage = 'Chưa có lượt khám trong ngày.',
}: {
  data: QueueEntry[]
  isLoading: boolean
  isPending: boolean
  onStatus: (id: string, status: QueueStatus) => void
  onCheckIn: (id: string) => void
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  showActions?: boolean
  emptyMessage?: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20 whitespace-nowrap'>
                Số thứ tự
              </TableHead>
              <TableHead>Bệnh nhân</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Lý do khám</TableHead>
              <TableHead>Trạng thái</TableHead>
              {showActions && (
                <TableHead className='text-right'>Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className='h-24 text-center'
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : data.length ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='text-center text-lg font-bold'>
                    {item.queueNumber ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>{item.patient.fullName}</div>
                    <div className='text-xs text-muted-foreground'>
                      {item.patient.phone || 'Không có SĐT'}
                      {item.isLate ? ' · Đến muộn' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.appointmentAt
                      ? `Hẹn ${formatTime(item.appointmentAt)}`
                      : `Đến ${formatTime(item.checkInAt)}`}
                  </TableCell>
                  <TableCell className='max-w-56 truncate'>
                    {item.reason || '—'}
                  </TableCell>
                  <TableCell>
                    <QueueStatusBadge status={item.status} />
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <QueueActions
                        item={item}
                        pending={isPending}
                        onStatus={(status) => onStatus(item.id, status)}
                        onCheckIn={() => onCheckIn(item.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className='h-24 text-center text-muted-foreground'
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {total > 0 && (
        <div className='flex items-center justify-between px-2'>
          <p className='text-sm text-muted-foreground'>{total} lượt khám</p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              className='size-8 p-0'
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
            >
              <span className='sr-only'>Trang đầu</span>
              <DoubleArrowLeftIcon />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0'
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <span className='sr-only'>Trang trước</span>
              <ChevronLeftIcon />
            </Button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className='px-1 text-sm text-muted-foreground'
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? 'default' : 'outline'}
                  className='h-8 min-w-8 px-2'
                  onClick={() => onPageChange(pageNumber as number)}
                >
                  {pageNumber}
                </Button>
              )
            )}
            <Button
              variant='outline'
              className='size-8 p-0'
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <span className='sr-only'>Trang sau</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0'
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <span className='sr-only'>Trang cuối</span>
              <DoubleArrowRightIcon />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
