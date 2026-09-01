import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeletePatient } from '../api'
import { PatientHistoryDialog } from './patient-history-dialog'
import { PatientsMutateDialog } from './patients-mutate-dialog'
import { usePatients } from './patients-provider'

export function PatientsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePatients()
  const queryClient = useQueryClient()

  /** Đóng dialog trước, xoá dòng đang chọn sau, để nội dung không nhảy khi animate. */
  const closeAndClear = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await DeletePatient(currentRow.id)
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Đã xoá bệnh nhân')
      closeAndClear()
    } catch (error) {
      toast.error('Không xoá được bệnh nhân', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <>
      <PatientsMutateDialog
        key='patient-create'
        open={open === 'create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          <PatientsMutateDialog
            key={`patient-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            currentRow={currentRow}
          />

          <PatientHistoryDialog
            open={open === 'history'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            patient={currentRow}
          />

          <ConfirmDialog
            key='patient-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`Xoá bệnh nhân "${currentRow.fullName}"?`}
            desc={
              <>
                Bệnh nhân <strong>{currentRow.fullName}</strong> (tên đăng nhập{' '}
                <strong>{currentRow.userName}</strong>) sẽ bị xoá. <br />
                Hành động này không thể hoàn tác.
              </>
            }
            confirmText='Xoá'
            cancelBtnText='Huỷ bỏ'
          />
        </>
      )}
    </>
  )
}
