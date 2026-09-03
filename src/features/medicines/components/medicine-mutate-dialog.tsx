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
import { SelectDropdown } from '@/components/select-dropdown'
import { CreateMedicine, UpdateMedicine, type Medicine } from '../api'
import { medicineGroups, medicineUnits } from '../data/data'
import { InfoHint } from './info-hint'

const formSchema = z.object({
  name: z.string().min(1, 'Nhập tên thuốc'),
  activeIngredient: z.string().min(1, 'Nhập hoạt chất'),
  strength: z.string().min(1, 'Nhập hàm lượng'),
  unit: z.string().min(1, 'Chọn đơn vị'),
  group: z.enum([
    'antibiotic',
    'analgesic',
    'vitamin',
    'cardio',
    'digestive',
    'respiratory',
    'other',
  ]),
  manufacturer: z.string().min(1, 'Nhập nhà sản xuất'),
  minStock: z.number().min(0, 'Định mức không hợp lệ'),
  salePrice: z.number().min(0, 'Giá bán không hợp lệ'),
  isActive: z.boolean(),
})

type MedicineForm = z.infer<typeof formSchema>

const defaults: MedicineForm = {
  name: '',
  activeIngredient: '',
  strength: '',
  unit: 'viên',
  group: 'other',
  manufacturer: '',
  minStock: 0,
  salePrice: 0,
  isActive: true,
}

export function MedicineMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Medicine
}) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<MedicineForm>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      currentRow
        ? {
            name: currentRow.name,
            activeIngredient: currentRow.activeIngredient,
            strength: currentRow.strength,
            unit: currentRow.unit,
            group: currentRow.group,
            manufacturer: currentRow.manufacturer,
            minStock: currentRow.minStock,
            salePrice: Number(currentRow.salePrice),
            isActive: currentRow.isActive,
          }
        : defaults
    )
  }, [currentRow, form, open])

  const onSubmit = async (data: MedicineForm) => {
    try {
      if (isUpdate && currentRow) {
        await UpdateMedicine(currentRow.id, data)
        toast.success('Đã cập nhật thuốc')
      } else {
        await CreateMedicine(data)
        toast.success('Đã thêm thuốc vào danh mục')
      }
      queryClient.invalidateQueries({ queryKey: ['medicines'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      onOpenChange(false)
    } catch (error) {
      toast.error('Không lưu được thuốc', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='pe-8 text-start'>
          <DialogTitle>
            {isUpdate ? 'Sửa thuốc' : 'Thêm thuốc vào danh mục'}
          </DialogTitle>
          <DialogDescription>
            Danh mục chỉ khai báo thông tin thuốc. Số lượng và hạn sử dụng đến
            từ các phiếu nhập.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='medicine-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='-mx-1 space-y-4 overflow-y-auto px-1'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='VD: Paracetamol 500mg' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='activeIngredient'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoạt chất</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='VD: Paracetamol' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='strength'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hàm lượng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='VD: 500mg' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị</FormLabel>
                    <SelectDropdown
                      isControlled
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Chọn đơn vị'
                      items={medicineUnits.map((u) => ({
                        label: u,
                        value: u,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='group'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm thuốc</FormLabel>
                  <SelectDropdown
                    isControlled
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Chọn nhóm'
                    items={medicineGroups.map((g) => ({
                      label: g.label,
                      value: g.value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='manufacturer'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà sản xuất</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='VD: Traphaco' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='salePrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá bán</FormLabel>
                  <FormControl>
                    <Input {...field} type='number' min={0} onChange={(e) => field.onChange(Number(e.target.value || 0))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='minStock'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center gap-1'>
                    <FormLabel>Định mức tồn tối thiểu</FormLabel>
                    <InfoHint label='Giải thích định mức tồn tối thiểu'>
                      Ngưỡng tồn thấp nhất cần duy trì cho thuốc này. Hệ thống
                      so ngưỡng với tổng tồn của tất cả các lô; khi tồn xuống
                      thấp hơn, thuốc hiện cảnh báo &quot;dưới định mức&quot; ở
                      tab Tồn kho để nhắc nhập thêm. Để 0 nếu không cần theo
                      dõi.
                    </InfoHint>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? 0 : Number(e.target.value)
                        )
                      }
                    />
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
            form='medicine-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
