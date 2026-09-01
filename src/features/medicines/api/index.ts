import { axios } from '@/lib/axios'
import { type Medicine, type MedicineGroup } from './types'

interface Page<T> {
  data: T[]
  total: number
}

interface ApiMedicine extends Omit<Medicine, 'group'> {
  medicineGroup: MedicineGroup
}

const generatedCode = () => `MED-${Date.now().toString(36).toUpperCase()}`

const GetMedicines = async (search = ''): Promise<Medicine[]> => {
  const first = await axios.get<unknown, Page<ApiMedicine>>(
    '/inventory/medicines',
    { params: { page: 1, limit: 100, search: search || undefined } }
  )
  const pageCount = Math.ceil(first.total / 100)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      axios.get<unknown, Page<ApiMedicine>>('/inventory/medicines', {
        params: { page: index + 2, limit: 100, search: search || undefined },
      })
    )
  )

  return [...first.data, ...rest.flatMap((page) => page.data)].map(
    (medicine) => ({ ...medicine, group: medicine.medicineGroup })
  )
}

const CreateMedicine = (data: Omit<Medicine, 'id' | 'code'>): Promise<void> =>
  axios.post('/inventory/medicines', {
    ...data,
    code: generatedCode(),
    medicineGroup: data.group,
    group: undefined,
  })

const UpdateMedicine = (
  id: string,
  data: Omit<Medicine, 'id' | 'code'>
): Promise<void> =>
  axios.patch(`/inventory/medicines/${id}`, {
    ...data,
    medicineGroup: data.group,
    group: undefined,
  })

const DeleteMedicine = (id: string): Promise<void> =>
  axios.delete(`/inventory/medicines/${id}`)

export { CreateMedicine, DeleteMedicine, GetMedicines, UpdateMedicine }
export * from './types'
