import { axios } from '@/lib/axios'

/**
 * Suy ra từ Prisma model Patient. Giới hạn VarChar của DB được đưa vào zod
 * schema ở `patients-mutate-dialog.tsx` để form chặn trước khi gọi API.
 *
 * Endpoint đặt là `/patient` (số ít, chữ thường) theo đúng convention đang có:
 * /admin, /banner, /post, /master-data.
 */

export interface PatientParams {
  page: number
  pageSize?: number
  fullName?: string
  phone?: string
  gender?: string
  sort?: string
}

/**
 * Dữ liệu API trả về. CỐ Ý không có `password` — backend không bao giờ được
 * trả hash mật khẩu ra client, kể cả khi Prisma model có cột đó.
 *
 * Các field nullable trong Prisma (`String?`) để `| null` vì Postgres trả NULL,
 * không phải undefined.
 */
export interface Patient {
  id: string
  userName: string
  fullName: string
  email?: string | null
  phone?: string | null
  gender?: number | null
  dateOfBirth?: string | null
  address?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Payload gửi lên.
 *
 * KHÔNG có `userName`: backend tự sinh khi tạo, và client không được phép đổi
 * khi sửa. Nó chỉ tồn tại ở `Patient` (dữ liệu đọc về để hiển thị).
 *
 * `password` bắt buộc khi tạo, và được BỎ HẲN khỏi payload khi sửa mà người
 * dùng không đổi mật khẩu — không gửi chuỗi rỗng, vì backend có thể hiểu thành
 * "đặt mật khẩu thành rỗng".
 */
export interface PatientDtoRequest {
  password?: string
  fullName: string
  email?: string
  phone?: string
  gender?: number
  dateOfBirth?: string
  address?: string
  note?: string
}

export interface PatientResponse {
  status: boolean
  data: Patient
}

export interface PatientsResponse {
  status: boolean
  data: Patient[]
  pagination: { total: number }
}

const CreatePatient = (data: PatientDtoRequest): Promise<void> => {
  return axios.post('/patient', data)
}

const GetPatients = (params?: PatientParams): Promise<PatientsResponse> => {
  return axios.get('/patient', { params })
}

const GetPatient = (id: string): Promise<PatientResponse> => {
  return axios.get(`/patient/${id}`)
}

const UpdatePatient = (id: string, data: PatientDtoRequest): Promise<void> => {
  return axios.patch(`/patient/${id}`, data)
}

const DeletePatient = (id: string): Promise<void> => {
  return axios.delete(`/patient/${id}`)
}

export { CreatePatient, GetPatients, GetPatient, UpdatePatient, DeletePatient }
