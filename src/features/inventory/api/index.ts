import { axios } from '@/lib/axios'
import { isExpired, worstExpiryStatus } from '../utils'
import {
  type GoodsReceipt,
  type GoodsReceiptInput,
  type InventoryStats,
  type Medicine,
  type MedicineGroup,
  type StockBatch,
  type StockSummary,
  type StockTake,
  type StockTakeInput,
} from './types'

interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
interface ApiMedicine extends Omit<Medicine, 'group'> {
  medicineGroup: MedicineGroup
}
interface ApiBatch {
  id: string
  medicineId: string
  batchNo: string
  mfgDate: string | null
  expiryDate: string
  qtyReceived: number
  qtyRemaining: number
  unitCost: number | string
  medicine: ApiMedicine
  receiptLine: null | {
    receipt: {
      id: string
      code: string
      supplierName: string
      receivedAt: string
    }
  }
}
interface ApiReceipt {
  id: string
  code: string
  supplierName: string
  invoiceNo: string
  receivedAt: string
  note: string
  lines: Array<{
    qty: number
    unitCost: number | string
    amount: number | string
    batch: ApiBatch
  }>
}
interface ApiStockTake {
  id: string
  code: string
  countedAt: string
  note: string
  lines: Array<{
    batchId: string
    systemQty: number
    countedQty: number
    diff: number
    batch: ApiBatch
  }>
}

