import { API_URL } from '@/config'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type MedicalHistoryListItem } from '../api'

const money = (value: number | string) =>
  `${Number(value).toLocaleString('vi-VN')} VNĐ`

export function MedicalHistoryDetails({
  history,
}: {
  history: MedicalHistoryListItem
}) {
  const prescription = history.prescription
  const invoice = prescription?.invoice
  const hasMedia =
    history.images.length > 0 ||
    history.pdfs.length > 0 ||
    history.videos.length > 0

  if (!prescription && !hasMedia) {
    return (
      <p className='py-6 text-center text-sm text-muted-foreground'>
        Hồ sơ chưa có thông tin toa thuốc hoặc tệp đính kèm.
      </p>
    )
  }
  return (
    <div className='space-y-6 bg-muted/20 p-5'>
      {prescription && (
        <section>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            Thuốc kê đơn
          </h4>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead>Hướng dẫn sử dụng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead className='text-right'>Số lượng</TableHead>
                  <TableHead className='text-right'>Giá bán</TableHead>
                  <TableHead className='text-right'>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.map((item) => {
                  const quantity = Number(item.quantity ?? 0)
                  const price = Number(item.medicine?.salePrice ?? 0)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>
                        {item.medicineName}
                      </TableCell>
                      <TableCell>{item.instruction || '-'}</TableCell>
                      <TableCell>{item.medicine?.unit || '-'}</TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {quantity.toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {price.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell className='text-right font-medium tabular-nums'>
                        {(price * quantity).toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {invoice && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            Hóa đơn {invoice.invoiceCode && `#${invoice.invoiceCode}`}
          </h4>
          <div className='grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              ['Tổng tiền', invoice.totalAmount],
              ['Tiền thuốc', invoice.medicineRevenue],
              ['Phí khám bệnh', invoice.consultationFee],
              [invoice.serviceFeeLabel || 'Phí dịch vụ', invoice.serviceFee],
              [invoice.otherFee1Label || 'Phí khác 1', invoice.otherFee1],
              [invoice.otherFee2Label || 'Phí khác 2', invoice.otherFee2],
              [invoice.otherFee3Label || 'Phí khác 3', invoice.otherFee3],
            ].map(([label, value], index) => (
              <div key={index} className='min-w-0 space-y-1'>
                <p className='truncate text-sm text-muted-foreground'>
                  {label}
                </p>
                <p className='font-medium tabular-nums'>{money(value)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {history.images.length > 0 && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            Hình ảnh
          </h4>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
            {history.images.map((file) => (
              <a
                key={file.id}
                href={`${API_URL}/images/${encodeURIComponent(file.fileName)}`}
                target='_blank'
                rel='noreferrer'
                className='group overflow-hidden rounded-md border bg-background'
              >
                <img
                  src={`${API_URL}/images/${encodeURIComponent(file.fileName)}`}
                  alt={file.fileName}
                  className='aspect-square w-full object-cover transition-transform group-hover:scale-105'
                  loading='lazy'
                />
                <p className='truncate p-2 text-xs'>{file.fileName}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {history.pdfs.length > 0 && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            PDF
          </h4>
          <div className='flex flex-wrap gap-2'>
            {history.pdfs.map((file) => (
              <a
                key={file.id}
                href={`${API_URL}/pdfs/${encodeURIComponent(file.fileName)}`}
                target='_blank'
                rel='noreferrer'
                className='rounded-md border bg-background px-3 py-2 text-sm hover:underline'
              >
                {file.fileName}
              </a>
            ))}
          </div>
        </section>
      )}

      {history.videos.length > 0 && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            Video
          </h4>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {history.videos.map((file) => (
              <div key={file.id} className='overflow-hidden rounded-md border'>
                <video
                  src={`${API_URL}/videos/${encodeURIComponent(file.fileName)}/master.m3u8`}
                  className='aspect-video w-full bg-black object-contain'
                  controls
                  preload='metadata'
                >
                  Trình duyệt không hỗ trợ phát video.
                </video>
                <p className='truncate bg-background p-2 text-xs'>
                  {file.fileName}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
