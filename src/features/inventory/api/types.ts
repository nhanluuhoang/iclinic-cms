import { type MedicineGroup } from '@/features/medicines/api/types'

/**
 * Kho thuốc — mô hình dữ liệu.
 *
 * Điểm cốt lõi: tồn kho KHÔNG lưu ở cấp thuốc mà ở cấp `StockBatch` (đợt nhập
 * hàng). Mỗi lần nhập một thuốc sẽ sinh ra một lô riêng với số lô + hạn sử dụng
 * + giá nhập của riêng đợt đó, nên hai đợt nhập cùng một thuốc vẫn phân biệt
 * được HSD. Tồn theo thuốc (`StockSummary`) là số liệu tổng hợp từ các lô.
 */

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'ok'

/** Một đợt nhập hàng của một thuốc. Đơn vị tồn kho thật sự. */
export interface StockBatch {
  id: string
  medicineId: string
  medicineCode: string
  medicineName: string
  unit: string
  /** Số lô của nhà sản xuất. */
  batchNo: string
  mfgDate: string
  expiryDate: string
  qtyReceived: number
  qtyRemaining: number
  unitCost: number
  /** Truy ngược về phiếu nhập đã tạo ra lô này. */
  receiptId: string
  receiptCode: string
  supplierName: string
  receivedAt: string
}

/** Tồn kho tổng hợp theo thuốc, kèm danh sách lô để xem chi tiết. */
export interface StockSummary {
  medicineId: string
  code: string
  name: string
  strength: string
  unit: string
  group: MedicineGroup
  manufacturer: string
  minStock: number
  totalQty: number
  batchCount: number
  /** HSD gần nhất trong các lô còn tồn — cái cần theo dõi trước tiên. */
  nearestExpiry: string | null
  expiryStatus: ExpiryStatus
  stockValue: number
  belowMinStock: boolean
  batches: StockBatch[]
}

export interface GoodsReceiptLineInput {
  medicineId: string
  batchNo: string
  mfgDate: string
  expiryDate: string
  qty: number
  unitCost: number
}

export interface GoodsReceiptLine extends GoodsReceiptLineInput {
  medicineCode: string
  medicineName: string
  unit: string
  batchId: string
  amount: number
}

/** Phiếu nhập — một đơn hàng, gồm nhiều dòng, mỗi dòng sinh ra một lô. */
export interface GoodsReceipt {
  id: string
  code: string
  supplierName: string
  invoiceNo: string
  receivedAt: string
  note: string
  lines: GoodsReceiptLine[]
  totalQty: number
  totalAmount: number
}

export interface GoodsReceiptInput {
  supplierName: string
  invoiceNo: string
  receivedAt: string
  note: string
  lines: GoodsReceiptLineInput[]
}

export interface GoodsIssueLine {
  batchId: string
  batchNo: string
  medicineCode: string
  medicineName: string
  unit: string
  quantity: number
}

export interface GoodsIssue {
  id: string
  code: string
  recipientName: string
  issuedAt: string
  note: string
  lines: GoodsIssueLine[]
  totalQty: number
}

export interface GoodsIssueInput {
  recipientName: string
  issuedAt: string
  note: string
  lines: Array<{ batchId: string; quantity: number }>
}

export interface StockTakeLine {
  batchId: string
  batchNo: string
  medicineName: string
  expiryDate: string
  systemQty: number
  countedQty: number
  diff: number
}

/** Phiếu kiểm kê — chốt lại số thực đếm của từng lô. */
export interface StockTake {
  id: string
  code: string
  countedAt: string
  note: string
  lines: StockTakeLine[]
  totalDiff: number
}

export interface StockTakeInput {
  countedAt: string
  note: string
  lines: { batchId: string; countedQty: number }[]
}

export interface InventoryStats {
  medicineCount: number
  totalStockValue: number
  expiredBatches: number
  criticalBatches: number
  belowMinStock: number
}
