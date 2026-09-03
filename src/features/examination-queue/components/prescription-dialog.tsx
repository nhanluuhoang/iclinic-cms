import { useState } from 'react'
import { ClipboardList, FileClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Prescriptions } from '@/features/prescriptions'
import { type QueueUser } from '../api'
import { MedicalHistoryContent } from './medical-history-content'

type View = 'prescription' | 'history'

export function PrescriptionDialog({
  open,
  onOpenChange,
  patient,
  queueId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: QueueUser
  queueId: string
}) {
  const [view, setView] = useState<View>('prescription')

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setView('prescription')
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className='grid h-[96dvh] w-[98vw] max-w-[98vw] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-[min(98vw,90rem)]'
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Khám và kê toa</DialogTitle>
        </DialogHeader>
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as View)}
          className='min-h-0 gap-3'
        >
          <TabsList>
            <TabsTrigger value='prescription'>
              <ClipboardList /> Kê toa
            </TabsTrigger>
            <TabsTrigger value='history'>
              <FileClock /> Lịch sử khám
            </TabsTrigger>
          </TabsList>
          <TabsContent value='prescription' className='overflow-y-auto pe-1'>
            <Prescriptions patient={patient} examinationQueueId={queueId} />
          </TabsContent>
          <TabsContent value='history' className='overflow-y-auto pe-1'>
            <MedicalHistoryContent patient={patient} />
          </TabsContent>
        </Tabs>
        <div className='flex justify-end gap-2 border-t pt-3'>
          {view === 'prescription' && (
            <Button type='submit' form='prescription-form'>
              Lưu chẩn đoán và kê đơn
            </Button>
          )}
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              setView('prescription')
              onOpenChange(false)
            }}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
