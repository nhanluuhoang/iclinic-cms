import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateProfile } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { DatePickerInput } from '@/components/date-picker-input'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(255),
    email: z.string().trim().max(255),
    phone: z.string().trim().max(20),
    gender: z.enum(['0', '1', '2']),
    dateOfBirth: z.string(),
    address: z.string().trim().max(255),
    note: z.string().trim().max(255),
  })
  .superRefine((values, context) => {
    if (values.email && !z.email().safeParse(values.email).success) {
      context.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Email không hợp lệ',
      })
    }
    if (
      values.dateOfBirth &&
      values.dateOfBirth > new Date().toISOString().slice(0, 10)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Ngày sinh không thể ở tương lai',
      })
    }
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>

const emptyValues: ProfileFormValues = {
  fullName: '',
  email: '',
  phone: '',
  gender: '0',
  dateOfBirth: '',
  address: '',
  note: '',
}

export function ProfileForm() {
  const user = useAuthStore((state) => state.auth.user)
  const setUser = useAuthStore((state) => state.auth.setUser)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      gender:
        user.gender === '1' || user.gender === '2' ? user.gender : '0',
      dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
      address: user.address ?? '',
      note: user.note ?? '',
    })
  }, [form, user])

  const updateProfile = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      UpdateProfile({
        fullName: values.fullName.trim(),
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
        gender: values.gender === '0' ? null : values.gender,
        dateOfBirth: values.dateOfBirth || null,
        address: values.address.trim() || null,
        note: values.note.trim() || null,
      }),
    onSuccess: ({ data }) => {
      setUser(data)
      toast.success('Đã cập nhật hồ sơ')
    },
    onError: () => toast.error('Không thể cập nhật hồ sơ'),
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}
        className='space-y-6'
      >
        <FormItem>
          <FormLabel>Tên đăng nhập</FormLabel>
          <FormControl>
            <Input value={user?.userName ?? ''} disabled />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên</FormLabel>
              <FormControl>
                <Input {...field} placeholder='Nguyễn Văn A' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type='email' placeholder='a@example.com' />
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
                  <Input {...field} placeholder='0901234567' />
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn giới tính' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='0'>Không xác định</SelectItem>
                    <SelectItem value='1'>Nam</SelectItem>
                    <SelectItem value='2'>Nữ</SelectItem>
                  </SelectContent>
                </Select>
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
                <DatePickerInput value={field.value} onChange={field.onChange} />
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
                  placeholder='Số nhà, đường, phường/xã, tỉnh/thành'
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
                <Textarea {...field} className='resize-none' maxLength={255} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </form>
    </Form>
  )
}
