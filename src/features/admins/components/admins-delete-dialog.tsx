import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DeleteAdmin, type Admin } from '@/features/admins/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

export function AdminsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Admin
}) {
  const queryClient = useQueryClient()
  const deactivate = useMutation({
    mutationFn: () => DeleteAdmin(currentRow.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Đã khóa tài khoản nhân viên')
      onOpenChange(false)
    },
    onError: () => toast.error('Không thể khóa tài khoản nhân viên'),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deactivate.mutate()}
      disabled={deactivate.isPending}
      title='Khóa tài khoản nhân viên'
      desc={`Tài khoản ${currentRow.fullName} (${currentRow.userName}) sẽ bị đăng xuất và không thể đăng nhập.`}
      confirmText={deactivate.isPending ? 'Đang khóa...' : 'Khóa tài khoản'}
      destructive
    />
  )
}
