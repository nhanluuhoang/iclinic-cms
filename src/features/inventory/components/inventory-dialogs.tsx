import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DisposeBatch } from '../api'
import { formatNumber } from '../utils'
import { useInventory } from './inventory-provider'
import { IssueMutateDialog } from './issue-mutate-dialog'
import { ReceiptMutateDrawer } from './receipt-mutate-drawer'
import { StockTakeMutateDrawer } from './stocktake-mutate-drawer'

export function InventoryDialogs() {
  const { open, setOpen, currentBatch, setCurrentBatch } = useInventory()
  const queryClient = useQueryClient()

  const closeAndClear = (clear: () => void) => {
    setOpen(null)
    setTimeout(clear, 500)
  }

  const handleDisposeBatch = async () => {
    if (!currentBatch) return
    try {
      await DisposeBatch(currentBatch.id)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Đã huỷ lô khỏi kho')
      closeAndClear(() => setCurrentBatch(null))
    } catch (error) {
      toast.error('Không huỷ được lô', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <>
      <ReceiptMutateDrawer
        key='receipt-create'
        open={open === 'receipt-create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      <StockTakeMutateDrawer
        key='stocktake-create'
        open={open === 'stocktake-create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      <IssueMutateDialog
        key='issue-create'
        open={open === 'issue-create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentBatch && (
        <ConfirmDialog
          key='batch-dispose'
          destructive
          open={open === 'batch-dispose'}
          onOpenChange={(v) => {
            if (!v) closeAndClear(() => setCurrentBatch(null))
          }}
          handleConfirm={handleDisposeBatch}
          className='max-w-md'
          title={`Huỷ lô ${currentBatch.batchNo}?`}
          desc={
            <>
              Toàn bộ{' '}
              <strong>
                {formatNumber(currentBatch.qtyRemaining)} {currentBatch.unit}
              </strong>{' '}
              còn lại của <strong>{currentBatch.medicineName}</strong> (lô{' '}
              {currentBatch.batchNo}) sẽ được đưa về 0. <br />
              Dùng khi lô đã hết hạn hoặc hỏng. Không thể hoàn tác.
            </>
          }
          confirmText='Huỷ lô'
          cancelBtnText='Huỷ bỏ'
        />
      )}
    </>
  )
}
