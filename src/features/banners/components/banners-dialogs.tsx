import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeleteBanner } from '../api'
import { BannersMutateDrawer } from './banners-mutate-drawer'
import { useBanners } from './banners-provider'

export function BannersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBanners()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await DeleteBanner(currentRow.id)
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      toast.success('Banner deleted successfully')
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
    } catch (_error) {
      toast.error('Failed to delete banner')
    }
  }

  return (
    <>
      <BannersMutateDrawer
        key='banner-create'
        open={open === 'create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          <BannersMutateDrawer
            key={`banner-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='banner-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`Delete this banner: ${currentRow.fileName} ?`}
            desc={
              <>
                You are about to delete a banner titled{' '}
                <strong>{currentRow.fileName}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
