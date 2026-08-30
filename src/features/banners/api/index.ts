import { axios } from '@/lib/axios'

export interface Params {
  sort?: string
  page: number
  isPublic?: boolean
}

export interface BannerDtoRequest {
  fileName: string
  isPublic: boolean
  sortOrder: number
  type: string
}

export interface AdminResponse {
  status: boolean
  data: Banner
}

export interface AdminsResponse {
  status: boolean
  data: Banner[]
  pagination: { total: number }
}

export interface Banner {
  id: string
  fileName: string
  isPublic: boolean
  sortOrder: number
  type: string
}

const CreateBanner = (data: BannerDtoRequest): Promise<void> => {
  return axios.post('/banner', data)
}

const GetBanners = (params?: Params): Promise<AdminsResponse> => {
  return axios.get('/banner', { params })
}

const GetBanner = (id: string): Promise<AdminResponse> => {
  return axios.get(`/banner/${id}`)
}

const UpdateBanner = (id: string, data: BannerDtoRequest): Promise<void> => {
  return axios.patch(`/banner/${id}`, data)
}

const DeleteBanner = (id: string): Promise<void> => {
  return axios.delete(`/banner/${id}`)
}

const UploadFile = (file: File): Promise<{ fileName: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post('/Banner/Upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export {
  CreateBanner,
  GetBanners,
  GetBanner,
  UpdateBanner,
  DeleteBanner,
  UploadFile,
}
