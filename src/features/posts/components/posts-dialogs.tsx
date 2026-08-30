import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeletePost } from '@/features/posts/api'
import { PostsMutateDrawer } from '@/features/posts/components/posts-mutate-drawer'
import { usePosts } from '@/features/posts/components/posts-provider'

export function PostsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePosts()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await DeletePost(currentRow.id)
      toast.success('Post deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setOpen(null)
      setCurrentRow(undefined)
    } catch (_error) {
      toast.error('Failed to delete post')
    }
  }

  return (
    <>
      <PostsMutateDrawer
        key='post-mutate'
        open={open === 'create' || open === 'update'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(undefined)
          }
        }}
        currentRow={currentRow}
      />

      <ConfirmDialog
        key='post-delete'
        open={open === 'delete'}
        onOpenChange={(v: boolean) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(undefined)
          }
        }}
        title='Delete Post'
        desc='Are you sure you want to delete this post? This action cannot be undone.'
        handleConfirm={handleDelete}
      />
    </>
  )
}
