import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetMasterDatas } from '@/features/master-data/api'
import { getMedicines } from '@/features/prescriptions/api'
import {
  createPrescriptionTemplate,
  deletePrescriptionTemplate,
  getPrescriptionTemplates,
  updatePrescriptionTemplate,
  type PrescriptionTemplate,
  type PrescriptionTemplateItem,
} from './api'

type DialogType = 'create' | 'update' | 'delete' | null
const DEFAULT_INSTRUCTIONS = [
  'Uống trước ăn',
  'Uống sau ăn',
  'Uống trong bữa ăn',
  'Uống vào buổi sáng',
  'Uống vào buổi tối',
  'Uống khi cần',
  'Ngậm dưới lưỡi',
  'Bôi ngoài da',
]
const emptyItem = (): PrescriptionTemplateItem => ({
  medicineId: '',
  medicineName: '',
  quantity: 1,
  instruction: '',
})

export function PrescriptionTemplates() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState<DialogType>(null)
  const [current, setCurrent] = useState<PrescriptionTemplate | null>(null)
  const [name, setName] = useState('')
  const [items, setItems] = useState<PrescriptionTemplateItem[]>([emptyItem()])

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['prescription-templates'],
    queryFn: () => getPrescriptionTemplates(),
  })
  const { data: medicines = [] } = useQuery({
    queryKey: ['prescription-template-medicines'],
    queryFn: () => getMedicines(),
  })
  const { data: masterData } = useQuery({
    queryKey: ['master-data'],
    queryFn: () => GetMasterDatas({ page: 1 }),
  })
  const instructionOptions = (
    masterData?.data.find((item) => item.key === 'MEDICINE_INSTRUCTION_OPTIONS')
      ?.value ?? DEFAULT_INSTRUCTIONS.join('\n')
  )
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)

  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrent(null), 300)
  }
  const patchItem = (index: number, patch: Partial<PrescriptionTemplateItem>) =>
    setItems((rows) =>
      rows.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )

  const save = async () => {
    const validItems = items.filter(
      (item) => item.medicineId && item.quantity > 0
    )
    if (!name.trim() || validItems.length !== items.length) {
      toast.error('Nhập tên mẫu và đầy đủ thông tin thuốc')
      return
    }
    if (
      new Set(validItems.map((item) => item.medicineId)).size !==
      validItems.length
    ) {
      toast.error('Mỗi thuốc chỉ được chọn một lần')
      return
    }
    try {
      const data = { name: name.trim(), items: validItems }
      if (current) await updatePrescriptionTemplate(current, data)
      else await createPrescriptionTemplate(data)
      await queryClient.invalidateQueries({
        queryKey: ['prescription-templates'],
      })
      toast.success(current ? 'Đã cập nhật mẫu đơn' : 'Đã tạo mẫu đơn')
      close()
    } catch (error) {
      toast.error('Không lưu được mẫu đơn', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const remove = async () => {
    if (!current) return
    try {
      await deletePrescriptionTemplate(current.id)
      await queryClient.invalidateQueries({
        queryKey: ['prescription-templates'],
      })
      toast.success('Đã xóa mẫu đơn')
      close()
    } catch (error) {
      toast.error('Không xóa được mẫu đơn', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const columns: ColumnDef<PrescriptionTemplate>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tên mẫu' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name}</span>
      ),
    },
    {
      id: 'medicines',
      header: 'Thuốc trong mẫu',
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.items.map((item) => item.medicineName).join(', ')}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'itemCount',
      header: 'Số thuốc',
      cell: ({ row }) => row.original.items.length,
      meta: { className: 'text-end', tdClassName: 'text-end' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
            >
              <DotsHorizontalIcon />
              <span className='sr-only'>Mở menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem
              onClick={() => {
                setCurrent(row.original)
                setName(row.original.name)
                setItems(row.original.items.map((item) => ({ ...item })))
                setOpen('update')
              }}
            >
              Sửa
              <DropdownMenuShortcut>
                <Edit size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='!text-red-500'
              onClick={() => {
                setCurrent(row.original)
                setOpen('delete')
              }}
            >
              Xóa
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mẫu đơn thuốc</h2>
            <p className='text-muted-foreground'>
              Tạo các đơn thường dùng để chọn nhanh khi kê toa.
            </p>
          </div>
          <Button
            onClick={() => {
              setCurrent(null)
              setName('')
              setItems([emptyItem()])
              setOpen('create')
            }}
          >
            <Plus /> Thêm mẫu đơn
          </Button>
        </div>
        <UrlDataTable
          columns={columns}
          data={templates}
          isLoading={isLoading}
          searchPlaceholder='Tìm tên mẫu hoặc thuốc...'
          emptyMessage='Chưa có mẫu đơn thuốc.'
          getSearchText={(row) =>
            `${row.name} ${row.items.map((item) => item.medicineName).join(' ')}`
          }
        />
      </Main>

      <Dialog
        open={open === 'create' || open === 'update'}
        onOpenChange={(value) => {
          if (!value) close()
        }}
      >
        <DialogContent className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {current ? 'Sửa mẫu đơn thuốc' : 'Thêm mẫu đơn thuốc'}
            </DialogTitle>
            <DialogDescription>
              Thiết lập thuốc, số lượng và hướng dẫn sử dụng mặc định.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 overflow-y-auto px-1'>
            <div className='space-y-2'>
              <Label>Tên mẫu</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='VD: Cảm cúm người lớn'
              />
            </div>
            {items.map((item, index) => (
              <div key={index} className='grid gap-3 rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <Label>Thuốc {index + 1}</Label>
                  <Button
                    variant='ghost'
                    size='icon'
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
                <select
                  className='h-9 rounded-md border bg-background px-3 text-sm'
                  value={item.medicineId}
                  onChange={(e) => {
                    const medicine = medicines.find(
                      (m) => m.id === e.target.value
                    )
                    patchItem(index, {
                      medicineId: e.target.value,
                      medicineName: medicine?.name ?? '',
                    })
                  }}
                >
                  <option value=''>Chọn thuốc</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} · {medicine.strength}
                    </option>
                  ))}
                </select>
                <div className='grid gap-3 sm:grid-cols-[8rem_1fr]'>
                  <div className='space-y-2'>
                    <Label>Số lượng</Label>
                    <Input
                      type='number'
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        patchItem(index, { quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Hướng dẫn sử dụng</Label>
                    <Select
                      value={item.instruction || '__none__'}
                      onValueChange={(value) =>
                        patchItem(index, {
                          instruction: value === '__none__' ? '' : value,
                        })
                      }
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn hướng dẫn sử dụng' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__none__'>
                          Không có hướng dẫn
                        </SelectItem>
                        {item.instruction &&
                          !instructionOptions.includes(item.instruction) && (
                            <SelectItem value={item.instruction}>
                              {item.instruction}
                            </SelectItem>
                          )}
                        {instructionOptions.map((instruction) => (
                          <SelectItem key={instruction} value={instruction}>
                            {instruction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setItems((rows) => [...rows, emptyItem()])}
            >
              <Plus /> Thêm thuốc
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Đóng</Button>
            </DialogClose>
            <Button onClick={() => void save()}>Lưu mẫu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(value) => {
          if (!value) close()
        }}
        title='Xóa mẫu đơn thuốc?'
        desc={
          <>
            Mẫu <strong>{current?.name}</strong> sẽ bị xóa và không thể hoàn
            tác.
          </>
        }
        confirmText='Xóa'
        cancelBtnText='Hủy'
        destructive
        handleConfirm={() => void remove()}
      />
    </>
  )
}
