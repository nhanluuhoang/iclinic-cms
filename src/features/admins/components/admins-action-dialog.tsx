import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
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
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  CreateAdmin,
  UpdateAdmin,
  type Admin,
  type StaffInput,
} from '@/features/admins/api'
import { roles } from '../data/data'

const formSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.'),
    email: z.union([z.literal(''), z.email('Email không hợp lệ.')]),
    phone: z.string().trim().max(20, 'Tối đa 20 ký tự.'),
    role: z.enum(['DOCTOR', 'ASSISTANT']),
    isActive: z.boolean(),
    password: z.string(),
    passwordConfirmation: z.string(),
  })
  .superRefine((values, context) => {
    if (values.password && values.password.length < 12) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Mật khẩu phải có ít nhất 12 ký tự.',
      })
    }
    if (values.password.length > 20) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Mật khẩu tối đa 20 ký tự.',
      })
    }
    if (values.password !== values.passwordConfirmation) {
      context.addIssue({
        code: 'custom',
        path: ['passwordConfirmation'],
        message: 'Mật khẩu nhập lại không khớp.',
      })
    }
  })

type StaffForm = z.infer<typeof formSchema>

const emptyValues: StaffForm = {
  fullName: '',
  email: '',
  phone: '',
  role: 'DOCTOR',
  isActive: true,
  password: '',
  passwordConfirmation: '',
}

export function AdminsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: {
  currentRow?: Admin
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const form = useForm<StaffForm>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      currentRow
        ? {
            fullName: currentRow.fullName,
            email: currentRow.email ?? '',
            phone: currentRow.phone ?? '',
            role: currentRow.role === 'ASSISTANT' ? 'ASSISTANT' : 'DOCTOR',
            isActive: currentRow.isActive,
            password: '',
            passwordConfirmation: '',
          }
        : emptyValues
    )
  }, [currentRow, form, open])

  const save = useMutation({
    mutationFn: (values: StaffForm) => {
      if (!isEdit && !values.password) {
        form.setError('password', { message: 'Vui lòng nhập mật khẩu.' })
        throw new Error('missing-password')
      }
      const payload: StaffInput = {
        fullName: values.fullName.trim(),
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        role: values.role,
        isActive: values.isActive,
        ...(values.password && { password: values.password }),
        ...(!isEdit && {
          passwordConfirmation: values.passwordConfirmation,
        }),
      }
      return currentRow
        ? UpdateAdmin(currentRow.id, payload)
        : CreateAdmin(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(isEdit ? 'Đã cập nhật nhân viên' : 'Đã tạo nhân viên')
      onOpenChange(false)
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing-password') return
      toast.error('Không thể lưu thông tin nhân viên')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên'}
          </DialogTitle>
          <DialogDescription>
            Tài khoản nhân viên chỉ thuộc phòng khám hiện tại.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='staff-form'
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    isControlled
                    onValueChange={field.onChange}
                    items={roles.map(({ label, value }) => ({ label, value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-md border p-3'>
                  <div className='space-y-1'>
                    <FormLabel>Kích hoạt tài khoản</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      Chỉ tài khoản được kích hoạt mới có thể đăng nhập.
                    </p>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? 'Mật khẩu mới (không bắt buộc)' : 'Mật khẩu'}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='passwordConfirmation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhập lại mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='staff-form' disabled={save.isPending}>
            {save.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
