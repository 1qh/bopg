import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { useFormField } from '@a/ui/form'

const FormMessage = ({ className, ...props }: ComponentProps<'p'>) => {
  const { error, formMessageId } = useFormField()
  if (!error) return null
  return (
    <p className={cn('text-sm text-destructive', className)} data-slot='form-message' id={formMessageId} {...props}>
      {error.message?.split(' ').slice(1).join(' ')}
    </p>
  )
}

export default FormMessage
