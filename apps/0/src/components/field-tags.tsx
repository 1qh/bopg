import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { cn } from '@a/ui'
import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { startCase } from 'es-toolkit/string'
import { Lightbulb } from 'lucide-react'

import InputTags from './input-tags'
import Tutip from './tutip'

const FieldTags = <T extends FieldValues>({
  className,
  control,
  name,
  placeholder,
  ...props
}: ComponentProps<'div'> & {
  control: Control<T>
  name: keyof T
  placeholder?: string
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem className={cn('relative', className)} {...props}>
        <FormControl>
          <InputTags {...field} placeholder={placeholder ?? startCase(field.name)} value={field.value as string[]} />
        </FormControl>
        <Tutip openDelay={150} side='right' tooltip='press Comma or Enter to add a tag'>
          <Lightbulb className='absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-full stroke-1 p-2 transition-all duration-300 hover:scale-110 hover:bg-muted hover:stroke-2' />
        </Tutip>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldTags
