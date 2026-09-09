import { useState } from 'react'
import { ClipboardList, Printer, UserRoundCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type QueueEntry, type QueueStatus } from '../api'
import { transitions } from '../data/data'
import { PrescriptionDialog } from './prescription-dialog'

export function QueueActions({
  item,
  pending,
  onStatus,
  onCheckIn,
}: {
  item: QueueEntry
  pending: boolean
  onStatus: (status: QueueStatus) => void
  onCheckIn: () => void
}) {
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const invoice = item.medicalHistory?.prescription?.invoice

  return (
    <>
      <div className='flex flex-wrap justify-end gap-1'>
        {item.status === 'COMPLETED' && invoice && (
          <Button
            size='sm'
            variant='outline'
            onClick={() => printInvoice(item)}
          >
            <Printer /> In hóa đơn
          </Button>
        )}
        {item.status === 'BOOKED' && (
          <Button
            size='sm'
            variant='outline'
            disabled={pending}
            onClick={onCheckIn}
          >
            <UserRoundCheck /> Check-in
          </Button>
        )}
        {item.status === 'IN_EXAMINATION' && (
          <>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setPrescriptionOpen(true)}
            >
              <ClipboardList /> Kê toa
            </Button>
          </>
        )}
        {(transitions[item.status] ?? []).map((action) => (
          <Button
            key={action.status}
            size='sm'
            variant={
              action.status === 'CANCELLED'
                ? 'destructive'
                : action.status === 'NO_SHOW'
                  ? 'ghost'
                  : 'outline'
            }
            disabled={pending}
            onClick={() => onStatus(action.status)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <PrescriptionDialog
        open={prescriptionOpen}
        onOpenChange={setPrescriptionOpen}
        patient={item.patient}
        queueId={item.id}
        initialData={item.medicalHistory}
      />
    </>
  )
}

function printInvoice(item: QueueEntry) {
  const prescription = item.medicalHistory?.prescription
  const invoice = prescription?.invoice
  if (!prescription || !invoice) return

  const escapeHtml = (value: unknown) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        })[character]!
    )
  const money = (value: number | string) =>
    `${Number(value).toLocaleString('vi-VN')} VNĐ`
  const issuedAt = new Date(invoice.issuedAt)
  const invoiceCode = invoice.invoiceCode
  const extraFees = [
    [invoice.serviceFeeLabel?.trim() || 'Phí dịch vụ', invoice.serviceFee],
    [invoice.otherFee1Label?.trim() || 'Phí khác 1', invoice.otherFee1],
    [invoice.otherFee2Label?.trim() || 'Phí khác 2', invoice.otherFee2],
    [invoice.otherFee3Label?.trim() || 'Phí khác 3', invoice.otherFee3],
  ].filter(([, value]) => Number(value) > 0)
  const medicineRows = prescription.items
    .map((line, index) => {
      const quantity = Number(line.quantity ?? 0)
      const unitPrice = Number(line.medicine?.salePrice ?? 0)
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <strong>${escapeHtml(line.medicineName)}</strong>
            ${line.instruction ? `<div class="muted">${escapeHtml(line.instruction)}</div>` : ''}
          </td>
          <td class="center">${escapeHtml(line.medicine?.unit || '-')}</td>
          <td class="number">${quantity.toLocaleString('vi-VN')}</td>
          <td class="number">${money(unitPrice)}</td>
          <td class="number">${money(unitPrice * quantity)}</td>
        </tr>
      `
    })
    .join('')
  const feeRows = extraFees
    .map(
      ([label, value]) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td class="number">${money(value)}</td>
        </tr>
      `
    )
    .join('')

  const popup = window.open('', '_blank', 'width=800,height=900')
  if (!popup) return
  popup.document.write(`
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hóa đơn ${escapeHtml(invoiceCode)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f3f4f6;
            color: #111827;
            font: 14px/1.45 Arial, sans-serif;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            padding: 18mm;
            background: #fff;
            box-shadow: 0 4px 24px rgba(0, 0, 0, .08);
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 18px;
            border-bottom: 2px solid #111827;
          }
          .clinic { font-size: 18px; font-weight: 700; }
          h1 { margin: 0 0 4px; font-size: 24px; text-align: right; }
          .invoice-meta { text-align: right; }
          .muted { color: #6b7280; font-size: 12px; }
          .patient {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 24px;
            margin: 20px 0;
            padding: 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .patient p { margin: 0; }
          .full { grid-column: 1 / -1; }
          table { width: 100%; border-collapse: collapse; }
          th {
            padding: 10px 8px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            font-size: 12px;
            text-align: left;
            text-transform: uppercase;
          }
          td { padding: 10px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
          .center { text-align: center; }
          .number { text-align: right; white-space: nowrap; }
          .summary {
            width: 52%;
            margin: 22px 0 0 auto;
          }
          .summary td { border-width: 0 0 1px; }
          .summary .total td {
            padding-top: 14px;
            border-top: 2px solid #111827;
            border-bottom: 0;
            font-size: 17px;
            font-weight: 700;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            margin-top: 48px;
            text-align: center;
          }
          .signature-space { height: 72px; }
          .actions { display: flex; justify-content: center; margin: 24px 0; }
          button {
            padding: 10px 18px;
            border: 0;
            border-radius: 6px;
            background: #111827;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }
          @page { size: A4; margin: 0; }
          @media print {
            body { background: #fff; }
            .page { margin: 0; box-shadow: none; }
            .actions { display: none; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header class="header">
            <div>
              <div class="clinic">PHÒNG KHÁM</div>
              <div class="muted">Phiếu thu dịch vụ khám bệnh</div>
            </div>
            <div class="invoice-meta">
              <h1>HÓA ĐƠN</h1>
              <div>Mã: <strong>${escapeHtml(invoiceCode)}</strong></div>
              <div class="muted">${issuedAt.toLocaleString('vi-VN')}</div>
            </div>
          </header>

          <section class="patient">
            <p class="full">Bệnh nhân: <strong>${escapeHtml(item.patient.fullName)}</strong></p>
            <p>Số điện thoại: ${escapeHtml(item.patient.phone || '-')}</p>
            <p>Địa chỉ: ${escapeHtml(item.patient.address || '-')}</p>
            <p class="full">Bác sĩ: ${escapeHtml(item.medicalHistory?.doctorName || '-')}</p>
          </section>

          <table>
            <thead>
              <tr>
                <th class="center">STT</th>
                <th>Thuốc</th>
                <th class="center">Đơn vị</th>
                <th class="number">SL</th>
                <th class="number">Đơn giá</th>
                <th class="number">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows || '<tr><td colspan="6" class="center muted">Không có thuốc</td></tr>'}
            </tbody>
          </table>

          <table class="summary">
            <tbody>
              <tr><td>Phí khám</td><td class="number">${money(invoice.consultationFee)}</td></tr>
              <tr><td>Tiền thuốc</td><td class="number">${money(invoice.medicineRevenue)}</td></tr>
              ${feeRows}
              <tr class="total">
                <td>Tổng thanh toán</td>
                <td class="number">${money(invoice.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          <section class="signatures">
            <div>
              <strong>Người nộp tiền</strong>
              <div class="muted">(Ký và ghi rõ họ tên)</div>
              <div class="signature-space"></div>
            </div>
            <div>
              <strong>Người thu tiền</strong>
              <div class="muted">(Ký và ghi rõ họ tên)</div>
              <div class="signature-space"></div>
            </div>
          </section>
        </main>
        <div class="actions"><button onclick="window.print()">In hóa đơn</button></div>
      </body>
    </html>
  `)
  popup.document.close()
  popup.focus()
}
