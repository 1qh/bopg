import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { Textarea } from '@a/ui/textarea'

import Placeholder from './placeholder'

const MyTextarea = ({ className, delay, placeholder, ...props }: ComponentProps<'textarea'> & { delay?: boolean }) => {
  const showCounter = props.maxLength && typeof props.value === 'string' && props.value.trim()
  return (
    <div className='relative'>
      <Textarea className={cn('peer dark:bg-background', className, showCounter && 'pb-5')} placeholder=' ' {...props} />
      <Placeholder className={cn('peer-placeholder-shown:top-5', delay && 'delay-1000')}>{placeholder}</Placeholder>
      {showCounter && typeof props.value === 'string' ? (
        <p className='absolute right-1.5 bottom-1 text-xs font-light text-muted-foreground'>
          {props.value.trim().length}/{props.maxLength}
        </p>
      ) : null}
    </div>
  )
}

export default MyTextarea
