import { axios } from '@/lib/axios'

export interface LandingConfig {
  branding: {
    name: string
    tagline: string
    logoUrl: string
    primaryColor: string
    accentColor: string
  }
  hero: { title: string; highlightedText: string; description: string; imageUrl: string }
  doctor: { name: string; specialty: string; description: string; imageUrl: string }
  services: string[]
  booking: { workingHours: string; slots: string[] }
  contact: { phone: string; address: string; mapUrl: string }
  seo: { title: string; description: string }
}

export interface LandingConfigResponse {
  config: LandingConfig | Record<string, never>
  isPublished: boolean
  version: number
}

export const getLandingConfig = () =>
  axios.get<unknown, LandingConfigResponse>('/landing-config')

export const updateLandingConfig = (data: {
  config: LandingConfig
  isPublished: boolean
}) => axios.put<unknown, LandingConfigResponse>('/landing-config', data)
