import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Textarea } from '@/components/ui/textarea'
import {
  CreatePost,
  UpdatePost,
  UploadFile,
  type Post,
  type PostDtoRequest,
  type PostImage,
} from '../api'
import { postStatuses } from '../data/data'

type PostsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Post
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  isPublic: z.boolean(),
  thumbnail: z.string().min(1, 'Thumbnail is required.'),
  imageIds: z.array(z.string()).optional(),
})
type PostForm = z.infer<typeof formSchema>

export function PostsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PostsMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()
  const [extraImages, setExtraImages] = useState<PostImage[]>([])

  const form = useForm<PostForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      isPublic: true,
      thumbnail: '',
      imageIds: [],
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        title: currentRow.title,
        content: currentRow.content,
        isPublic: currentRow.isPublic,
        thumbnail: currentRow.thumbnail,
        imageIds: currentRow.postImages.map((pi) => pi.imageId),
      })
      setExtraImages(currentRow.postImages.map((pi) => pi.image))
    } else {
      form.reset({
        title: '',
        content: '',
        isPublic: true,
        thumbnail: '',
        imageIds: [],
      })
      setExtraImages([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRow, open])

  const onThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const res = await UploadFile(file)
      form.setValue('thumbnail', res.data.fileName)
      toast.success('Thumbnail uploaded successfully')
    } catch (_error) {
      toast.error('Upload failed')
    }
  }

  const onExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      for (let i = 0; i < files.length; i++) {
        const res = await UploadFile(files[i])
        const newImage = res.data
        setExtraImages((prev) => [...prev, newImage])
        const currentIds = form.getValues('imageIds') || []
        form.setValue('imageIds', [...currentIds, newImage.id])
      }
      toast.success('Images uploaded successfully')
    } catch (_error) {
      toast.error('Some images failed to upload')
    }
  }

  const removeExtraImage = (id: string) => {
    setExtraImages((prev) => prev.filter((img) => img.id !== id))
    const currentIds = form.getValues('imageIds') || []
    form.setValue(
      'imageIds',
      currentIds.filter((iid) => iid !== id)
    )
  }

  const onSubmit = async (data: PostForm) => {
    try {
      const requestData: PostDtoRequest = {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        thumbnail: data.thumbnail,
        imageIds: data.imageIds,
      }

      if (isUpdate && currentRow) {
        await UpdatePost(currentRow.id, requestData)
        toast.success('Post updated successfully')
      } else {
        await CreatePost(requestData)
        toast.success('Post created successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      onOpenChange(false)
      form.reset()
    } catch (_error) {
      toast.error('Failed to save post.')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-xl'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Post</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the post by providing necessary info.'
              : 'Add a new post by providing necessary info.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='posts-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter post title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='thumbnail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      <Input
                        type='file'
                        accept='image/*'
                        onChange={onThumbnailUpload}
                      />
                      {field.value && (
                        <div className='mt-2 overflow-hidden rounded-md border'>
                          <img
                            src={field.value}
                            alt='Preview'
                            className='h-32 w-full object-cover'
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Extra Images</FormLabel>
              <div className='grid grid-cols-3 gap-2'>
                {extraImages.map((img) => (
                  <div key={img.id} className='relative group'>
                    <img
                      src={img.fileName}
                      alt=''
                      className='h-24 w-full rounded-md object-cover border'
                    />
                    <button
                      type='button'
                      onClick={() => removeExtraImage(img.id)}
                      className='absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className='flex h-24 cursor-pointer items-center justify-center rounded-md border-2 border-dashed hover:bg-muted transition-colors'>
                  <Plus className='text-muted-foreground' />
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    className='hidden'
                    onChange={onExtraImageUpload}
                  />
                </label>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      placeholder='Enter post content'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isPublic'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value ? 'true' : 'false'}
                    onValueChange={(v) => field.onChange(v === 'true')}
                    placeholder='Select status'
                    items={postStatuses.map((s) => ({
                      label: s.label,
                      value: s.value ? 'true' : 'false',
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2 pt-4'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            form='posts-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
