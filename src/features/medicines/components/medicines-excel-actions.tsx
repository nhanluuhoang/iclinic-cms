import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  downloadExcel,
  excelNumber,
  excelText,
  readExcel,
} from '@/lib/excel'
import { Button } from '@/components/ui/button'
import {
  CreateMedicine,
  GetMedicines,
  type MedicineGroup,
} from '../api'

const medicineGroups: MedicineGroup[] = [
  'antibiotic',
  'analgesic',
  'vitamin',
  'cardio',
  'digestive',
  'respiratory',
  'other',
]

export function MedicinesExcelActions() {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [isWorking, setIsWorking] = useState(false)

  const handleDownload = async () => {
    try {
      setIsWorking(true)
      const medicines = await GetMedicines()
      downloadExcel(
        medicines.map((medicine) => ({
          name: medicine.name,
          activeIngredient: medicine.activeIngredient,
          strength: medicine.strength,
          unit: medicine.unit,
          group: medicine.group,
          manufacturer: medicine.manufacturer,
          minStock: medicine.minStock,
          salePrice: medicine.salePrice,
          isActive: medicine.isActive,
        })),
        'Medicines',
        'danh-muc-thuoc.xlsx'
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

      for (const [index, row] of rows.entries()) {
        const rowNumber = index + 2
        const group = excelText(row.group) as MedicineGroup
        if (!medicineGroups.includes(group)) {
          throw new Error(
            `Dòng ${rowNumber}: group không hợp lệ (${medicineGroups.join(', ')}).`
          )
        }
        const name = excelText(row.name)
        if (!name) throw new Error(`Dòng ${rowNumber}: thiếu name.`)

        await CreateMedicine({
          name,
          activeIngredient: excelText(row.activeIngredient),
          strength: excelText(row.strength),
          unit: excelText(row.unit),
          group,
          manufacturer: excelText(row.manufacturer),
          minStock: excelNumber(row.minStock, 'minStock', rowNumber),
          salePrice: excelNumber(row.salePrice, 'salePrice', rowNumber),
          isActive:
            row.isActive === true ||
            ['true', '1', 'yes'].includes(excelText(row.isActive).toLowerCase()),
        })
      }

      await queryClient.invalidateQueries({ queryKey: ['medicines'] })
      toast.success(`Đã import ${rows.length} thuốc.`)
    } catch (error) {
      toast.error('Import thuốc thất bại', {
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
