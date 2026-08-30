import { useEffect } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { CreateReceipt, GetMedicines } from '../api'
import { expiryMeta } from '../data/data'
import { formatMoney, getExpiryStatus, toDateInput } from '../utils'

const lineSchema = z
  .object({
    medicineId: z.string().min(1, 'Chọn thuốc'),
    batchNo: z.string().min(1, 'Nhập số lô'),
    mfgDate: z.string(),
    expiryDate: z.string().min(1, 'Nhập hạn sử dụng'),
    qty: z.number().positive('Số lượng phải lớn hơn 0'),
    unitCost: z.number().min(0, 'Đơn giá không hợp lệ'),
  })
  .refine((l) => !l.mfgDate || l.mfgDate < l.expiryDate, {
    message: 'Hạn sử dụng phải sau ngày sản xuất',
    path: ['expiryDate'],
  })

const formSchema = z.object({
  supplierName: z.string().min(1, 'Nhập nhà cung cấp'),
  invoiceNo: z.string().min(1, 'Nhập số hoá đơn'),
  receivedAt: z.string().min(1, 'Chọn ngày nhập'),
  note: z.string(),
  lines: z.array(lineSchema).min(1, 'Phiếu nhập cần ít nhất một dòng'),
})

type ReceiptForm = z.infer<typeof formSchema>

const emptyLine = {
  medicineId: '',
  batchNo: '',
  mfgDate: '',
  expiryDate: '',
  qty: 1,
  unitCost: 0,
}

const defaults = (): ReceiptForm => ({
  supplierName: '',
  invoiceNo: '',
  receivedAt: toDateInput(new Date()),
  note: '',
  lines: [{ ...emptyLine }],
})

export function ReceiptMutateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const { data: medicines, isLoading: loadingMedicines } = useQuery({
    queryKey: ['inventory', 'medicines'],
    queryFn: GetMedicines,
    enabled: open,
  })

  const form = useForm<ReceiptForm>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  })

  useEffect(() => {
    if (open) form.reset(defaults())
  }, [open, form])

  const lines = form.watch('lines')
  const totalAmount = lines.reduce(
    (sum, l) => sum + (l.qty || 0) * (l.unitCost || 0),
    0
  )
  const totalQty = lines.reduce((sum, l) => sum + (l.qty || 0), 0)

  const medicineOptions =
    medicines?.map((m) => ({
      label: `${m.name} (${m.unit})`,
      value: m.id,
    })) ?? []

  const onSubmit = async (data: ReceiptForm) => {
    try {
      await CreateReceipt(data)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Đã tạo phiếu nhập', {
        description: `${data.lines.length} lô hàng mới đã được thêm vào kho.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('Không tạo được phiếu nhập', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Chỉ đóng bằng nút X hoặc Đóng — xem ghi chú ở medicine-mutate-drawer. */}
      <DialogContent
        className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-4xl'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='pe-8 text-start'>
          <DialogTitle>Nhập đơn hàng mới</DialogTitle>
          <DialogDescription>
            Mỗi dòng dưới đây tạo ra một lô riêng trong kho. Số lô và hạn sử
            dụng là bắt buộc để phân biệt được các đợt nhập của cùng một thuốc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='receipt-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='-mx-1 space-y-6 overflow-y-auto px-1'
          >
            <div className='grid gap-4 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='supplierName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà cung cấp</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='VD: Dược Hậu Giang' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='invoiceNo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hoá đơn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='VD: HD12345' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='receivedAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày nhập</FormLabel>
                    <FormControl>
                      <Input {...field} type='date' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <FormLabel className='text-base'>
                  Chi tiết hàng nhập ({fields.length} lô)
                </FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ ...emptyLine })}
                >
                  <Plus className='size-4' />
                  Thêm lô
                </Button>
              </div>

              {fields.map((fieldItem, index) => {
                const line = lines[index]
                const status = line?.expiryDate
                  ? getExpiryStatus(line.expiryDate)
                  : null
                const meta = status ? expiryMeta(status) : null

                return (
                  <div
                    key={fieldItem.id}
                    className='space-y-3 rounded-md border p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Lô #{index + 1}
                      </span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium tabular-nums'>
                          {formatMoney(
                            (line?.qty || 0) * (line?.unitCost || 0)
                          )}
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-7 text-red-600 dark:text-red-400'
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                          aria-label={`Xoá lô ${index + 1}`}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
                      <FormField
                        control={form.control}
                        name={`lines.${index}.medicineId`}
                        render={({ field }) => (
                          <FormItem className='lg:col-span-2'>
                            <FormLabel className='text-xs'>Thuốc</FormLabel>
                            <SelectDropdown
                              isControlled
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              placeholder='Chọn thuốc'
                              isPending={loadingMedicines}
                              items={medicineOptions}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lines.${index}.batchNo`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Số lô</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='VD: L2408AB'
                                className='font-mono'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lines.${index}.mfgDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Ngày SX</FormLabel>
                            <FormControl>
                              <Input {...field} type='date' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lines.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Hạn dùng</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type='date'
                                className={cn(
                                  status === 'expired' &&
                                    'border-red-400 dark:border-red-700'
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lines.${index}.qty`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Số lượng</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type='number'
                                min={1}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? 0
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lines.${index}.unitCost`}
                        render={({ field }) => (
                          <FormItem className='lg:col-span-2'>
                            <FormLabel className='text-xs'>
                              Đơn giá nhập (₫)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type='number'
                                min={0}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? 0
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Cảnh báo ngay tại dòng, trước khi hàng vào kho. */}
                    {meta && status !== 'ok' && (
                      <div
                        className={cn(
                          'flex items-center gap-1.5 text-xs',
                          meta.textClass
                        )}
                      >
                        <meta.icon className='size-3.5' />
                        {status === 'expired'
                          ? 'Lô này đã hết hạn — kiểm tra lại trước khi nhập.'
                          : `${meta.label} — nên ưu tiên xuất lô này trước.`}
                      </div>
                    )}
                  </div>
                )
              })}

              {form.formState.errors.lines?.root && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.lines.root.message}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder='Ghi chú thêm về đơn hàng (không bắt buộc)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/*
          DialogFooter là flex-col-reverse trên mobile rồi sm:flex-row. `flex-1`
          ở khối tổng đẩy hai nút sang phải; sm:items-center để chữ và nút cùng
          hàng ngang. border-t pt-4 vì DialogFooter không có padding sẵn.
        */}
        <DialogFooter className='border-t pt-4 sm:items-center'>
          <div className='flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 text-sm'>
            <span className='text-muted-foreground'>
              Tổng số lượng:{' '}
              <span className='font-medium text-foreground tabular-nums'>
                {totalQty.toLocaleString('vi-VN')}
              </span>
            </span>
            <span className='text-muted-foreground'>
              Tổng tiền:{' '}
              <span className='font-medium text-foreground tabular-nums'>
                {formatMoney(totalAmount)}
              </span>
            </span>
          </div>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            form='receipt-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu phiếu nhập'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
