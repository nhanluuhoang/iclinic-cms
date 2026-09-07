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
  symptoms?: string
  diagnosis: string
  treatment?: string
  advice?: string
  doctorName: string
  note?: string
  images?: string[]
  pdfs?: string[]
  videos?: string[]
}

export interface PrescriptionItemInput {
  medicineId: string
  medicineName: string
  quantity: number
  instruction?: string
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

export const createPrescription = (data: {
  medicalHistory: MedicalHistoryInput
  prescriptionItems: PrescriptionItemInput[]
  consultationFee: number
  serviceFee?: number
  serviceFeeLabel?: string
  otherFee1?: number
  otherFee2?: number
  otherFee3?: number
  otherFee1Label?: string
  otherFee2Label?: string
  otherFee3Label?: string
}): Promise<void> => axios.post('/medical-histories', data)

export const updatePrescription = (
  medicalHistoryId: string,
  data: { prescriptionItems: PrescriptionItemInput[] }
): Promise<void> =>
  axios.patch(`/medical-histories/${medicalHistoryId}`, data)
