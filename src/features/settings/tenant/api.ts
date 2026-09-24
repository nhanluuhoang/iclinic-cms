import { axios } from '@/lib/axios'

export interface TenantData {
  id: string
  code: string
  name: string
  address: string
  subdomain: string
  servicePlan: 'BASIC' | 'PLUS' | 'PRO'
  isActive: boolean
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  trialEndsAt?: string | null
  subscriptionEndsAt?: string | null
}

export interface UpdateTenantRequest {
  name?: string
  address?: string
}

export const getOwnTenant = (): Promise<TenantData> => axios.get('/tenants/me')

export const updateOwnTenant = (
  data: UpdateTenantRequest
): Promise<TenantData> => axios.patch('/tenants/me', data)
