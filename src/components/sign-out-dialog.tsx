import { useNavigate, useLocation } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Logout } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await Logout()
      auth.reset()
      // Preserve current location for redirect after sign-in
      const currentPath = location.href
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    } catch {
      toast.error('Không thể đăng xuất lúc này. Vui lòng thử lại.')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Đăng xuất'
      desc='Bạn có chắc muốn đăng xuất? Bạn sẽ cần đăng nhập lại để truy cập tài khoản.'
      confirmText='Đăng xuất'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
