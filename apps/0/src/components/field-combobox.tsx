import type { ComponentProps, ReactNode } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@a/ui/command'
import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'

const FieldCombobox = <T extends FieldValues>({
  className,
  control,
  name,
  placeholder,
  values,
  ...props
}: ComponentProps<'div'> & {
  control: Control<T>
  name: keyof T
  placeholder?: ReactNode | string
  values: string[]
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem className={cn('relative', className)} {...props}>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                className={cn(
                  'w-48 justify-between rounded-full pl-4! font-normal',
                  !field.value && 'text-muted-foreground'
                )}
                variant='outline'>
                {field.value ?? placeholder ?? 'Select an option'}
                <ChevronsUpDown className='opacity-50' />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className='w-48 p-0'>
            <Command>
              <CommandInput className='h-9' placeholder='Search' />
              <CommandList>
                <CommandEmpty>Not found</CommandEmpty>
                <CommandGroup>
                  {values.map(v => (
                    <CommandItem key={v} onSelect={() => field.onChange(v)} value={v}>
                      {v}
                      <Check className={cn('ml-auto', v === field.value ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldCombobox
