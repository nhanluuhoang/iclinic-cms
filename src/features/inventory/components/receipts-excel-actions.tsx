import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  downloadExcel,
  excelDate,
  excelNumber,
  excelText,
  readExcel,
} from '@/lib/excel'
import { Button } from '@/components/ui/button'
import { GetMedicines } from '@/features/medicines/api'
import {
  CreateReceipt,
  GetReceipt,
  GetReceipts,
  type GoodsReceiptInput,
} from '../api'

export function ReceiptsExcelActions() {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [isWorking, setIsWorking] = useState(false)

  const handleDownload = async () => {
    try {
      setIsWorking(true)
      const summaries = await GetReceipts()
      const receipts = await Promise.all(
        summaries.map((receipt) => GetReceipt(receipt.id))
      )
      await downloadExcel(
        receipts.flatMap((receipt) =>
          receipt.lines.map((line) => ({
            receiptCode: receipt.code,
            supplierName: receipt.supplierName,
            invoiceNo: receipt.invoiceNo,
            receivedAt: receipt.receivedAt.slice(0, 10),
            note: receipt.note,
            medicineCode: line.medicineCode,
            batchNo: line.batchNo,
            mfgDate: line.mfgDate ? line.mfgDate.slice(0, 10) : '',
            expiryDate: line.expiryDate.slice(0, 10),
            qty: line.qty,
            unitCost: line.unitCost,
          }))
        ),
        'Receipts',
        'phieu-nhap-hang.xlsx'
      )
    } catch (error) {
      toast.error('Không thể tải file Excel', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsWorking(false)
    }
  }

  const handleImport = async (file?: File) => {
    if (!file) return
    try {
      setIsWorking(true)
      const rows = await readExcel(file)
      if (!rows.length) throw new Error('File Excel không có dữ liệu.')

      const medicines = await GetMedicines()
      const medicineByCode = new Map(
        medicines.map((medicine) => [medicine.code.toLowerCase(), medicine])
      )
      const receipts = new Map<string, GoodsReceiptInput>()

      rows.forEach((row, index) => {
        const rowNumber = index + 2
        const receiptCode = excelText(row.receiptCode)
        if (!receiptCode) {
          throw new Error(`Dòng ${rowNumber}: thiếu receiptCode.`)
        }
        const medicineCode = excelText(row.medicineCode)
        const medicine = medicineByCode.get(medicineCode.toLowerCase())
        if (!medicine) {
          throw new Error(
            `Dòng ${rowNumber}: không tìm thấy thuốc ${medicineCode}.`
          )
        }

        const current = receipts.get(receiptCode) ?? {
          supplierName: excelText(row.supplierName),
          invoiceNo: excelText(row.invoiceNo),
          receivedAt: excelDate(row.receivedAt, 'receivedAt', rowNumber),
          note: excelText(row.note),
          lines: [],
        }
        current.lines.push({
          medicineId: medicine.id,
          batchNo: excelText(row.batchNo),
          mfgDate: row.mfgDate
            ? excelDate(row.mfgDate, 'mfgDate', rowNumber)
            : '',
          expiryDate: excelDate(row.expiryDate, 'expiryDate', rowNumber),
          qty: excelNumber(row.qty, 'qty', rowNumber),
          unitCost: excelNumber(row.unitCost, 'unitCost', rowNumber),
        })
        receipts.set(receiptCode, current)
      })

      for (const receipt of receipts.values()) await CreateReceipt(receipt)

      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(`Đã import ${receipts.size} phiếu nhập.`)
    } catch (error) {
      toast.error('Import phiếu nhập thất bại', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsWorking(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <Button variant='outline' disabled={isWorking} onClick={handleDownload}>
        <Download className='size-4' />
        Download
      </Button>
      <Button
        variant='outline'
        disabled={isWorking}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp className='size-4' />
        Import Excel
      </Button>
      <input
        ref={inputRef}
        type='file'
        accept='.xlsx,.xls'
        className='hidden'
        onChange={(event) => handleImport(event.target.files?.[0])}
      />
    </>
  )
}
