import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { cn } from '@a/ui'
import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'

const FieldSelect = <T extends FieldValues>({
  className,
  control,
  label,
  labelTransformer,
  name,
  placeholder,
  values,
  ...props
}: ComponentProps<'div'> & {
  control: Control<T>
  label?: string
  labelTransformer?: (value: string) => string
  name: keyof T
  placeholder?: string
  values: string[]
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem className={cn('relative', className)} {...props}>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger className='w-full capitalize data-placeholder:normal-case'>
              <SelectValue placeholder={placeholder ?? 'Select an option'} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {values.map(v => (
              <SelectItem className='capitalize' key={v} value={v}>
                {labelTransformer ? labelTransformer(v) : v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='absolute -top-2.5 left-2 bg-background px-1 text-[10px] text-muted-foreground capitalize'>
          {label ?? field.name}
        </p>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldSelect
