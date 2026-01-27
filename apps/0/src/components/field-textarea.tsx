import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { cn } from '@a/ui'
import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { startCase } from 'es-toolkit/string'

import Textarea from './textarea'

const FieldTextarea = <T extends FieldValues>({
  asterisk,
  control,
  name,
  placeholder,
  textareaClassName,
  ...props
}: ComponentProps<'div'> & {
  asterisk?: boolean
  control: Control<T>
  name: keyof T
  placeholder?: string
  textareaClassName?: string
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem {...props}>
        <FormControl>
          <Textarea
            {...field}
            className={cn('min-h-24', textareaClassName)}
            placeholder={placeholder ?? startCase(name as string) + (asterisk ? ' *' : '')}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldTextarea
