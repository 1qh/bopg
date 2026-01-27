import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { startCase } from 'es-toolkit/string'

import Input from './input'
import NumberInput from './number-input'

const FieldInput = <T extends FieldValues>({
  asterisk,
  control,
  inputClassName,
  isNumber,
  name,
  placeholder,
  ...props
}: ComponentProps<'div'> & {
  asterisk?: boolean
  control: Control<T>
  inputClassName?: string
  isNumber?: boolean
  name: keyof T
  placeholder?: string
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem {...props}>
        <FormControl>
          {isNumber ? (
            <NumberInput
              {...field}
              inputClassName={inputClassName}
              placeholder={(placeholder ?? startCase(field.name)) + (asterisk ? ' *' : '')}
            />
          ) : (
            <Input
              {...field}
              inputClassName={inputClassName}
              placeholder={(placeholder ?? startCase(field.name)) + (asterisk ? ' *' : '')}
            />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldInput
