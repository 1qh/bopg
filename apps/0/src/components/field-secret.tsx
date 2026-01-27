import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'

import PasswordInput from './password-input'

const FieldSecret = <T extends FieldValues>({
  control,
  name,
  ...props
}: ComponentProps<'div'> & { control: Control<T>; name: keyof T }) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem {...props}>
        <FormControl>
          <PasswordInput {...field} placeholder={field.name} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldSecret
