import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MedicalHistoryContent } from '@/features/examination-queue/components/medical-history-content'
import { type Patient } from '../api'

export function PatientHistoryDialog({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Lịch sử khám</DialogTitle>
          <DialogDescription>{patient.fullName}</DialogDescription>
        </DialogHeader>
        <MedicalHistoryContent patient={patient} />
      </DialogContent>
    </Dialog>
  )
}
