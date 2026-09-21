import { API_URL } from '@/config'
import { axios } from '@/lib/axios'

export type QueueStatus =
  | 'BOOKED'
  | 'WAITING'
  | 'CALLED'
  | 'IN_EXAMINATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'NO_SHOW'

export interface QueueUser {
  id: string
  fullName: string
  phone?: string | null
  address?: string | null
  role: string
  dateOfBirth?: string | Date | null
}

export interface QueueEntry {
  id: string
  queueDate: string
  queueNumber: number | null
  appointmentAt: string | null
  checkInAt: string | null
  isLate: boolean
  priority: number
  status: QueueStatus
  reason: string
  note: string
  registeredAt: string
  calledAt: string | null
  examinationAt: string | null
  completedAt: string | null
  patient: QueueUser
  doctor: QueueUser | null
  medicalHistory: null | {
    id: string
    symptoms: string
    diagnosis: string
    treatment: string
    advice: string
    doctorName: string
    note: string
    images: Array<{ id: string; fileName: string }>
    pdfs: Array<{ id: string; fileName: string }>
    videos: Array<{ id: string; fileName: string }>
    prescription: null | {
      id: string
      items: Array<{
        id: string
        medicineId: string
        medicineName: string
        quantity: number | null
        instruction: string
        medicine: null | {
          id: string
          name: string
          strength: string
          unit: string
          totalQty: number
          isActive: boolean
          salePrice: number | string
        }
      }>
      invoice: null | {
        invoiceCode: string
        issuedAt: string
        consultationFee: number | string
        serviceFee: number | string
        serviceFeeLabel: string
        medicineRevenue: number | string
        otherFee1: number | string
        otherFee1Label: string
        otherFee2: number | string
        otherFee2Label: string
        otherFee3: number | string
        otherFee3Label: string
        totalAmount: number | string
      }
    }
  }
}

interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface QueueDashboard {
  queueDate: string
  serving: QueueEntry[]
  next: QueueEntry | null
  counts: Partial<Record<QueueStatus, number>>
  billing: {
    invoiceCount: number
    totalAmount: number
    consultationRevenue: number
    medicineRevenue: number
    medicineCost: number
  }
  medicineUsage: Array<{
    medicineId: string | null
    medicineName: string
    unit: string
    quantity: number
  }>
  monthlyRevenue: Array<{
    month: number
    invoiceCount: number
    totalAmount: number
    consultationRevenue: number
    medicineRevenue: number
    medicineCost: number
  }>
}

export type DashboardStatistics = Pick<
  QueueDashboard,
  'billing' | 'medicineUsage' | 'monthlyRevenue'
> & {
  hasData: boolean
  periodStart: string
  periodEnd: string
  status: 'PROVISIONAL' | 'FINAL' | null
  computedAt: string | null
  queueMetrics: {
    totalVisits: number
    completed: number
    cancelled: number
    noShow: number
    completionRate: number
    cancellationRate: number
    noShowRate: number
    averageWaitMinutes: number
    averageExaminationMinutes: number
  }
  patientMetrics: {
    uniquePatients: number
    newPatients: number
    returningPatients: number
    returningRate: number
  }
  inventoryAlerts: {
    outOfStockCount: number
    lowStockCount: number
    expiringBatchCount: number
    expiringStockValue: number
    outOfStock: Array<InventoryStockAlert>
    lowStock: Array<InventoryStockAlert>
    expiringBatches: Array<{
      medicineId: string
      medicineName: string
      unit: string
      batchId: string
      batchNo: string
      expiryDate: string
      daysUntilExpiry: number
      quantity: number
      stockValue: number
      status: 'EXPIRED' | 'WITHIN_30_DAYS' | 'WITHIN_60_DAYS' | 'WITHIN_90_DAYS'
    }>
  }
}

interface InventoryStockAlert {
  medicineId: string
  medicineName: string
  unit: string
  quantity: number
  minStock: number
}

export type QueueOverview = Pick<
  QueueDashboard,
  'queueDate' | 'serving' | 'next' | 'counts'
>

export interface UploadedMedia {
  id: string
  fileName: string
  url: string
  name: string
  mimeType: string
  size: number
}

