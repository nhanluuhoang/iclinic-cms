import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { GetMedicines, type Medicine } from '@/features/medicines/api'
import { CreateStockTake, GetBatches } from '../api'
import { formatNumber, toDateInput } from '../utils'
import { ExpiryBadge } from './expiry-badge'

function MedicinePicker({
  selected,
  onChange,
}: {
  selected: Medicine | null
  onChange: (medicine: Medicine) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', 'search', debouncedSearch],
    queryFn: () => GetMedicines(debouncedSearch),
    enabled: open,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id='stocktake-medicine'
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          <span className='truncate'>
            {selected
              ? `${selected.name} · ${selected.strength}`
              : 'Tìm và chọn thuốc'}
          </span>
          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Tìm tên, mã hoặc hoạt chất...'
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Đang tìm...' : 'Không tìm thấy thuốc.'}
            </CommandEmpty>
            <CommandGroup>
              {(medicines ?? []).map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={medicine.id}
                  onSelect={() => {
                    onChange(medicine)
                    setOpen(false)
                  }}
                  className='items-start'
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-4',
                      medicine.id === selected?.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='min-w-0'>
                    <p className='truncate font-medium'>
                      {medicine.name} · {medicine.strength}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {medicine.code} · {medicine.activeIngredient} ·{' '}
                      {medicine.unit}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function StockTakeMutateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [medicineId, setMedicineId] = useState('')
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  )
  const [countedAt, setCountedAt] = useState(toDateInput(new Date()))
  const [note, setNote] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: allBatches } = useQuery({
    queryKey: ['inventory', 'batches'],
    queryFn: () => GetBatches(),
    enabled: open,
  })

  const batches = useMemo(
    () =>
      (allBatches ?? []).filter(
        (b) => b.medicineId === medicineId && b.qtyRemaining > 0
      ),
    [allBatches, medicineId]
  )

  useEffect(() => {
    if (open) {
      setMedicineId('')
      setSelectedMedicine(null)
      setCountedAt(toDateInput(new Date()))
      setNote('')
      setCounts({})
    }
  }, [open])

  useEffect(() => {
    setCounts({})
  }, [medicineId])

  const changedLines = batches
    .filter(
      (b) => counts[b.id] !== undefined && counts[b.id] !== b.qtyRemaining
    )
    .map((b) => ({ batchId: b.id, countedQty: counts[b.id] }))

  const onSubmit = async () => {
    if (changedLines.length === 0) return
    setIsSubmitting(true)
    try {
      await CreateStockTake({ countedAt, note, lines: changedLines })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Đã lưu phiếu kiểm kê', {
        description: `${changedLines.length} lô được điều chỉnh tồn.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('Không lưu được phiếu kiểm kê', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-2xl'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='pe-8 text-start'>
          <DialogTitle>Kiểm kê tồn kho</DialogTitle>
          <DialogDescription>
            Chọn thuốc rồi nhập số thực đếm cho từng lô. Chỉ những lô có số lệch
            mới được ghi vào phiếu.
          </DialogDescription>
        </DialogHeader>

        <div className='-mx-1 space-y-6 overflow-y-auto px-1'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='stocktake-medicine'>Thuốc</Label>
              <MedicinePicker
                selected={selectedMedicine}
                onChange={(medicine) => {
                  setSelectedMedicine(medicine)
                  setMedicineId(medicine.id)
                }}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='stocktake-date'>Ngày kiểm kê</Label>
              <DatePickerInput
                id='stocktake-date'
                value={countedAt}
                onChange={setCountedAt}
              />
            </div>
          </div>

          {medicineId && (
            <div className='space-y-2'>
              <Label>Các lô đang còn tồn ({batches.length})</Label>
              {batches.length === 0 ? (
                <p className='rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground'>
                  Thuốc này không còn lô nào có tồn.
                </p>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50 text-xs text-muted-foreground'>
                      <tr>
                        <th className='px-3 py-2 text-start font-medium'>
                          Số lô
                        </th>
                        <th className='px-3 py-2 text-start font-medium'>
                          Hạn sử dụng
                        </th>
                        <th className='px-3 py-2 text-end font-medium'>
                          Tồn hệ thống
                        </th>
                        <th className='px-3 py-2 text-end font-medium'>
                          Thực đếm
                        </th>
                        <th className='px-3 py-2 text-end font-medium'>Lệch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch) => {
                        const counted = counts[batch.id]
                        const diff =
                          counted === undefined
                            ? null
                            : counted - batch.qtyRemaining

                        return (
                          <tr key={batch.id} className='border-t'>
                            <td className='px-3 py-2 font-mono text-xs'>
                              {batch.batchNo}
                            </td>
                            <td className='px-3 py-2'>
                              <ExpiryBadge date={batch.expiryDate} />
                            </td>
                            <td className='px-3 py-2 text-end tabular-nums'>
                              {formatNumber(batch.qtyRemaining)}
                            </td>
                            <td className='px-3 py-2 text-end'>
                              <Input
                                type='number'
                                min={0}
                                className='ms-auto h-8 w-24 text-end'
                                placeholder={String(batch.qtyRemaining)}
                                value={counted ?? ''}
                                onChange={(e) =>
                                  setCounts((prev) => {
                                    const next = { ...prev }
                                    if (e.target.value === '') {
                                      delete next[batch.id]
                                    } else {
                                      next[batch.id] = Number(e.target.value)
                                    }
                                    return next
                                  })
                                }
                              />
                            </td>
                            <td
                              className={cn(
                                'px-3 py-2 text-end font-medium tabular-nums',
                                diff === null || diff === 0
                                  ? 'text-muted-foreground'
                                  : diff > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                              )}
                            >
                              {diff === null
                                ? '—'
                                : diff > 0
                                  ? `+${formatNumber(diff)}`
                                  : formatNumber(diff)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='stocktake-note'>Ghi chú</Label>
            <Textarea
              id='stocktake-note'
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Lý do lệch tồn, người kiểm kê... (không bắt buộc)'
            />
          </div>
        </div>

        <DialogFooter className='border-t pt-4 sm:items-center'>
          <span className='flex-1 text-sm text-muted-foreground'>
            {changedLines.length} lô có số lệch
          </span>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || changedLines.length === 0}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu phiếu kiểm kê'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
