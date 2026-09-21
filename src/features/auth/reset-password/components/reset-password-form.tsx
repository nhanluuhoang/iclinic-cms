import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { ResetPassword } from '@/features/auth/api'

const formSchema = z.object({
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(255, 'Mật khẩu không được vượt quá 255 ký tự'),
  passwordConfirmation: z
    .string()
    .min(1, 'Vui lòng nhập lại mật khẩu'),
})

interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLFormElement> {
  token: string
}

export function ResetPasswordForm({
  token,
  className,
  ...props
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await ResetPassword({ ...data, token })
      navigate({ to: '/sign-in' })
      toast.success('Đặt lại mật khẩu thành công')
    } catch {
      toast.error(
        'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra liên kết và thử lại.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='passwordConfirmation'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Nhập lại mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <Save />}
          Đặt lại mật khẩu
        </Button>
      </form>
    </Form>
  )
}