const generatedCode = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}`

const getAll = async <T>(url: string): Promise<T[]> => {
  const first = await axios.get<unknown, Page<T>>(url, {
    params: { page: 1, limit: 100 },
  })
  if (first.data.length >= first.total) return first.data
  const pageCount = Math.ceil(first.total / 100)
  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      axios.get<unknown, Page<T>>(url, {
        params: { page: index + 2, limit: 100 },
      })
    )
  )
  return [...first.data, ...rest.flatMap((page) => page.data)]
}

const mapMedicine = (medicine: ApiMedicine): Medicine => ({
  ...medicine,
  group: medicine.medicineGroup,
})

const mapBatch = (batch: ApiBatch): StockBatch => ({
  id: batch.id,
  medicineId: batch.medicineId,
  medicineCode: batch.medicine.code,
  medicineName: batch.medicine.name,
  unit: batch.medicine.unit,
  batchNo: batch.batchNo,
  mfgDate: batch.mfgDate ?? '',
  expiryDate: batch.expiryDate,
  qtyReceived: batch.qtyReceived,
  qtyRemaining: batch.qtyRemaining,
  unitCost: Number(batch.unitCost),
  receiptId: batch.receiptLine?.receipt.id ?? '',
  receiptCode: batch.receiptLine?.receipt.code ?? '',
  supplierName: batch.receiptLine?.receipt.supplierName ?? '',
  receivedAt: batch.receiptLine?.receipt.receivedAt ?? '',
})

const CreateMedicine = (data: Omit<Medicine, 'id' | 'code'>): Promise<void> =>
  axios.post('/inventory/medicines', {
    ...data,
    code: generatedCode('MED'),
    medicineGroup: data.group,
    group: undefined,
  })

const UpdateMedicine = (
  id: string,
  data: Omit<Medicine, 'id' | 'code'>
): Promise<void> =>
  axios.patch(`/inventory/medicines/${id}`, {
    ...data,
    medicineGroup: data.group,
    group: undefined,
  })

const DeleteMedicine = (id: string): Promise<void> =>
  axios.delete(`/inventory/medicines/${id}`)

const GetMedicines = async (): Promise<Medicine[]> =>
  (await getAll<ApiMedicine>('/inventory/medicines')).map(mapMedicine)

const GetBatches = async (): Promise<StockBatch[]> =>
  (await getAll<ApiBatch>('/inventory/stock-batches')).map(mapBatch)

const GetStock = async (): Promise<StockSummary[]> => {
  const [medicines, batches] = await Promise.all([GetMedicines(), GetBatches()])
  return medicines.map((medicine) => {
    const own = batches
      .filter(
        (batch) => batch.medicineId === medicine.id && batch.qtyRemaining > 0
      )
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
    const totalQty = own.reduce((sum, batch) => sum + batch.qtyRemaining, 0)
    return {
      medicineId: medicine.id,
      code: medicine.code,
      name: medicine.name,
      strength: medicine.strength,
      unit: medicine.unit,
      group: medicine.group,
      manufacturer: medicine.manufacturer,
      minStock: medicine.minStock,
      totalQty,
      batchCount: own.length,
      nearestExpiry: own[0]?.expiryDate ?? null,
      expiryStatus: worstExpiryStatus(own.map((batch) => batch.expiryDate)),
      stockValue: own.reduce(
        (sum, batch) => sum + batch.qtyRemaining * batch.unitCost,
        0
      ),
      belowMinStock: totalQty < medicine.minStock,
      batches: own,
    }
  })
}

const GetStats = async (): Promise<InventoryStats> => {
  const [medicines, stock, batches] = await Promise.all([
    GetMedicines(),
    GetStock(),
    GetBatches(),
  ])
  const inStock = batches.filter((batch) => batch.qtyRemaining > 0)
  const criticalDate = new Date()
  criticalDate.setDate(criticalDate.getDate() + 30)
  return {
    medicineCount: medicines.filter((medicine) => medicine.isActive).length,
    totalStockValue: stock.reduce((sum, item) => sum + item.stockValue, 0),
    expiredBatches: inStock.filter((batch) => isExpired(batch.expiryDate))
      .length,
    criticalBatches: inStock.filter(
      (batch) =>
        !isExpired(batch.expiryDate) &&
        new Date(batch.expiryDate) <= criticalDate
    ).length,
    belowMinStock: stock.filter((item) => item.belowMinStock).length,
  }
}

const GetReceipts = async (): Promise<GoodsReceipt[]> => {
  const summaries = await getAll<{ id: string }>('/inventory/goods-receipts')
  const receipts = await Promise.all(
    summaries.map(({ id }) =>
      axios.get<unknown, ApiReceipt>(`/inventory/goods-receipts/${id}`)
    )
  )
  return receipts.map((receipt) => {
    const lines = receipt.lines.map(({ batch, qty, unitCost, amount }) => ({
      medicineId: batch.medicineId,
      medicineCode: batch.medicine.code,
      medicineName: batch.medicine.name,
      unit: batch.medicine.unit,
      batchId: batch.id,
      batchNo: batch.batchNo,
      mfgDate: batch.mfgDate ?? '',
      expiryDate: batch.expiryDate,
      qty,
      unitCost: Number(unitCost),
      amount: Number(amount),
    }))
    return {
      id: receipt.id,
      code: receipt.code,
      supplierName: receipt.supplierName,
      invoiceNo: receipt.invoiceNo,
      receivedAt: receipt.receivedAt,
      note: receipt.note,
      lines,
      totalQty: lines.reduce((sum, line) => sum + line.qty, 0),
      totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
    }
  })
}

const CreateReceipt = (data: GoodsReceiptInput): Promise<void> =>
  axios.post('/inventory/goods-receipts', {
    ...data,
    code: generatedCode('PN'),
    lines: data.lines.map((line) => ({
      ...line,
      mfgDate: line.mfgDate || undefined,
    })),
  })

const GetStockTakes = async (): Promise<StockTake[]> => {
  const summaries = await getAll<{ id: string }>('/inventory/stock-takes')
  const takes = await Promise.all(
    summaries.map(({ id }) =>
      axios.get<unknown, ApiStockTake>(`/inventory/stock-takes/${id}`)
    )
  )
  return takes.map((take) => {
    const lines = take.lines.map((line) => ({
      batchId: line.batchId,
      batchNo: line.batch.batchNo,
      medicineName: line.batch.medicine.name,
      expiryDate: line.batch.expiryDate,
      systemQty: line.systemQty,
      countedQty: line.countedQty,
      diff: line.diff,
    }))
    return {
      id: take.id,
      code: take.code,
      countedAt: take.countedAt,
      note: take.note,
      lines,
      totalDiff: lines.reduce((sum, line) => sum + line.diff, 0),
    }
  })
}

const CreateStockTake = (data: StockTakeInput): Promise<void> =>
  axios.post('/inventory/stock-takes', { ...data, code: generatedCode('KK') })

const DisposeBatch = (batchId: string): Promise<void> =>
  axios.post('/inventory/stock-takes', {
    code: generatedCode('HUY'),
    countedAt: new Date().toISOString(),
    note: 'Hủy toàn bộ tồn của lô hết hạn',
    lines: [{ batchId, countedQty: 0, reason: 'Hủy lô' }],
  })

export {
  CreateMedicine,
  UpdateMedicine,
  DeleteMedicine,
  GetMedicines,
  GetStock,
  GetBatches,
  GetStats,
  GetReceipts,
  CreateReceipt,
  GetStockTakes,
  CreateStockTake,
  DisposeBatch,
}
export * from './types'
