import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeleteMasterData } from '../api'
import { MasterDataMutateDrawer } from './master-data-mutate-drawer'
import { useMasterData } from './master-data-provider'

export function MasterDataDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMasterData()
  const queryClient = useQueryClient()

  const onDeleteConfirm = async () => {
    if (!currentRow) return
    try {
      await DeleteMasterData(currentRow.id)
      queryClient.invalidateQueries({ queryKey: ['master-data'] })
      setOpen(null)
      setCurrentRow(null)
      toast.success('Đã xóa cấu hình chung')
    } catch (_error) {
      toast.error('Không thể xóa cấu hình chung')
    }
  }

  return (
    <>
      <MasterDataMutateDrawer
        key='master-data-mutate'
        open={open === 'create' || open === 'update'}
        onOpenChange={() => {
          setOpen(null)
          setCurrentRow(null)
        }}
        currentRow={currentRow || undefined}
      />

      <ConfirmDialog
        key='master-data-delete'
        open={open === 'delete'}
        onOpenChange={() => {
          setOpen(null)
          setCurrentRow(null)
        }}
        title='Xóa cấu hình chung'
        desc='Bạn có chắc muốn xóa cấu hình này? Thao tác không thể hoàn tác.'
        confirmText='Xóa'
        destructive
        handleConfirm={onDeleteConfirm}
      />
    </>
  )
}
