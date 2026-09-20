import { flexRender, type Row, type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

const MOBILE_LABELS: Record<string, string> = {
  address: 'Địa chỉ',
  batchCount: 'Số lô',
  batchNo: 'Số lô',
  code: 'Mã phiếu',
  countedAt: 'Ngày kiểm kê',
  createdAt: 'Thời gian khám',
  dateOfBirth: 'Ngày sinh',
  diagnosis: 'Chẩn đoán',
  doctorName: 'Bác sĩ',
  email: 'Email',
  expiryDate: 'Hạn sử dụng',
  expiryStatus: 'Cảnh báo',
  excerpt: 'Mô tả',
  fullName: 'Họ tên',
  gender: 'Giới tính',
  group: 'Nhóm',
  isPublished: 'Trạng thái',
  issuedAt: 'Ngày xuất',
  itemCount: 'Số thuốc',
  key: 'Khóa',
  lineCount: 'Số dòng',
  manufacturer: 'Nhà sản xuất',
  medicineCount: 'Số thuốc',
  medicineName: 'Thuốc',
  medicines: 'Thuốc trong mẫu',
  minStock: 'Định mức tối thiểu',
  name: 'Tên',
  nearestExpiry: 'Hạn sử dụng gần nhất',
  note: 'Ghi chú',
  patientName: 'Bệnh nhân',
  phone: 'Số điện thoại',
  qtyReceived: 'Đã nhập',
  qtyRemaining: 'Tồn',
  receiptCode: 'Phiếu nhập',
  receivedAt: 'Ngày nhập',
  recipientName: 'Người nhận',
  salePrice: 'Giá bán',
  stockValue: 'Giá trị tồn',
  strength: 'Hàm lượng',
  supplierName: 'Nhà cung cấp',
  thumbnailUrl: 'Ảnh đại diện',
  title: 'Tiêu đề',
  totalQty: 'Tồn kho',
  unit: 'Đơn vị',
  unitCost: 'Giá nhập',
  value: 'Giá trị',
}

type MobileCardsProps<TData> = {
  table: Table<TData>
  rows?: Row<TData>[]
  isLoading?: boolean
  emptyMessage?: string
  labels?: Record<string, string>
  renderSubRow?: (row: Row<TData>) => React.ReactNode
}

export function MobileDataCards<TData>({
  table,
  rows = table.getRowModel().rows,
  isLoading,
  emptyMessage,
  labels,
  renderSubRow,
}: MobileCardsProps<TData>) {
  const { t, i18n } = useTranslation()
  const headerGroups = table.getHeaderGroups()
  const headers = headerGroups[headerGroups.length - 1]?.headers ?? []

  const labelFor = (columnId: string) => {
    const override = labels?.[columnId]
    if (override) return i18n.exists(override) ? t(override) : override
    const key = `mobileTable.columns.${columnId}`
    if (i18n.exists(key)) return t(key)
    if (MOBILE_LABELS[columnId]) return MOBILE_LABELS[columnId]
    const header = headers.find((item) => item.column.id === columnId)
    if (!header) return columnId
    if (typeof header.column.columnDef.header === 'string') {
      return header.column.columnDef.header
    }
    return columnId
  }

  return (
    <div className='grid min-w-0 gap-3 sm:hidden'>
      {isLoading ? (
        <p className='rounded-md border p-4 text-center'>{t('mobileTable.loading')}</p>
      ) : rows.length ? (
        rows.map((row) => {
          const cells = row.getVisibleCells()
          const detailCells = cells.filter(
            (cell) =>
              !['actions', 'expand', 'expander', 'select'].includes(
                cell.column.id
              )
          )
          const actionCells = cells.filter((cell) =>
            ['actions', 'expand', 'expander', 'select'].includes(cell.column.id)
          )

          return (
            <div
              key={row.id}
              className='min-w-0 space-y-3 rounded-md border p-4'
            >
              <div className='space-y-2'>
                {detailCells.map((cell) => (
                  <div
                    key={cell.id}
                    className='flex min-w-0 justify-between gap-3 text-sm'
                  >
                    <span className='shrink-0 text-muted-foreground'>
                      {labelFor(cell.column.id)}
                    </span>
                    <div className='min-w-0 text-right break-words'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {actionCells.length > 0 && (
                <div className='flex flex-wrap items-center justify-end gap-2 border-t pt-3'>
                  {actionCells.map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              )}
              {row.getIsExpanded() && renderSubRow && (
                <div className='min-w-0 border-t pt-3'>{renderSubRow(row)}</div>
              )}
            </div>
          )
        })
      ) : (
        <p className='rounded-md border p-4 text-center text-muted-foreground'>
          {emptyMessage ?? t('mobileTable.empty')}
        </p>
      )}
    </div>
  )
}
