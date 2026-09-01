import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Check,
  ChevronsUpDown,
  FileText,
  ImagePlus,
  Plus,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import {
  createMedicalHistory,
  createPrescription,
  getMedicines,
  type User,
  type Medicine,
  type PrescriptionItemInput,
  uploadMedicalHistoryAttachments,
} from './api'

type MedicineRow = Omit<PrescriptionItemInput, 'medicineId' | 'quantity'> & {
  key: number
  medicineId?: string
  quantity?: number
}

const emptyMedicine = (key: number): MedicineRow => ({
  key,
  medicineName: '',
  dosage: 'Theo chỉ định',
  frequency: 'Theo chỉ định',
  duration: 'Theo chỉ định',
  instruction: '',
})

const MAX_ATTACHMENTS = 10
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const ACCEPTED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]
const INSTRUCTION_OPTIONS = [
  'Uống trước ăn',
  'Uống sau ăn',
  'Uống trong bữa ăn',
  'Uống vào buổi sáng',
  'Uống vào buổi tối',
  'Uống khi cần',
  'Ngậm dưới lưỡi',
  'Bôi ngoài da',
]

export function Prescriptions({
  patient,
  formId = 'prescription-form',
}: {
  patient: User
  formId?: string
}) {
  const doctorName = useAuthStore((state) => state.auth.user?.fullName ?? '')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [note, setNote] = useState('')
  const [advice, setAdvice] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [nextKey, setNextKey] = useState(2)
  const [items, setItems] = useState<MedicineRow[]>([emptyMedicine(1)])

  const medicines = useQuery({
    queryKey: ['prescription-medicines'],
    queryFn: getMedicines,
  })

  const save = useMutation({
    mutationFn: async () => {
      const history = await createMedicalHistory({
        userId: patient.id,
        examinedAt: new Date().toISOString(),
        symptoms: symptoms.trim() || undefined,
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim() || undefined,
        advice: advice.trim() || undefined,
        doctorName: doctorName.trim(),
        note: note.trim() || undefined,
      })
      if (attachments.length) {
        await uploadMedicalHistoryAttachments(history.id, attachments)
      }
      await createPrescription({
        medicalHistoryId: history.id,
        items: items.map(({ key: _key, ...item }) => ({
          ...item,
          medicineId: item.medicineId!,
          medicineName: item.medicineName.trim(),
          dosage: 'Theo chỉ định',
          frequency: 'Theo chỉ định',
          duration: 'Theo chỉ định',
          quantity: item.quantity!,
          instruction: item.instruction?.trim() || undefined,
        })),
      })
    },
    onSuccess: () => {
      toast.success('Đã lưu chẩn đoán và kê đơn thuốc')
      setSymptoms('')
      setDiagnosis('')
      setTreatment('')
      setNote('')
      setAdvice('')
      setAttachments([])
      setItems([emptyMedicine(nextKey)])
      setNextKey((value) => value + 1)
    },
    onError: (error) =>
      toast.error(
        typeof error === 'string'
          ? error
          : 'Không thể lưu hồ sơ khám và đơn thuốc'
      ),
  })

  const updateItem = (key: number, patch: Partial<MedicineRow>) =>
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )

  const addItem = () => {
    setItems((current) => [...current, emptyMedicine(nextKey)])
    setNextKey((value) => value + 1)
  }

  const addAttachments = (files: FileList | null) => {
    if (!files) return
    const selected = Array.from(files)
    const invalid = selected.find((file) => {
      const maxSize = file.type.startsWith('video/')
        ? MAX_VIDEO_SIZE
        : MAX_ATTACHMENT_SIZE
      return (
        !ACCEPTED_ATTACHMENT_TYPES.includes(file.type) || file.size > maxSize
      )
    })
    if (invalid) {
      toast.error(
        'Chỉ nhận JPG, JPEG, PNG, PDF (tối đa 5 MB) hoặc MP4, WebM, MOV (tối đa 100 MB)'
      )
      return
    }
    if (attachments.length + selected.length > MAX_ATTACHMENTS) {
      toast.error(`Chỉ được tải lên tối đa ${MAX_ATTACHMENTS} tệp`)
      return
    }
    setAttachments((current) => [...current, ...selected])
  }

  const getQuantityError = (item: MedicineRow) => {
    if (item.quantity === undefined) return null
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return 'Số lượng phải là số nguyên từ 1 trở lên.'
    }
    if (!item.medicineId) return null
    const available =
      medicines.data?.find((medicine) => medicine.id === item.medicineId)
        ?.totalQty ?? 0
    const prescribed = items
      .filter((row) => row.medicineId === item.medicineId)
      .reduce((total, row) => total + (row.quantity ?? 0), 0)
    return prescribed > available ? `Kho chỉ còn ${available}.` : null
  }

  const isValid = Boolean(
    patient.id &&
    doctorName.trim() &&
    diagnosis.trim() &&
    items.every(
      (item) =>
        item.medicineId &&
        item.medicineName.trim() &&
        Number.isInteger(item.quantity) &&
        (item.quantity ?? 0) >= 1 &&
        !getQuantityError(item)
    )
  )

  return (
    <div className='grid gap-6'>
      <div>
        <h2 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
          <Stethoscope className='size-6' /> Kê toa thuốc
        </h2>
        <p className='text-muted-foreground'>
          Ghi nhận thông tin khám, chẩn đoán và đơn thuốc cho bệnh nhân.
        </p>
      </div>

      <form
        id={formId}
        className='grid gap-6'
        onSubmit={(event) => {
          event.preventDefault()
          if (isValid) {
            save.mutate()
          } else {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
          }
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lượt khám</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-5 md:grid-cols-2'>
            <Field label='Bệnh nhân *'>
              <Input
                value={`${patient.fullName}${
                  patient.dateOfBirth
                    ? ` · ${new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}`
                    : ''
                }`}
                disabled
              />
            </Field>
            <Field label='Bác sĩ khám *' htmlFor='doctorName'>
              <Input
                id='doctorName'
                value={doctorName}
                placeholder='Họ và tên bác sĩ'
                maxLength={255}
                disabled
                required
              />
            </Field>
            <Field
              className='md:col-span-2'
              label='Triệu chứng'
              htmlFor='symptoms'
            >
              <Textarea
                id='symptoms'
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </Field>
            <Field
              className='md:col-span-2'
              label='Chẩn đoán *'
              htmlFor='diagnosis'
            >
              <Textarea
                id='diagnosis'
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder='Nhập kết luận chẩn đoán của bác sĩ'
                required
              />
            </Field>
            <Field label='Hướng điều trị' htmlFor='treatment'>
              <Textarea
                id='treatment'
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
              />
            </Field>
            <Field label='Ghi chú hồ sơ' htmlFor='note'>
              <Textarea
                id='note'
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
            <Field
              className='md:col-span-2'
              label='Lời dặn của bác sĩ'
              htmlFor='advice'
            >
              <Textarea
                id='advice'
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder='Chế độ ăn uống, sinh hoạt và lịch tái khám...'
              />
            </Field>
            <div className='grid gap-3 md:col-span-2'>
              <div>
                <Label htmlFor='diagnosis-attachments'>Tệp chẩn đoán</Label>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Tối đa {MAX_ATTACHMENTS} tệp. Ảnh/PDF không quá 5 MB; video
                  MP4, WebM hoặc MOV không quá 100 MB.
                </p>
              </div>
              <label
                htmlFor='diagnosis-attachments'
                className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50'
              >
                <ImagePlus className='size-7 text-muted-foreground' />
                <span className='text-sm font-medium'>
                  Chọn ảnh, PDF hoặc video
                </span>
                <span className='text-xs text-muted-foreground'>
                  Đã chọn {attachments.length}/{MAX_ATTACHMENTS} tệp
                </span>
              </label>
              <Input
                id='diagnosis-attachments'
                className='sr-only'
                type='file'
                accept='image/jpeg,image/png,application/pdf,video/mp4,video/webm,video/quicktime'
                multiple
                onChange={(event) => {
                  addAttachments(event.target.files)
                  event.target.value = ''
                }}
              />
              {attachments.length > 0 && (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                  {attachments.map((file, index) => (
                    <AttachmentPreview
                      key={`${file.name}-${file.lastModified}-${index}`}
                      file={file}
                      onRemove={() =>
                        setAttachments((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index)
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn thuốc</CardTitle>
            <CardDescription>
              Tìm kiếm và chọn thuốc trong danh mục.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            {items.map((item, index) => (
              <div key={item.key} className='grid gap-4 rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <p className='font-medium'>Thuốc {index + 1}</p>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((rows) =>
                        rows.filter((row) => row.key !== item.key)
                      )
                    }
                  >
                    <Trash2 />
                    <span className='sr-only'>Xóa thuốc</span>
                  </Button>
                </div>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(8rem,0.6fr)_minmax(0,1.4fr)]'>
                  <div className='grid grid-rows-[auto_2.25rem_1rem] content-start gap-2 md:col-span-2 lg:col-span-1'>
                    <Label>
                      Thuốc <span className='text-destructive'>*</span>
                    </Label>
                    <MedicinePicker
                      medicines={medicines.data ?? []}
                      value={item.medicineId}
                      isLoading={medicines.isLoading}
                      onChange={(medicine) =>
                        updateItem(item.key, {
                          medicineId: medicine.id,
                          medicineName: medicine.name,
                        })
                      }
                    />
                    <span aria-hidden='true' />
                  </div>
                  <Field
                    label='Số lượng *'
                    className='grid-rows-[auto_2.25rem_1rem] content-start'
                  >
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      required
                      aria-invalid={Boolean(getQuantityError(item))}
                      value={item.quantity ?? ''}
                      onChange={(e) =>
                        updateItem(item.key, {
                          quantity: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                    {getQuantityError(item) && (
                      <p className='text-xs leading-4 text-destructive'>
                        {getQuantityError(item)}
                      </p>
                    )}
                    {!getQuantityError(item) && <span aria-hidden='true' />}
                  </Field>
                  <Field
                    className='grid-rows-[auto_2.25rem_1rem] content-start md:col-span-2 lg:col-span-1'
                    label='Hướng dẫn sử dụng'
                  >
                    <div>
                      <Input
                        list={`instruction-options-${item.key}`}
                        value={item.instruction}
                        onChange={(e) =>
                          updateItem(item.key, { instruction: e.target.value })
                        }
                        placeholder='Chọn hoặc nhập hướng dẫn'
                      />
                      <datalist id={`instruction-options-${item.key}`}>
                        {INSTRUCTION_OPTIONS.map((instruction) => (
                          <option key={instruction} value={instruction} />
                        ))}
                      </datalist>
                    </div>
                    <span aria-hidden='true' />
                  </Field>
                </div>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              className='w-fit justify-self-center'
              onClick={addItem}
            >
              <Plus /> Thêm thuốc
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

function MedicinePicker({
  medicines,
  value,
  isLoading,
  onChange,
}: {
  medicines: Medicine[]
  value?: string
  isLoading: boolean
  onChange: (medicine: Medicine) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = medicines.find((medicine) => medicine.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          <span className='truncate'>
            {selected
              ? `${selected.name} · ${selected.strength} (${selected.unit}) · Tồn ${selected.totalQty}`
              : isLoading
                ? 'Đang tải...'
                : 'Chọn thuốc'}
          </span>
          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command>
          <CommandInput placeholder='Tìm tên thuốc...' />
          <CommandList>
            <CommandEmpty>Không tìm thấy thuốc.</CommandEmpty>
            <CommandGroup>
              {medicines.map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={`${medicine.name} ${medicine.strength}`}
                  disabled={medicine.totalQty < 1}
                  onSelect={() => {
                    onChange(medicine)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      medicine.id === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className='min-w-0 flex-1 truncate'>
                    {medicine.name} · {medicine.strength} ({medicine.unit})
                  </span>
                  <span className='ms-auto text-xs text-muted-foreground'>
                    Tồn: {medicine.totalQty}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function AttachmentPreview({
  file,
  onRemove,
}: {
  file: File
  onRemove: () => void
}) {
  const isPdf = file.type === 'application/pdf'
  const isVideo = file.type.startsWith('video/')
  const url = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => {
    return () => URL.revokeObjectURL(url)
  }, [url])

  return (
    <div className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
      {isPdf ? (
        <div className='flex size-full flex-col items-center justify-center gap-2 p-3 text-center'>
          <FileText className='size-9 text-red-500' />
          <span className='line-clamp-2 text-xs font-medium'>{file.name}</span>
          <span className='text-xs text-muted-foreground'>
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      ) : isVideo ? (
        <video
          src={url}
          className='size-full object-cover'
          controls
          preload='metadata'
        >
          Trình duyệt không hỗ trợ phát video.
        </video>
      ) : (
        <img src={url} alt={file.name} className='size-full object-cover' />
      )}
      <Button
        type='button'
        variant='destructive'
        size='icon'
        className='absolute top-1 right-1 size-7'
        onClick={onRemove}
      >
        <X className='size-4' />
        <span className='sr-only'>Xóa tệp {file.name}</span>
      </Button>
      <div className='absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-xs text-white'>
        {file.name}
      </div>
    </div>
  )
}

function Field({
  label,
  className,
  htmlFor,
  children,
}: {
  label: string
  className?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  const required = label.endsWith(' *')

  return (
    <div className={`grid gap-2 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>
        {required ? label.slice(0, -2) : label}
        {required && <span className='text-destructive'> *</span>}
      </Label>
      {children}
    </div>
  )
}
