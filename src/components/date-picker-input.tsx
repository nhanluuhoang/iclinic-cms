import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function parseIsoDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  )
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : undefined
}

function parseDisplayDate(value: string): Date | undefined {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
  if (!match) return undefined
  const date = new Date(
    Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1])
  )
  return date.getFullYear() === Number(match[3]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[1])
    ? date
    : undefined
}

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const toDisplayDate = (date?: Date) =>
  date
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    : ''

export function DatePickerInput({
  id,
  value,
  onChange,
  className,
  inputClassName,
  minDate,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  className?: string
  inputClassName?: string
  minDate?: string
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(() =>
    toDisplayDate(parseIsoDate(value))
  )
  const selected = parseIsoDate(value)
  const minimum = minDate ? parseIsoDate(minDate) : undefined
  const isAllowed = (date: Date) => !minimum || date >= minimum

  useEffect(() => {
    setInputValue(toDisplayDate(parseIsoDate(value)))
  }, [value])

  const commitInput = () => {
    const date = parseDisplayDate(inputValue)
    if (date && isAllowed(date)) {
      onChange(toIsoDate(date))
      setInputValue(toDisplayDate(date))
      return
    }
    setInputValue(toDisplayDate(selected))
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        id={id}
        value={inputValue}
        inputMode='numeric'
        placeholder='dd/mm/yyyy'
        className={inputClassName}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={commitInput}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commitInput()
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='shrink-0'
            aria-label='Mở lịch chọn ngày'
          >
            <CalendarIcon className='size-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <Calendar
            mode='single'
            selected={selected}
            defaultMonth={selected ?? minimum}
            disabled={minimum ? { before: minimum } : undefined}
            onSelect={(date) => {
              if (!date || !isAllowed(date)) return
              onChange(toIsoDate(date))
              setInputValue(toDisplayDate(date))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
