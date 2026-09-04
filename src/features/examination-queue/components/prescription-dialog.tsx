import { useState } from 'react'
import { ClipboardList, FileClock, LoaderCircle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Prescriptions } from '@/features/prescriptions'
import { type QueueEntry, type QueueUser } from '../api'
import { MedicalHistoryContent } from './medical-history-content'

type View = 'prescription' | 'history'

export function PrescriptionDialog({
  open,
  onOpenChange,
  patient,
  queueId,
  initialData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: QueueUser
  queueId: string
  initialData: QueueEntry['medicalHistory']
}) {
  const [view, setView] = useState<View>('prescription')
  const [isUploading, setIsUploading] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isUploading) return
        if (!nextOpen) setView('prescription')
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className='max-h-[96dvh] w-[98vw] max-w-[98vw] overflow-y-auto sm:max-w-[min(98vw,90rem)]'
        onInteractOutside={(event) => event.preventDefault()}
      >
        {isUploading &&
          createPortal(
            <div
              className='fixed inset-0 z-[100] flex cursor-wait items-center justify-center bg-background/80 backdrop-blur-[1px]'
              role='status'
              aria-live='polite'
            >
              <div className='flex items-center gap-3 rounded-lg border bg-background px-5 py-4 shadow-lg'>
                <LoaderCircle className='size-5 animate-spin' />
                <span className='font-medium'>Đang tải tệp lên...</span>
              </div>
            </div>,
            document.body
          )}
        <DialogHeader>
          <DialogTitle>Khám và kê toa</DialogTitle>
        </DialogHeader>
        <Tabs
          value={view}
          onValueChange={(value) => {
            if (!isUploading) setView(value as View)
          }}
          className='gap-3'
        >
          <TabsList>
            <TabsTrigger value='prescription'>
              <ClipboardList /> Kê toa
            </TabsTrigger>
            <TabsTrigger value='history'>
              <FileClock /> Lịch sử khám
            </TabsTrigger>
          </TabsList>
          <TabsContent value='prescription' className='pe-1'>
            <Prescriptions
              patient={patient}
              examinationQueueId={queueId}
              initialData={initialData}
              onUploadingChange={setIsUploading}
              onSaved={() => {
                setView('prescription')
                onOpenChange(false)
              }}
            />
          </TabsContent>
          <TabsContent value='history' className='pe-1'>
            <MedicalHistoryContent patient={patient} />
          </TabsContent>
        </Tabs>
        <div className='sticky bottom-0 z-10 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-background px-6 py-4'>
          {view === 'prescription' && (
            <Button
              type='submit'
              form='prescription-form'
              disabled={isUploading}
            >
              Lưu chẩn đoán và kê đơn
            </Button>
          )}
          <Button
            type='button'
            variant='outline'
            disabled={isUploading}
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
