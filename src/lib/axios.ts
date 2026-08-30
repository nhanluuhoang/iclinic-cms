import Axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_URL } from '@/config'

const authRequestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  config.headers.Accept = 'application/json'

  if (!config.headers['Content-Type'])
    config.headers['Content-Type'] = 'application/json'

  return config
}

export const axios = Axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

axios.interceptors.request.use(authRequestInterceptor)

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data || error.message
    return Promise.reject(message)
  }
)
