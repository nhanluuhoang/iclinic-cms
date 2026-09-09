import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { DatePickerInput } from '@/components/date-picker-input'
import { type StockBatch, UpdateBatch } from '../api'
import { toDateInput } from '../utils'

const formSchema = z
  .object({
    batchNo: z.string().min(1, 'Nhập số lô'),
    mfgDate: z.string(),
    expiryDate: z.string().min(1, 'Chọn hạn sử dụng'),
    note: z.string(),
  })
  .refine((value) => !value.mfgDate || value.mfgDate < value.expiryDate, {
    message: 'Hạn sử dụng phải sau ngày sản xuất',
    path: ['expiryDate'],
  })

type BatchForm = z.infer<typeof formSchema>

export function BatchUpdateDialog({
  batch,
  open,
  onOpenChange,
}: {
  batch: StockBatch
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const form = useForm<BatchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchNo: batch.batchNo,
      mfgDate: batch.mfgDate ? toDateInput(batch.mfgDate) : '',
      expiryDate: toDateInput(batch.expiryDate),
      note: batch.note,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        batchNo: batch.batchNo,
        mfgDate: batch.mfgDate ? toDateInput(batch.mfgDate) : '',
        expiryDate: toDateInput(batch.expiryDate),
        note: batch.note,
      })
    }
  }, [batch, form, open])

  const onSubmit = async (data: BatchForm) => {
    try {
      await UpdateBatch(batch.id, data)
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Đã cập nhật lô hàng')
      onOpenChange(false)
    } catch (error) {
      toast.error('Không cập nhật được lô hàng', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Sửa lô hàng</DialogTitle>
          <DialogDescription>
            {batch.medicineName} · Tồn {batch.qtyRemaining} {batch.unit}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='batch-update-form'
            className='space-y-4'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='batchNo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lô</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='mfgDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sản xuất</FormLabel>
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='expiryDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn sử dụng</FormLabel>
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
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
            form='batch-update-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
