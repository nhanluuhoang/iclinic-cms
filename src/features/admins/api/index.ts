import { axios } from '@/lib/axios'

export type StaffRole = 'DOCTOR' | 'ASSISTANT'

export interface Params {
  fullName: string
  page: number
  pageSize: number
}

export interface StaffInput {
  email?: string
  fullName: string
  phone?: string
  role: StaffRole
  password?: string
  passwordConfirmation?: string
  isActive?: boolean
}

export interface Admin {
  id: string
  userName: string
  email: string | null
  fullName: string
  phone: string | null
  role: 'TENANT_ADMIN' | StaffRole
  isActive: boolean
}

export interface AdminsResponse {
  data: Admin[]
  total: number
  page: number
  limit: number
}

const CreateAdmin = (data: StaffInput): Promise<Admin> =>
  axios.post('/users', data)

const GetAdmins = ({
  fullName,
  page,
  pageSize,
}: Params): Promise<AdminsResponse> =>
  axios.get('/users', {
    params: { search: fullName || undefined, page, limit: pageSize },
  })

const UpdateAdmin = (id: string, data: StaffInput): Promise<Admin> =>
  axios.patch(`/users/${id}`, data)

const DeleteAdmin = (id: string): Promise<Admin> =>
  axios.delete(`/users/${id}`)

export { CreateAdmin, GetAdmins, UpdateAdmin, DeleteAdmin }
