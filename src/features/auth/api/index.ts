import { axios } from '@/lib/axios'
import { getDeviceId } from '@/lib/fingerprint'

export interface LoginRequest {
  userName: string
  password: string
}

export interface ProfileResponse {
  status: boolean
  data: ProfileData
}

export interface ProfileData {
  id: string
  email: string
  tenantId?: string
  phone?: string
  fullName?: string
  dateOfBirth?: string
  gender?: number
  isSuperAdmin: boolean
  role?: string
  tenant?: {
    servicePlan: 'BASIC' | 'PLUS' | 'PRO'
  } | null
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  passwordConfirmation: string
}

const Login = async (data: LoginRequest): Promise<void> => {
  const deviceId = await getDeviceId()
  return axios.post('/auth/login', data, {
    headers: {
      'x-device-id': deviceId,
    },
    withCredentials: true,
  })
}

const Profile = (): Promise<ProfileResponse> => {
  return axios.get('/auth/profile', { withCredentials: true })
}

const ForgotPassword = (data: ForgotPasswordRequest): Promise<void> => {
  return axios.post('/auth/forgot-password', data)
}

const ResetPassword = (data: ResetPasswordRequest): Promise<void> => {
  return axios.post('/auth/reset-password', data)
}

const Logout = () => {
  return axios.delete('/auth/logout')
}

export { Login, Profile, ForgotPassword, ResetPassword, Logout }
