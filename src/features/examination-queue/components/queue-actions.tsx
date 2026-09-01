import { useState } from 'react'
import { ClipboardList, UserRoundCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type QueueEntry, type QueueStatus } from '../api'
import { transitions } from '../data/data'
import { PrescriptionDialog } from './prescription-dialog'

export function QueueActions({
  item,
  pending,
  onStatus,
  onCheckIn,
}: {
  item: QueueEntry
  pending: boolean
  onStatus: (status: QueueStatus) => void
  onCheckIn: () => void
}) {
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)

  return (
    <>
      <div className='flex flex-wrap justify-end gap-1'>
        {item.status === 'BOOKED' && (
          <Button
            size='sm'
            variant='outline'
            disabled={pending}
            onClick={onCheckIn}
          >
            <UserRoundCheck /> Check-in
          </Button>
        )}
        {item.status === 'IN_EXAMINATION' && (
          <>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setPrescriptionOpen(true)}
            >
              <ClipboardList /> Kê toa
            </Button>
          </>
        )}
        {(transitions[item.status] ?? []).map((action) => (
          <Button
            key={action.status}
            size='sm'
            variant={
              action.status === 'CANCELLED' || action.status === 'NO_SHOW'
                ? 'ghost'
                : 'outline'
            }
            disabled={pending}
            onClick={() => onStatus(action.status)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <PrescriptionDialog
        open={prescriptionOpen}
        onOpenChange={setPrescriptionOpen}
        patient={item.patient}
      />
    </>
  )
}
