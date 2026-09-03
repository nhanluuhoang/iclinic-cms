import * as XLSX from 'xlsx'

export type ExcelRow = Record<string, unknown>

export const downloadExcel = (
  rows: ExcelRow[],
  sheetName: string,
  fileName: string
) => {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}

export const readExcel = async (file: File): Promise<ExcelRow[]> => {
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: 'array',
    cellDates: true,
  })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('File Excel không có sheet dữ liệu.')
  return XLSX.utils.sheet_to_json<ExcelRow>(workbook.Sheets[sheetName], {
    defval: '',
  })
}

export const excelText = (value: unknown) => String(value ?? '').trim()

export const excelNumber = (value: unknown, field: string, row: number) => {
  const result = Number(value)
  if (!Number.isFinite(result)) {
    throw new Error(`Dòng ${row}: ${field} phải là số.`)
  }
  return result
}

export const excelDate = (value: unknown, field: string, row: number) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  const text = excelText(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`Dòng ${row}: ${field} phải có định dạng YYYY-MM-DD.`)
  }
  return text
}
