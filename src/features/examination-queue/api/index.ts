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
  role: string
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
}

export const getQueue = (queueDate: string): Promise<Page<QueueEntry>> =>
  axios.get('/examination-queue', {
    params: { queueDate, page: 1, limit: 100 },
  })

export const getQueueDashboard = (queueDate: string): Promise<QueueDashboard> =>
  axios.get('/examination-queue/dashboard', { params: { queueDate } })

export const getPatients = async (): Promise<QueueUser[]> => {
  const response = await axios.get<unknown, Page<QueueUser>>('/users', {
    params: { page: 1, limit: 100 },
  })
  return response.data.filter((user) => user.role === 'PATIENT')
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
