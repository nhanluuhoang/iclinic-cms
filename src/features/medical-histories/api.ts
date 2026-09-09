import { axios } from '@/lib/axios'

export interface MedicalHistoryListItem {
  id: string
  symptoms: string
  diagnosis: string
  treatment: string
  doctorName: string
  createdAt: string
  user: {
    id: string
    fullName: string
    phone?: string | null
  }
  prescription: {
    id: string
    items: Array<{
      id: string
      medicineName: string
      quantity: number | null
      instruction: string
      medicine: {
        unit: string
        salePrice: number | string
      } | null
    }>
    invoice: {
      invoiceCode: string
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
    } | null
  } | null
  images: MedicalHistoryMedia[]
  pdfs: MedicalHistoryMedia[]
  videos: MedicalHistoryMedia[]
}

interface MedicalHistoryMedia {
  id: string
  fileName: string
  status: string
  createdAt: string
}

interface MedicalHistoryPage {
  data: MedicalHistoryListItem[]
  total: number
  page: number
  limit: number
}

export const getMedicalHistoryList = (params: {
  patientName?: string
  doctorName?: string
  date: string
  page: number
  limit: number
}): Promise<MedicalHistoryPage> => axios.get('/medical-histories', { params })
