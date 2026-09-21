import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeleteMedicine } from '../api'
import { MedicineMutateDialog } from './medicine-mutate-dialog'
import { useMedicines } from './medicines-provider'

export function MedicinesDialogs() {
  const { open, setOpen, currentMedicine, setCurrentMedicine } = useMedicines()
  const queryClient = useQueryClient()

  const closeAndClear = () => {
    setOpen(null)
    setTimeout(() => setCurrentMedicine(null), 500)
  }

  const handleDelete = async () => {
    if (!currentMedicine) return
    try {
      await DeleteMedicine(currentMedicine.id)
      queryClient.invalidateQueries({ queryKey: ['medicines'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Đã xoá thuốc khỏi danh mục')
      closeAndClear()
    } catch (error) {
      toast.error('Không xoá được thuốc', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <>
      <MedicineMutateDialog
        key='medicine-create'
        open={open === 'medicine-create'}
        onOpenChange={(value) => {
          if (!value) setOpen(null)
        }}
      />

      {currentMedicine && (
        <>
          <MedicineMutateDialog
            key={`medicine-update-${currentMedicine.id}`}
            open={open === 'medicine-update'}
            onOpenChange={(value) => {
              if (!value) closeAndClear()
            }}
            currentRow={currentMedicine}
          />
          <ConfirmDialog
            destructive
            open={open === 'medicine-delete'}
            onOpenChange={(value) => {
              if (!value) closeAndClear()
            }}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`Xoá thuốc "${currentMedicine.name}"?`}
            desc={
              <>
                Thuốc <strong>{currentMedicine.name}</strong> sẽ bị xoá khỏi
                danh mục. <br />
                Thuốc còn tồn kho sẽ không xoá được — hãy xuất hoặc huỷ hết các
                lô trước.
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
