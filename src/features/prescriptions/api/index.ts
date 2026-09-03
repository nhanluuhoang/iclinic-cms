import { axios } from '@/lib/axios'

export interface User {
  id: string
  fullName: string
  phone?: string | null
  dateOfBirth?: string | Date | null
  role: string
}

export interface Medicine {
  id: string
  name: string
  strength: string
  unit: string
  totalQty: number
  isActive: boolean
  salePrice: number
}

interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface MedicalHistoryInput {
  examinationQueueId?: string
  userId: string
  examinedAt: string
  symptoms?: string
  diagnosis: string
  treatment?: string
  advice?: string
  doctorName: string
  note?: string
}

export interface PrescriptionItemInput {
  medicineId: string
  medicineName: string
  quantity: number
  instruction?: string
}

export const getPatients = async (): Promise<User[]> => {
  const response = await axios.get<unknown, Page<User>>('/users', {
    params: { page: 1, limit: 100 },
  })
  return response.data.filter((user) => user.role === 'PATIENT')
}

export const getMedicines = async (search = ''): Promise<Medicine[]> => {
  const response = await axios.get<unknown, Page<Medicine>>(
    '/medicines/search',
    { params: { page: 1, limit: 100, search: search || undefined } }
  )
  return response.data
    .filter((medicine) => medicine.isActive)
    .map((medicine) => ({
      ...medicine,
      salePrice: Number(medicine.salePrice ?? 0),
      totalQty: Number(medicine.totalQty ?? 0),
    }))
}

export const createMedicalHistory = (
  data: MedicalHistoryInput
): Promise<{ id: string }> => axios.post('/medical-histories', data)

export const uploadMedicalHistoryAttachments = (
  medicalHistoryId: string,
  files: File[]
): Promise<void> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return axios.post(
    `/medical-histories/${medicalHistoryId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

export const createPrescription = (data: {
  medicalHistoryId: string
  items: PrescriptionItemInput[]
  serviceFee?: number
  serviceFeeLabel?: string
  otherFee1?: number
  otherFee2?: number
  otherFee3?: number
  otherFee1Label?: string
  otherFee2Label?: string
  otherFee3Label?: string
}): Promise<void> => axios.post('/prescriptions', data)
