import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'

import Checkboxes from './checkboxes'

const FieldCheckboxes = <T extends FieldValues>({
  control,
  name,
  options,
  ...props
}: ComponentProps<'div'> & {
  control: Control<T>
  name: keyof T
  options: string[]
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem {...props}>
        <FormControl>
          <Checkboxes {...field} isFlag={field.name === 'languages'} options={options} value={field.value ?? []} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldCheckboxes
