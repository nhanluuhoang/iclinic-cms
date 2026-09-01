import { useEffect } from 'react'
import { Info } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DatePickerInput } from '@/components/date-picker-input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  CreatePatient,
  UpdatePatient,
  type Patient,
  type PatientDtoRequest,
} from '../api'
import { MAX, genders } from '../data/data'

const GENDER_UNSET = '0'

/**
 * Form thêm/sửa bệnh nhân.
 *
 * Mật khẩu: bắt buộc khi tạo. Khi sửa thì để trống = giữ nguyên mật khẩu cũ, và
 * field KHÔNG BAO GIỜ được prefill — API cũng không trả password về (xem
 * `api/index.ts`).
 *
 * Giới hạn độ dài lấy đúng theo @db.VarChar của Prisma model, chặn ngay ở form
 * để không phải chờ backend trả lỗi.
 */

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nhập họ tên')
      .max(MAX.fullName, `Tối đa ${MAX.fullName} ký tự`),
    email: z.string().max(MAX.email, `Tối đa ${MAX.email} ký tự`),
    phone: z.string().max(MAX.phone, `Tối đa ${MAX.phone} ký tự`),
    gender: z.enum(['0', '1', '2']),
    dateOfBirth: z.string(),
    address: z.string().max(MAX.address, `Tối đa ${MAX.address} ký tự`),
    note: z.string().max(MAX.note, `Tối đa ${MAX.note} ký tự`),
    password: z.string().max(MAX.password, `Tối đa ${MAX.password} ký tự`),
    confirmPassword: z.string(),
    /** Cờ nội bộ để zod biết đang tạo hay sửa; không gửi lên API. */
    isEdit: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.email && !z.email().safeParse(v.email).success) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Email không hợp lệ',
      })
    }

    if (
      v.dateOfBirth &&
      v.dateOfBirth > new Date().toISOString().slice(0, 10)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Ngày sinh không thể ở tương lai',
      })
    }

    // Khi tạo thì luôn phải có mật khẩu. Khi sửa, chỉ kiểm nếu người dùng có gõ.
    if (!v.isEdit && !v.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Nhập mật khẩu',
      })
      return
    }
    if (!v.password) return

    if (v.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Mật khẩu tối thiểu 8 ký tự',
      })
    }
    if (!/[a-z]/.test(v.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Mật khẩu cần ít nhất một chữ thường',
      })
    }
    if (!/\d/.test(v.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Mật khẩu cần ít nhất một chữ số',
      })
    }
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Mật khẩu nhập lại không khớp',
      })
    }
  })

type PatientForm = z.infer<typeof formSchema>

const emptyForm = (isEdit: boolean): PatientForm => ({
  fullName: '',
  email: '',
  phone: '',
  gender: GENDER_UNSET,
  dateOfBirth: '',
  address: '',
  note: '',
  password: '',
  confirmPassword: '',
  isEdit,
})

export function PatientsMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Patient
}) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<PatientForm>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm(isEdit),
  })

  useEffect(() => {
    if (!open) return
    if (!currentRow) {
      form.reset(emptyForm(false))
      return
    }
    form.reset({
      // userName không có trong form: backend sinh ra, client chỉ hiển thị.
      fullName: currentRow.fullName,
      email: currentRow.email ?? '',
      phone: currentRow.phone ?? '',
      gender:
        currentRow.gender === '1' || currentRow.gender === '2'
          ? currentRow.gender
          : GENDER_UNSET,
      // DatePickerInput nhận yyyy-MM-dd, còn API trả Timestamptz.
      dateOfBirth: currentRow.dateOfBirth
        ? currentRow.dateOfBirth.slice(0, 10)
        : '',
      address: currentRow.address ?? '',
      note: currentRow.note ?? '',
      // Không prefill mật khẩu — kể cả khi có, đây là dữ liệu không được hiện.
      password: '',
      confirmPassword: '',
      isEdit: true,
    })
  }, [currentRow, form, open])

  const onSubmit = async (values: PatientForm) => {
    // Field optional để trống thì BỎ khỏi payload thay vì gửi '': Prisma sẽ lưu
    // NULL đúng nghĩa "chưa có", chứ không phải chuỗi rỗng.
    const payload: PatientDtoRequest = {
      fullName: values.fullName.trim(),
    }
    if (values.email.trim()) payload.email = values.email.trim()
    if (values.phone.trim()) payload.phone = values.phone.trim()
    payload.gender = values.gender === GENDER_UNSET ? null : values.gender
    if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth
    if (values.address.trim()) payload.address = values.address.trim()
    if (values.note.trim()) payload.note = values.note.trim()
    // Chỉ gửi password khi thực sự có giá trị. Gửi '' khi sửa có thể bị backend
    // hiểu là "đặt mật khẩu thành rỗng".
    if (values.password) payload.password = values.password

    try {
      if (isEdit && currentRow) {
        await UpdatePatient(currentRow.id, payload)
        toast.success('Đã cập nhật bệnh nhân')
      } else {
        await CreatePatient(payload)
        toast.success('Đã thêm bệnh nhân')
      }
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        isEdit ? 'Không cập nhật được' : 'Không thêm được bệnh nhân',
        {
          description: error instanceof Error ? error.message : undefined,
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Chỉ đóng bằng nút X hoặc Đóng, giống các form ở page Kho thuốc. */}
      <DialogContent
        className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-2xl'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='pe-8 text-start'>
          <DialogTitle>
            {isEdit ? 'Sửa bệnh nhân' : 'Thêm bệnh nhân'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Để trống hai ô mật khẩu nếu không muốn đổi mật khẩu.'
              : 'Họ tên và mật khẩu là bắt buộc. Tên đăng nhập do hệ thống tự sinh sau khi lưu.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='patient-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='-mx-1 space-y-4 overflow-y-auto px-1'
          >
            {/*
              userName KHÔNG nằm trong form state vì không bao giờ được gửi lên:
              backend sinh khi tạo, và client không được đổi khi sửa. Lúc tạo thì
              ẩn hẳn, lúc sửa thì hiện disabled để tra cứu.

              Grid chỉ chia 2 cột khi thực sự có 2 field, nếu không thì lúc tạo
              ô Họ tên sẽ nằm lẻ một nửa hàng.
            */}
            <div className={cn('grid gap-4', isEdit && 'sm:grid-cols-2')}>
              {isEdit && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-1'>
                    <Label htmlFor='patient-username'>Tên đăng nhập</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type='button'
                          aria-label='Thông tin tên đăng nhập'
                          className='inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none'
                        >
                          <Info className='size-3.5' />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Do hệ thống sinh, không sửa được.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id='patient-username'
                    value={currentRow?.userName ?? ''}
                    disabled
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='VD: Nguyễn Văn A' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mật khẩu{' '}
                      {isEdit && (
                        <span className='font-normal text-muted-foreground'>
                          (để trống nếu không đổi)
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete='new-password'
                        placeholder='Tối thiểu 8 ký tự'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhập lại mật khẩu</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete='new-password'
                        placeholder='Nhập lại mật khẩu'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='VD: a@example.com'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='VD: 0901234567' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <SelectDropdown
                      isControlled
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Chọn giới tính'
                      items={[
                        { label: 'Không rõ', value: GENDER_UNSET },
                        ...genders.map((g) => ({
                          label: g.label,
                          value: g.value,
                        })),
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dateOfBirth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
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
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Số nhà, đường, phường, tỉnh'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder='Ghi chú thêm (không bắt buộc)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className='border-t pt-4'>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            form='patient-form'
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
