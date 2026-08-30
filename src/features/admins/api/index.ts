import { axios } from '@/lib/axios'

export interface Params {
  fullName: string
  phone: string
  gender: string
  sort: string
  page: number
}

export interface AdminDtoRequest {
  email: string
  fullName?: string
  phone?: string
  gender?: number
  dateOfBirth?: string
}

export interface AdminResponse {
  status: boolean
  data: Admin
}

export interface AdminsResponse {
  status: boolean
  data: Admin[]
  pagination: { total: number }
}

export interface Admin {
  id: string
  email: string
  fullName?: string
  phone?: string
  gender?: number
  dateOfBirth?: string
  isSuperAdmin: boolean
}

const CreateAdmin = (data: AdminDtoRequest): Promise<void> => {
  return axios.post('/admin', data)
}

const GetAdmins = (params?: Params): Promise<AdminsResponse> => {
  return axios.get('/admin', { params })
}

const GetAdmin = (id: string): Promise<AdminResponse> => {
  return axios.get(`/admin/${id}`)
}

const UpdateAdmin = (id: string, data: AdminDtoRequest): Promise<void> => {
  return axios.patch(`/admin/${id}`, data)
}

const DeleteAdmin = (id: string): Promise<void> => {
  return axios.delete(`/admin/${id}`)
}

export { CreateAdmin, GetAdmins, GetAdmin, UpdateAdmin, DeleteAdmin }
