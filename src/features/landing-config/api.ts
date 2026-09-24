import { axios } from '@/lib/axios'

export interface LandingConfigFields {
  tagline: string
  logoUrl: string
  primaryColor: string
  accentColor: string
  heroTitle: string
  heroHighlightedText: string
  heroDescription: string
  heroImageUrl: string
  doctorName: string
  doctorSpecialty: string
  doctorDescription: string
  doctorImageUrl: string
  services: string[]
  featuredPostIds: string[]
  bookingWorkingHours: string
  bookingSlots: string[]
  contactPhone: string
  contactMapUrl: string
  seoTitle: string
  seoDescription: string
}

export interface LandingConfigResponse extends LandingConfigFields {
  tenant: {
    name: string
    address: string | null
    subdomain: string
  }
  version: number
}

export const getLandingConfig = () =>
  axios.get<unknown, LandingConfigResponse>('/landing-config')

export const updateLandingConfig = (data: LandingConfigFields) =>
  axios.put<unknown, LandingConfigResponse>('/landing-config', data)
