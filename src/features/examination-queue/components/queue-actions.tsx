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
        {invoice && (
          <Button size='sm' variant='outline' onClick={() => printInvoice(item)}>
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
              action.status === 'CANCELLED' || action.status === 'NO_SHOW'
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
      />
    </>
  )
}

function printInvoice(item: QueueEntry) {
  const prescription = item.medicalHistory?.prescription
  const invoice = prescription?.invoice
  if (!prescription || !invoice) return
  const html = (value: unknown) =>
    String(value ?? '').replace(/[&<>"']/g, (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!
    )
  const money = (value: number | string) => `${Number(value).toLocaleString('vi-VN')} ₫`
  const extraFees = [
    [invoice.serviceFeeLabel || 'Phí dịch vụ', invoice.serviceFee],
    [invoice.otherFee1Label || 'Phí khác 1', invoice.otherFee1],
    [invoice.otherFee2Label || 'Phí khác 2', invoice.otherFee2],
    [invoice.otherFee3Label || 'Phí khác 3', invoice.otherFee3],
  ].filter(([, value]) => Number(value) > 0)
  const popup = window.open('', '_blank', 'width=800,height=900')
  if (!popup) return
  popup.document.write(`<!doctype html><html><head><title>Hóa đơn</title><style>body{font:14px Arial;max-width:760px;margin:32px auto;color:#111}h1{text-align:center}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}.money{text-align:right}.total{font-size:18px;font-weight:700}@media print{button{display:none}}</style></head><body><h1>HÓA ĐƠN KHÁM BỆNH</h1><p>Bệnh nhân: <b>${html(item.patient.fullName)}</b></p><p>Ngày: ${new Date(invoice.issuedAt).toLocaleString('vi-VN')}</p><table><thead><tr><th>Thuốc</th><th>SL</th><th class="money">Thành tiền</th></tr></thead><tbody>${prescription.items.map((line) => `<tr><td>${html(line.medicineName)}</td><td>${line.quantity ?? 0}</td><td class="money">${money(Number(line.medicine?.salePrice ?? 0) * Number(line.quantity ?? 0))}</td></tr>`).join('')}</tbody></table><table><tr><td>Phí khám</td><td class="money">${money(invoice.consultationFee)}</td></tr><tr><td>Phí thuốc</td><td class="money">${money(invoice.medicineRevenue)}</td></tr>${extraFees.map(([label, value]) => `<tr><td>${html(label)}</td><td class="money">${money(value)}</td></tr>`).join('')}<tr class="total"><td>Tổng thanh toán</td><td class="money">${money(invoice.totalAmount)}</td></tr></table><button onclick="window.print()">In hóa đơn</button></body></html>`)
  popup.document.close()
}
