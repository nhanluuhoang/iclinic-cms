import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePatients } from './patients-provider'

export function PatientsPrimaryButtons() {
  const { setOpen } = usePatients()
  return (
    <Button data-tour='create-patient' onClick={() => setOpen('create')}>
      Thêm bệnh nhân
      <Plus size={18} />
    </Button>
  )
}
