import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeletePost } from '@/features/posts/api'
import { PostsMutateDialog } from '@/features/posts/components/posts-mutate-dialog'
import { usePosts } from '@/features/posts/components/posts-provider'

export function PostsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePosts()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await DeletePost(currentRow.id)
      toast.success('Đã xóa bài viết')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setOpen(null)
      setTimeout(() => setCurrentRow(undefined), 500)
    } catch (_error) {
      toast.error('Không thể xóa bài viết')
    }
  }

  return (
    <>
      <PostsMutateDialog
        key='post-create'
        open={open === 'create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          <PostsMutateDialog
            key={`post-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => setCurrentRow(undefined), 500)
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='post-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v: boolean) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => setCurrentRow(undefined), 500)
              }
            }}
            className='max-w-md'
            title={`Xóa bài viết: ${currentRow.title}?`}
            desc={
              <>
                Bạn sắp xóa bài viết <strong>{currentRow.title}</strong>.
                <br />
                Thao tác này không thể hoàn tác.
              </>
            }
            confirmText='Xóa'
            handleConfirm={handleDelete}
          />
        </>
      )}
    </>
  )
}
