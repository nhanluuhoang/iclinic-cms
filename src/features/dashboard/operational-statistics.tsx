import {
  AlarmClock,
  CalendarX,
  Clock3,
  PackageX,
  RotateCcw,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type DashboardStatistics } from '@/features/examination-queue/api'
import { formatDashboardMoney as formatMoney } from './utils'

export function OperationalStatistics({
  data,
}: {
  data?: DashboardStatistics
}) {
  const queue = data?.queueMetrics
  const patients = data?.patientMetrics
  const inventory = data?.inventoryAlerts
  const cards = [
    {
      label: 'Lượt khám',
      value: queue?.totalVisits ?? 0,
      detail: `${queue?.completionRate ?? 0}% hoàn thành`,
      icon: Users,
    },
    {
      label: 'Đã hủy / Không đến',
      value: `${queue?.cancelled ?? 0} / ${queue?.noShow ?? 0}`,
      detail: `${queue?.cancellationRate ?? 0}% / ${queue?.noShowRate ?? 0}%`,
      icon: CalendarX,
    },
    {
      label: 'Thời gian chờ TB',
      value: `${queue?.averageWaitMinutes ?? 0} phút`,
      detail: 'Từ check-in đến bắt đầu khám',
      icon: AlarmClock,
    },
    {
      label: 'Thời gian khám TB',
      value: `${queue?.averageExaminationMinutes ?? 0} phút`,
      detail: 'Từ bắt đầu đến hoàn thành',
      icon: Clock3,
    },
    {
      label: 'Bệnh nhân mới',
      value: patients?.newPatients ?? 0,
      detail: `${patients?.uniquePatients ?? 0} bệnh nhân duy nhất`,
      icon: UserPlus,
    },
    {
      label: 'Bệnh nhân quay lại',
      value: patients?.returningPatients ?? 0,
      detail: `Tỷ lệ ${patients?.returningRate ?? 0}%`,
      icon: RotateCcw,
    },
    {
      label: 'Thuốc hết / sắp hết',
      value: `${inventory?.outOfStockCount ?? 0} / ${inventory?.lowStockCount ?? 0}`,
      detail: 'Theo mức tồn tối thiểu',
      icon: PackageX,
    },
    {
      label: 'Lô sắp hết hạn',
      value: inventory?.expiringBatchCount ?? 0,
      detail: `${formatMoney(inventory?.expiringStockValue ?? 0)} VNĐ`,
      icon: Stethoscope,
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {card.label}
              </CardTitle>
              <card.icon className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold tabular-nums'>{card.value}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {card.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo lô thuốc hết hạn trong 90 ngày</CardTitle>
        </CardHeader>
        <CardContent className='max-h-[360px] overflow-auto'>
          <Table>
            <TableHeader className='sticky top-0 bg-card'>
              <TableRow>
                <TableHead>Thuốc</TableHead>
                <TableHead>Lô</TableHead>
                <TableHead>Hạn dùng</TableHead>
                <TableHead className='text-right'>Số lượng</TableHead>
                <TableHead className='text-right'>Giá trị tồn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.expiringBatches?.length ? (
                inventory.expiringBatches.map((batch) => (
                  <TableRow key={batch.batchId}>
                    <TableCell className='font-medium'>
                      {batch.medicineName}
                    </TableCell>
                    <TableCell>{batch.batchNo}</TableCell>
                    <TableCell>
                      {new Date(
                        `${batch.expiryDate}T00:00:00`
                      ).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className='text-right'>
                      {batch.quantity} {batch.unit}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatMoney(batch.stockValue)} VNĐ
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='h-24 text-center text-muted-foreground'
                  >
                    Không có lô thuốc sắp hết hạn.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thuốc hết hàng và sắp hết hàng</CardTitle>
        </CardHeader>
        <CardContent className='max-h-[360px] overflow-auto'>
          <Table>
            <TableHeader className='sticky top-0 bg-card'>
              <TableRow>
                <TableHead>Thuốc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className='text-right'>Tồn hiện tại</TableHead>
                <TableHead className='text-right'>Tồn tối thiểu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ...(inventory?.outOfStock ?? []),
                ...(inventory?.lowStock ?? []),
              ].length ? (
                [
                  ...(inventory?.outOfStock ?? []).map((item) => ({
                    ...item,
                    label: 'Hết hàng',
                  })),
                  ...(inventory?.lowStock ?? []).map((item) => ({
                    ...item,
                    label: 'Sắp hết',
                  })),
                ].map((item) => (
                  <TableRow key={item.medicineId}>
                    <TableCell className='font-medium'>
                      {item.medicineName}
                    </TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell className='text-right'>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className='text-right'>
                      {item.minStock} {item.unit}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='h-24 text-center text-muted-foreground'
                  >
                    Không có thuốc hết hàng hoặc dưới mức tồn tối thiểu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
