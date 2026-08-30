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
import {
  CreateMasterData,
  UpdateMasterData,
  type MasterData,
  type MasterDataDtoRequest,
} from '../api'

type MasterDataMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: MasterData
}

const formSchema = z.object({
  key: z.string().min(1, 'Key is required.').max(100),
  value: z.string().min(1, 'Value is required.').max(100),
  searchKey: z.string().max(100).optional().or(z.literal('')),
})
type MasterDataForm = z.infer<typeof formSchema>

export function MasterDataMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: MasterDataMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<MasterDataForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: '',
      value: '',
      searchKey: '',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        key: currentRow.key,
        value: currentRow.value,
      })
    } else {
      form.reset({
        key: '',
        value: '',
        searchKey: '',
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: MasterDataForm) => {
    try {
      const requestData: MasterDataDtoRequest = {
        key: data.key,
        value: data.value,
      }

      if (isUpdate && currentRow) {
        await UpdateMasterData(currentRow.id, requestData)
        toast.success('Master data updated successfully')
      } else {
        await CreateMasterData(requestData)
        toast.success('Master data created successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['master-data'] })
      onOpenChange(false)
      form.reset()
    } catch (_error) {
      toast.error('Failed to save master data.')
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Master Data</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the master data by providing necessary info.'
              : 'Add a new master data by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='master-data-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='key'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter key' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='value'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter value' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='searchKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter search key' />
                  </FormControl>
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
            form='master-data-form'
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
