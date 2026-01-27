import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { Input } from '@a/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import Placeholder from './placeholder'

const PasswordInput = ({
  children,
  className,
  delay,
  inputClassName,
  placeholder,
  ...props
}: ComponentProps<'input'> & {
  delay?: boolean
  inputClassName?: string
}) => {
  const [show, setShow] = useState(false),
    Icon = show ? EyeOff : Eye
  return (
    <div className={cn('relative', className)}>
      <Icon
        className='absolute top-1/2 right-1 size-7 -translate-y-1/2 cursor-pointer rounded-sm stroke-1 p-1 text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-muted hover:stroke-[1.5] hover:text-foreground active:scale-75'
        onClick={() => setShow(!show)}
      />
      <Input
        autoComplete='off'
        className={cn('peer dark:bg-background', inputClassName)}
        placeholder=' '
        type={show ? 'text' : 'password'}
        {...props}
      />
      {children}
      <Placeholder className={cn(delay && 'delay-1000')}>{placeholder}</Placeholder>
    </div>
  )
}

export default PasswordInput
