import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import {
  CreateBanner,
  UpdateBanner,
  UploadFile,
  type Banner,
  type BannerDtoRequest,
} from '../api'
import { bannerStatuses } from '../data/data'

type BannerMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Banner
}

const formSchema = z.object({
  fileName: z.string().min(1, 'File is required.'),
  isPublic: z.boolean(),
  sortOrder: z.number(),
  type: z.string().min(1, 'Type is required.'),
})
type BannerForm = z.infer<typeof formSchema>

export function BannersMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: BannerMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<BannerForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: '',
      isPublic: true,
      sortOrder: 0,
      type: 'website',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        fileName: currentRow.fileName,
        isPublic: currentRow.isPublic,
        sortOrder: currentRow.sortOrder,
        type: currentRow.type,
      })
    } else {
      form.reset({
        fileName: '',
        isPublic: true,
        sortOrder: 0,
        type: 'website',
      })
    }
  }, [currentRow, form, open])

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const res = await UploadFile(file)
      form.setValue('fileName', res.fileName)
      toast.success('File uploaded successfully', {
        description: `File name: ${res.fileName}`,
      })
    } catch (_error) {
      toast.error('Upload failed', {
        description: 'Failed to upload banner image.',
      })
    }
  }

  const onSubmit = async (data: BannerForm) => {
    try {
      const requestData: BannerDtoRequest = {
        fileName: data.fileName,
        isPublic: data.isPublic,
        sortOrder: data.sortOrder,
        type: data.type,
      }

      if (isUpdate && currentRow) {
        await UpdateBanner(currentRow.id, requestData)
        toast.success('Banner updated successfully')
      } else {
        await CreateBanner(requestData)
        toast.success('Banner created successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      onOpenChange(false)
      form.reset()
    } catch (_error) {
      toast.error('Failed to save banner.')
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
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Banner</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the banner by providing necessary info.'
              : 'Add a new banner by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='banners-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='fileName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      <Input
                        type='file'
                        accept='image/*'
                        onChange={onFileUpload}
                      />
                      <Input
                        {...field}
                        readOnly
                        placeholder='File name will appear here'
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
            <FormField
              control={form.control}
              name='sortOrder'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder='Enter sort order'
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
                    items={bannerStatuses.map((s) => ({
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
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            form='banners-form'
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
