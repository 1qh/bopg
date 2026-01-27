import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { cn } from '@a/ui'
import { FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import Flag from '@svgr-iconkit/flag-icons'
import { lang2flag } from 'constant'

const FieldLanguage = <T extends FieldValues>({
  asterisk,
  className,
  control,
  disable = false,
  name,
  ...props
}: ComponentProps<'div'> & {
  asterisk?: boolean
  control: Control<T>
  disable?: boolean
  name: keyof T
}) => (
  <FormField
    control={control}
    name={name as Path<T>}
    render={({ field }) => (
      <FormItem className={cn('relative', className)} {...props}>
        <Select disabled={disable} onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger className='w-full capitalize data-placeholder:normal-case'>
              <SelectValue placeholder='Select a language' />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {Object.entries(lang2flag).map(([lang, flag]) => (
              <SelectItem className='capitalize' key={lang} value={lang}>
                <Flag className='size-5 rounded-full' name={flag} variant='square' />
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='absolute -top-2.5 left-2 bg-background px-1 text-[10px] text-muted-foreground capitalize'>
          {field.name + (asterisk ? ' *' : '')}
        </p>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FieldLanguage
