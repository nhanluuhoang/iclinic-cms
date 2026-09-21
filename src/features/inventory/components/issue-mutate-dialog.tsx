import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { CreateGoodsIssue, SearchBatches, type StockBatch } from '../api'
import { formatDate, formatNumber, toDateInput } from '../utils'

const lineSchema = z.object({
  batchId: z.string().min(1, 'Chọn lô thuốc'),
  quantity: z
    .number()
    .int('Số lượng phải là số nguyên')
    .positive('Số lượng phải lớn hơn 0'),
})

const formSchema = z.object({
  recipientName: z.string().min(1, 'Nhập người nhận'),
  issuedAt: z.string().min(1, 'Chọn ngày xuất'),
  note: z.string(),
  lines: z.array(lineSchema).min(1),
})

type IssueForm = z.infer<typeof formSchema>
const emptyLine = { batchId: '', quantity: 1 }
const defaults = (): IssueForm => ({
  recipientName: '',
  issuedAt: toDateInput(new Date()),
  note: '',
  lines: [{ ...emptyLine }],
})

function BatchPicker({
  selected,
  onChange,
}: {
  selected?: StockBatch
  onChange: (batch: StockBatch) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: batches, isLoading } = useQuery({
    queryKey: ['inventory', 'batch-search', debouncedSearch],
    queryFn: () => SearchBatches(debouncedSearch),
    enabled: open,
  })
  const availableBatches = (batches ?? []).filter(
    (batch) => batch.qtyRemaining > 0
  )

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
              ? `${selected.medicineName} · lô ${selected.batchNo}`
              : isLoading
                ? 'Đang tải lô thuốc...'
                : 'Tìm thuốc hoặc số lô'}
          </span>
          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Tìm tên, mã thuốc hoặc số lô...'
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Đang tìm...' : 'Không tìm thấy lô thuốc còn tồn.'}
            </CommandEmpty>
            <CommandGroup>
              {availableBatches.map((batch) => (
                <CommandItem
                  key={batch.id}
                  value={`${batch.medicineName} ${batch.medicineCode} ${batch.batchNo}`}
                  onSelect={() => {
                    onChange(batch)
                    setOpen(false)
                  }}
                  className='items-start'
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-4',
                      batch.id === selected?.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='min-w-0'>
                    <p className='truncate font-medium'>
                      {batch.medicineName} · lô {batch.batchNo}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {batch.medicineCode} · còn{' '}
                      {formatNumber(batch.qtyRemaining)} {batch.unit} · HSD{' '}
                      {formatDate(batch.expiryDate)}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function IssueMutateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [selectedBatches, setSelectedBatches] = useState<
    Record<string, StockBatch>
  >({})
  const form = useForm<IssueForm>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  })

  useEffect(() => {
    if (open) {
      form.reset(defaults())
      setSelectedBatches({})
    }
  }, [form, open])

  const onSubmit = async (data: IssueForm) => {
    const selectedIds = data.lines.map((line) => line.batchId)
    if (new Set(selectedIds).size !== selectedIds.length) {
      toast.error('Mỗi lô chỉ được chọn một lần')
      return
    }
    const invalidLine = data.lines.find((line) => {
      const batch = selectedBatches[line.batchId]
      return !batch || line.quantity > batch.qtyRemaining
    })
    if (invalidLine) {
      toast.error('Số lượng xuất vượt quá tồn của lô')
      return
    }

    try {
      await CreateGoodsIssue(data)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Đã xuất hàng')
      onOpenChange(false)
    } catch (error) {
      toast.error('Không xuất được hàng', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Xuất hàng</DialogTitle>
          <DialogDescription>
            Chọn từng lô thuốc và số lượng cần xuất. Không thể xuất vượt số tồn
            hiện tại của lô.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='issue-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 overflow-y-auto px-1'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='recipientName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người nhận</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Tên người hoặc bộ phận' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='issuedAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày xuất</FormLabel>
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <FormLabel>Chi tiết xuất kho</FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ ...emptyLine })}
                >
                  <Plus className='size-4' /> Thêm dòng
                </Button>
              </div>
              {fields.map((item, index) => {
                const selected =
                  selectedBatches[form.watch(`lines.${index}.batchId`)]
                return (
                  <div
                    key={item.id}
                    className='grid items-start gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto]'
                  >
                    <FormField
                      control={form.control}
                      name={`lines.${index}.batchId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Thuốc / lô</FormLabel>
                          <BatchPicker
                            selected={selected}
                            onChange={(batch) => {
                              setSelectedBatches((current) => ({
                                ...current,
                                [batch.id]: batch,
                              }))
                              field.onChange(batch.id)
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Số lượng</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              min={1}
                              step={1}
                              max={selected?.qtyRemaining}
                              onChange={(event) =>
                                field.onChange(Number(event.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='mt-6 text-red-600'
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      aria-label={`Xoá dòng ${index + 1}`}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                )
              })}
            </div>

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='Lý do xuất kho...' />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            form='issue-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Xuất hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
