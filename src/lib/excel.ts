import ExcelJS from 'exceljs'

export type ExcelRow = Record<string, unknown>

export const downloadExcel = async (
  rows: ExcelRow[],
  sheetName: string,
  fileName: string
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  worksheet.columns = headers.map((header) => ({ header, key: header }))
  rows.forEach((row) =>
    worksheet.addRow(
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, safeExcelValue(value)])
      )
    )
  )
  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer as BlobPart]))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export const readExcel = async (file: File): Promise<ExcelRow[]> => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File Excel không được vượt quá 5 MB.')
  }
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error('File Excel không có sheet dữ liệu.')
  const headers = (worksheet.getRow(1).values as unknown[])
    .slice(1)
    .map((value) => excelText(value))
  const rows: ExcelRow[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const values = row.values as unknown[]
    const result = Object.fromEntries(
      headers.map((header, index) => [header, values[index + 1] ?? ''])
    )
    if (Object.values(result).some((value) => excelText(value)))
      rows.push(result)
  })
  return rows
}

export const excelText = (value: unknown) => String(value ?? '').trim()

const safeExcelValue = (value: unknown) =>
  typeof value === 'string' && /^[=+\-@]/.test(value.trimStart())
    ? `'${value}`
    : value

export const excelNumber = (value: unknown, field: string, row: number) => {
  const result = Number(value)
  if (!Number.isFinite(result))
    throw new Error(`Dòng ${row}: ${field} phải là số.`)
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
