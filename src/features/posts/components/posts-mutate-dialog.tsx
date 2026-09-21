import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { API_URL } from '@/config'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { uploadImage } from '@/features/examination-queue/api'
import {
  CreatePost,
  UpdatePost,
  type Post,
  type PostDtoRequest,
} from '../api'
import { postStatuses } from '../data/data'
import { PostContentEditor } from './post-content-editor'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Post
}
const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề.'),
  category: z.string().min(1, 'Vui lòng nhập chuyên mục.'),
  excerpt: z.string().min(1, 'Vui lòng nhập mô tả ngắn.').max(500),
  content: z.string().min(1, 'Vui lòng nhập nội dung.'),
  thumbnailUrl: z.string(),
  readTime: z.number().int().min(1).max(120),
  isPublished: z.boolean(),
})
type FormValues = z.infer<typeof schema>
const defaults: FormValues = {
  title: '',
  category: '',
  excerpt: '',
  content: '',
  thumbnailUrl: '',
  readTime: 3,
  isPublished: false,
}

const authenticatedImageUrl = (url: string | null | undefined) => {
  if (!url) return ''
  const fileName = url.split('/').pop()
  return fileName ? `${API_URL}/images/${encodeURIComponent(fileName)}` : url
}

export function PostsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient()
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })
  useEffect(() => {
    form.reset(
      currentRow
        ? {
            title: currentRow.title,
            category: currentRow.category,
            excerpt: currentRow.excerpt,
            content: currentRow.content,
            thumbnailUrl: currentRow.thumbnailUrl ?? '',
            readTime: currentRow.readTime,
            isPublished: currentRow.isPublished,
          }
        : defaults
    )
    setThumbnailPreview(authenticatedImageUrl(currentRow?.thumbnailUrl))
  }, [currentRow, form, open])

  const uploadThumbnail = async (file: File | undefined) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Chỉ nhận ảnh JPG, PNG hoặc WebP, dung lượng tối đa 5 MB')
      return
    }
    const localPreview = URL.createObjectURL(file)
    setThumbnailPreview(localPreview)
    setIsUploadingThumbnail(true)
    try {
      const uploaded = await uploadImage(file, 'POST')
      const publicUrl = `${API_URL}/images/thumbnail/${encodeURIComponent(uploaded.fileName)}`
      form.setValue('thumbnailUrl', publicUrl, { shouldDirty: true, shouldValidate: true })
      toast.success('Đã tải ảnh đại diện')
    } catch (error) {
      setThumbnailPreview(authenticatedImageUrl(currentRow?.thumbnailUrl))
      toast.error(typeof error === 'string' ? error : 'Không thể tải ảnh lên')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const submit = async (values: FormValues) => {
    const data: PostDtoRequest = {
      ...values,
      thumbnailUrl: values.thumbnailUrl || undefined,
    }
    try {
      if (currentRow) await UpdatePost(currentRow.id, data)
      else await CreatePost(data)
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success(currentRow ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết')
      onOpenChange(false)
    } catch {
      toast.error('Không thể lưu bài viết')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-4xl'
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className='pe-8 text-start'>
          <DialogTitle>
            {currentRow ? 'Cập nhật bài viết' : 'Tạo bài viết'}
          </DialogTitle>
          <DialogDescription>
            Nội dung công khai sẽ xuất hiện trên trang phòng khám.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='posts-form'
            onSubmit={form.handleSubmit(submit)}
            className='-mx-1 space-y-5 overflow-y-auto px-1'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chuyên mục</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='readTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian đọc (phút)</FormLabel>
                    <FormControl>
                  <Input
                    type='number'
                    min={1}
                    max={120}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='excerpt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='thumbnailUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ảnh đại diện — khuyến nghị 1200 × 675 px (16:9)
                  </FormLabel>
                  <FormControl>
                    <div className='space-y-3'>
                      <label
                        htmlFor='post-thumbnail'
                        className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50'
                      >
                        {isUploadingThumbnail ? (
                          <Loader2 className='size-7 animate-spin text-muted-foreground' />
                        ) : (
                          <ImagePlus className='size-7 text-muted-foreground' />
                        )}
                        <span className='text-sm font-medium'>
                          {isUploadingThumbnail ? 'Đang tải ảnh...' : 'Chọn ảnh đại diện'}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          JPG, PNG hoặc WebP, tối đa 5 MB.
                        </span>
                      </label>
                      <Input
                        id='post-thumbnail'
                        type='file'
                        accept='image/jpeg,image/png,image/webp'
                        className='sr-only'
                        disabled={isUploadingThumbnail}
                        onChange={(event) => {
                          void uploadThumbnail(event.target.files?.[0])
                          event.target.value = ''
                        }}
                      />
                      {thumbnailPreview && (
                        <div className='relative overflow-hidden rounded-lg border bg-muted'>
                          <img src={thumbnailPreview} alt='Xem trước ảnh đại diện' className='aspect-video w-full object-cover' />
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute right-2 top-2 size-8'
                            aria-label='Xóa ảnh đại diện'
                            onClick={() => {
                              field.onChange('')
                              setThumbnailPreview('')
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      )}
                      <input type='hidden' {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <PostContentEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isPublished'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <SelectDropdown
                    defaultValue={String(field.value)}
                    onValueChange={(value) => field.onChange(value === 'true')}
                    items={postStatuses.map((status) => ({
                      label: status.label,
                      value: String(status.value),
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='border-t pt-4'>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            form='posts-form'
            type='submit'
            disabled={form.formState.isSubmitting || isUploadingThumbnail}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
