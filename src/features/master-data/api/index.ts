import { axios } from '@/lib/axios'

export interface MasterDataParams {
  sort?: string
  page: number
  key?: string
}

export interface MasterDataDtoRequest {
  key: string
  value: string
}

export interface MasterDatasResponse {
  status: boolean
  data: MasterData[]
  pagination: { total: number }
}

export interface MasterData {
  id: string
  key: string
  value: string
}

const CreateMasterData = (data: MasterDataDtoRequest): Promise<void> => {
  return axios.post('/master-data', data)
}

const GetMasterDatas = (
  params?: MasterDataParams
): Promise<MasterDatasResponse> => {
  return axios.get('/master-data', { params })
}

const UpdateMasterData = (
  id: string,
  data: MasterDataDtoRequest
): Promise<void> => {
  return axios.patch(`/master-data/${id}`, data)
}

const DeleteMasterData = (id: string): Promise<void> => {
  return axios.delete(`/master-data/${id}`)
}

export {
  CreateMasterData,
  GetMasterDatas,
  UpdateMasterData,
  DeleteMasterData,
}
