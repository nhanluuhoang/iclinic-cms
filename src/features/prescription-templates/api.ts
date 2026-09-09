import { axios } from '@/lib/axios'

export interface PrescriptionTemplateItem {
  medicineId: string
  medicineName: string
  quantity: number
  instruction: string
}

export interface PrescriptionTemplate {
  id: string
  name: string
  items: PrescriptionTemplateItem[]
}

interface ApiPrescriptionTemplate {
  id: string
  name: string
  items: Array<
    Omit<PrescriptionTemplateItem, 'medicineName'> & {
      id: string
      templateId: string
      medicine: { name: string }
    }
  >
}

export const getPrescriptionTemplates = async (search = '') => {
  const templates = await axios.get<unknown, ApiPrescriptionTemplate[]>(
    '/prescription-templates',
    { params: { search: search || undefined } }
  )
  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    items: template.items.map((item) => ({
      medicineId: item.medicineId,
      medicineName: item.medicine.name,
      quantity: item.quantity,
      instruction: item.instruction,
    })),
  }))
}

export const createPrescriptionTemplate = (
  data: Omit<PrescriptionTemplate, 'id'>
) =>
  axios.post('/prescription-templates', {
    name: data.name,
    items: data.items.map((item) => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
      instruction: item.instruction,
    })),
  })

export const updatePrescriptionTemplate = (
  template: PrescriptionTemplate,
  data: Omit<PrescriptionTemplate, 'id'>
) =>
  axios.patch(`/prescription-templates/${template.id}`, {
    name: data.name,
    items: data.items.map((item) => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
      instruction: item.instruction,
    })),
  })

export const deletePrescriptionTemplate = (id: string) =>
  axios.delete(`/prescription-templates/${id}`)
