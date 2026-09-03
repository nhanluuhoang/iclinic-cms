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
    prescription: null | {
      items: Array<{
        medicineName: string
        quantity: number | null
        medicine: null | { salePrice: number | string }
      }>
      invoice: null | {
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
}

export interface MedicalHistory {
  id: string
  examinedAt: string
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

export const callNext = (queueDate: string): Promise<void> =>
  axios.post('/examination-queue/call-next', { queueDate })

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
