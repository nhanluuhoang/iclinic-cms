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
  userName: string
  email?: string | null
  tenantId?: string
  phone?: string | null
  fullName: string
  dateOfBirth?: string | null
  gender?: string | null
  address?: string | null
  note?: string | null
  isActive?: boolean
  isSuperAdmin?: boolean
  role?: string
  tenant?: {
    servicePlan: 'BASIC' | 'PLUS' | 'PRO'
    subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
    trialStartedAt?: string | null
    trialEndsAt?: string | null
    subscriptionEndsAt?: string | null
  } | null
}

export interface UpdateProfileRequest {
  fullName: string
  email: string | null
  phone: string | null
  gender: string | null
  dateOfBirth: string | null
  address: string | null
  note: string | null
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  passwordConfirmation: string
}

export interface ChangePasswordRequest {
  currentPassword: string
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

const UpdateProfile = (data: UpdateProfileRequest): Promise<ProfileResponse> => {
  return axios.patch('/auth/profile', data, { withCredentials: true })
}

const ForgotPassword = (data: ForgotPasswordRequest): Promise<void> => {
  return axios.post('/auth/forgot-password', data)
}

const ResetPassword = (data: ResetPasswordRequest): Promise<void> => {
  return axios.post('/auth/reset-password', data)
}

const ChangePassword = (data: ChangePasswordRequest): Promise<void> => {
  return axios.patch('/auth/change-password', data)
}

const Logout = () => {
  return axios.delete('/auth/logout')
}

export {
  Login,
  Profile,
  UpdateProfile,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  Logout,
}
