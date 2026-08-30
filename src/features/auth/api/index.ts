import { axios } from '@/lib/axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface ProfileResponse {
  status: boolean
  data: ProfileData
}

export interface ProfileData {
  id: string
  email: string
  phone?: string
  fullName?: string
  dateOfBirth?: string
  gender?: number
  isSuperAdmin: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  passwordConfirmation: string
}

const Login = (data: LoginRequest): Promise<void> => {
  return axios.post('/auth/login', data, { withCredentials: true })
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
