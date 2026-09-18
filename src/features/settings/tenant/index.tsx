import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ContentSection } from '../components/content-section'
import { getOwnTenant, updateOwnTenant } from './api'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên phòng khám').max(255),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ').max(255),
})

type FormValues = z.infer<typeof schema>

const planLabels = { BASIC: 'Cơ bản', PLUS: 'Chuyên nghiệp', PRO: 'Cao cấp' }
const statusLabels = {
  TRIAL: 'Dùng thử',
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Đã hết hạn',
  SUSPENDED: 'Tạm ngưng',
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—'

export function SettingsTenant() {
  const queryClient = useQueryClient()
  const tenant = useQuery({ queryKey: ['tenant', 'me'], queryFn: getOwnTenant })
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '' },
  })

  useEffect(() => {
    if (!tenant.data) return
    form.reset({
      name: tenant.data.name,
      address: tenant.data.address,
    })
  }, [form, tenant.data])

  const update = useMutation({
    mutationFn: updateOwnTenant,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] }),
      ])
      toast.success('Đã cập nhật thông tin phòng khám')
    },
    onError: () => toast.error('Không thể cập nhật thông tin phòng khám'),
  })

  if (tenant.isLoading) {
    return <p className='text-sm text-muted-foreground'>Đang tải thông tin...</p>
  }

  return (
    <ContentSection
      title='Thông tin phòng khám'
      desc='Quản lý thông tin nhận diện của phòng khám hiện tại.'
    >
      <Form {...form}>
        <form
          className='space-y-6'
          onSubmit={form.handleSubmit((values) => update.mutate(values))}
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormItem>
              <FormLabel>Mã phòng khám</FormLabel>
              <FormControl>
                <Input value={tenant.data?.code ?? ''} disabled />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Tên gói dịch vụ</FormLabel>
              <FormControl>
                <Input
                  value={
                    tenant.data ? planLabels[tenant.data.servicePlan] : ''
                  }
                  disabled
                />
              </FormControl>
            </FormItem>
          </div>

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên phòng khám</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Tên miền phụ</FormLabel>
            <FormControl>
              <Input value={tenant.data?.subdomain ?? ''} disabled />
            </FormControl>
            <FormDescription>
              Liên hệ bộ phận hỗ trợ nếu cần thay đổi địa chỉ trang phòng khám.
            </FormDescription>
          </FormItem>

          <div className='grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm text-muted-foreground'>Trạng thái thuê bao</p>
              <p className='font-medium'>
                {tenant.data
                  ? statusLabels[tenant.data.subscriptionStatus]
                  : '—'}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Ngày hết hạn</p>
              <p className='font-medium'>
                {formatDate(
                  tenant.data?.subscriptionEndsAt ?? tenant.data?.trialEndsAt
                )}
              </p>
            </div>
          </div>

          <Button type='submit' disabled={update.isPending}>
            {update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </Form>
    </ContentSection>
  )
}