export type UploadedImage = UploadedMedia
export type UploadedPdf = UploadedMedia
export type UploadedVideo = UploadedMedia

interface UploadMediaResponse extends UploadedMedia {
  status: boolean
}

const uploadMedia = async (
  resource: 'images' | 'pdfs' | 'videos',
  field: 'image' | 'pdf' | 'video',
  file: File,
  query?: Record<string, string>
): Promise<UploadedMedia> => {
  const formData = new FormData()
  formData.append(field, file)
  const response = await axios.post<unknown, UploadMediaResponse>(
    `/${resource}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' }, params: query }
  )
  const { id, fileName, url, name, mimeType, size } = response
  return {
    id,
    fileName,
    url: url.startsWith('http') ? url : `${API_URL}${url}`,
    name,
    mimeType,
    size,
  }
}

const deleteMedia = (resource: 'images' | 'pdfs' | 'videos', id: string) =>
  axios.delete(`/${resource}/${encodeURIComponent(id)}`) as Promise<void>

export const uploadImage = (
  file: File,
  resource: 'PATIENT' | 'POST' = 'PATIENT'
): Promise<UploadedImage> =>
  uploadMedia('images', 'image', file, { resource })
export const uploadPdf = (file: File): Promise<UploadedPdf> =>
  uploadMedia('pdfs', 'pdf', file)
export const uploadVideo = (file: File): Promise<UploadedVideo> =>
  uploadMedia('videos', 'video', file)
export const deleteImage = (fileName: string): Promise<void> =>
  deleteMedia('images', fileName)
export const deletePdf = (fileName: string): Promise<void> =>
  deleteMedia('pdfs', fileName)
export const deleteVideo = (fileName: string): Promise<void> =>
  deleteMedia('videos', fileName)

export interface MedicalHistory {
  id: string
  createdAt: string
  symptoms: string
  diagnosis: string
  treatment: string
  doctorName: string
  advice: string
  note: string
  prescription: {
    id: string
    prescribedAt: string
    items: Array<{
      id: string
      medicineName: string
      quantity: number | null
      instruction: string
      medicine: {
        strength: string
        unit: string
      } | null
    }>
  } | null
}

export const getQueue = (params: {
  queueDate: string
  statuses: QueueStatus[]
  page: number
  limit: number
  search?: string
}): Promise<Page<QueueEntry>> =>
  axios.get('/examination-queue', {
    params: {
      ...params,
      statuses: params.statuses.join(','),
      search: params.search || undefined,
    },
  })

export const getQueueDashboard = (queueDate: string): Promise<QueueDashboard> =>
  axios.get('/examination-queue/dashboard', { params: { queueDate } })

export const getQueueOverview = (queueDate: string): Promise<QueueOverview> =>
  axios.get('/examination-queue/overview', { params: { queueDate } })

export const getMonthlyQueueDashboard = (
  month: string
): Promise<DashboardStatistics> =>
  axios.get('/statistics/monthly', { params: { month } })

export const getYearlyQueueDashboard = (
  year: string
): Promise<DashboardStatistics> =>
  axios.get('/statistics/yearly', { params: { year } })

export const getPatients = async (search = ''): Promise<QueueUser[]> => {
  const response = await axios.get<
    unknown,
    { status: boolean; data: QueueUser[] }
  >('/patients', {
    params: { page: 1, pageSize: 20, search: search || undefined },
  })
  return response.data
}

export const createQueueEntry = (data: {
  patientId: string
  queueDate: string
  priority?: number
  reason?: string
  note?: string
}): Promise<void> => axios.post('/examination-queue', data)

export const checkIn = (id: string): Promise<void> =>
  axios.post(`/examination-queue/${id}/check-in`, {})

export const changeQueueStatus = (
  id: string,
  status: QueueStatus
): Promise<void> => axios.patch(`/examination-queue/${id}/status`, { status })

export const getMedicalHistories = (
  patientId: string
): Promise<Page<MedicalHistory>> =>
  axios.get('/medical-histories', {
    params: { userId: patientId, page: 1, limit: 100 },
  })
