import * as React from 'react'
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type MultiSelectOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  clearText?: string
  maxDisplayValues?: number
  disabled?: boolean
  className?: string
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  clearText = 'Clear',
  maxDisplayValues = 2,
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedSet = React.useMemo(() => new Set(value), [value])
  const selectedOptions = React.useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet]
  )

  const handleToggle = (optionValue: string) => {
    const nextValues = selectedSet.has(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange(nextValues)
  }

  const handleClear = () => onValueChange([])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-9 w-full justify-between gap-2 px-3 font-normal',
            className
          )}
        >
          <span className='flex min-w-0 items-center gap-1.5 overflow-hidden'>
            {selectedOptions.length === 0 ? (
              <span className='truncate text-muted-foreground'>{placeholder}</span>
            ) : selectedOptions.length <= maxDisplayValues ? (
              selectedOptions.map((option) => (
                <Badge key={option.value} variant='secondary' className='truncate'>
                  {option.label}
                </Badge>
              ))
            ) : (
              <Badge variant='secondary'>{selectedOptions.length} selected</Badge>
            )}
          </span>
          <ChevronDownIcon className='size-4 shrink-0 text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-(--radix-popover-trigger-width) p-0' align='start'>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedSet.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    disabled={option.disabled}
                    onSelect={() => handleToggle(option.value)}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className='size-3.5' />
                    </div>
                    {option.icon && (
                      <option.icon className='size-4 text-muted-foreground' />
                    )}
                    <span className='truncate'>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleClear} className='justify-between'>
                    {clearText}
                    <XIcon className='size-4 text-muted-foreground' />
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
