export type MedicineGroup =
  | 'antibiotic'
  | 'analgesic'
  | 'vitamin'
  | 'cardio'
  | 'digestive'
  | 'respiratory'
  | 'other'

export interface Medicine {
  id: string
  code: string
  name: string
  activeIngredient: string
  strength: string
  unit: string
  group: MedicineGroup
  manufacturer: string
  minStock: number
  isActive: boolean
}
