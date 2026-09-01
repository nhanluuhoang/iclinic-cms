import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { createQueueEntry, getPatients, type QueueUser } from '../api'
import { showQueueError } from '../utils'

export function CreateQueueDialog({
  open,
  onOpenChange,
  queueDate,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueDate: string
  onCreated: () => void
}) {
  const [patientId, setPatientId] = useState('')
  const [priority, setPriority] = useState(0)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<QueueUser | null>(null)
  const debouncedPatientSearch = useDebounce(patientSearch, 300)
  const patients = useQuery({
    queryKey: ['queue-patients', debouncedPatientSearch],
    queryFn: () => getPatients(debouncedPatientSearch),
    enabled: open && comboboxOpen,
  })

  const create = useMutation({
    mutationFn: () =>
      createQueueEntry({
        patientId,
        queueDate,
        priority,
        reason: reason.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã tiếp nhận bệnh nhân')
      setPatientId('')
      setSelectedPatient(null)
      setPatientSearch('')
      setReason('')
      setNote('')
      setPriority(0)
      onOpenChange(false)
      onCreated()
    },
    onError: showQueueError,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tiếp nhận bệnh nhân</DialogTitle>
          <DialogDescription>
            Thêm bệnh nhân vào thứ tự khám ngày {queueDate}.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label>
              Bệnh nhân <span className='text-destructive'>*</span>
            </Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={comboboxOpen}
                  className='w-full justify-between font-normal'
                >
                  {selectedPatient ? (
                    <span className='truncate'>
                      {selectedPatient.fullName}
                      {selectedPatient.phone
                        ? ` · ${selectedPatient.phone}`
                        : ''}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>
                      Tìm tên, SĐT bệnh nhân...
                    </span>
                  )}
                  <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-(--radix-popover-trigger-width) p-0'
                align='start'
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    value={patientSearch}
                    onValueChange={setPatientSearch}
                    placeholder='Tìm theo tên, số điện thoại...'
                  />
                  <CommandList>
                    <CommandEmpty>
                      {patients.isLoading
                        ? 'Đang tìm...'
                        : 'Không tìm thấy bệnh nhân nào.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {(patients.data ?? []).map((patient) => (
                        <CommandItem
                          key={patient.id}
                          value={patient.id}
                          onSelect={() => {
                            setPatientId(patient.id)
                            setSelectedPatient(patient)
                            setComboboxOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'me-2 size-4',
                              patientId === patient.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className='flex flex-col'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {patient.fullName}
                              </span>
                              {patient.dateOfBirth && (
                                <span className='text-xs text-muted-foreground'>
                                  (
                                  {new Date(
                                    patient.dateOfBirth
                                  ).toLocaleDateString('vi-VN')}
                                  )
                                </span>
                              )}
                              {patient.phone && (
                                <span className='text-xs text-muted-foreground'>
                                  SĐT: {patient.phone}
                                </span>
                              )}
                            </div>
                            {patient.address && (
                              <span className='truncate text-xs text-muted-foreground'>
                                {patient.address}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='queue-priority'>Mức ưu tiên (0–100)</Label>
            <Input
              id='queue-priority'
              type='number'
              min={0}
              max={100}
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='queue-reason'>Lý do khám</Label>
            <Input
              id='queue-reason'
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='queue-note'>Ghi chú</Label>
            <Textarea
              id='queue-note'
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            disabled={!patientId || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? 'Đang lưu...' : 'Tiếp nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
