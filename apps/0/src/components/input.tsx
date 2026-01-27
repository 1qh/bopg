import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { Input } from '@a/ui/input'

import Placeholder from './placeholder'

const MyInput = ({
  children,
  className,
  delay,
  Icon,
  inputClassName,
  loading,
  placeholder,
  ...props
}: ComponentProps<'input'> & {
  delay?: boolean
  Icon?: LucideIcon
  inputClassName?: string
  loading?: boolean
}) => (
  <div className={cn('relative', className)}>
    {Icon ? (
      <div className='absolute top-1/2 left-2.25 -translate-y-1/2'>
        <Icon
          className={cn(
            'size-5 rounded-xs stroke-[1.4] text-muted-foreground/70 transition-all duration-500',
            loading && 'animate-spin rounded-3xl border border-foreground border-t-transparent text-transparent'
          )}
        />
      </div>
    ) : null}
    <Input className={cn('peer dark:bg-background', Icon && 'pl-9', inputClassName)} placeholder=' ' {...props} />
    {children}
    <Placeholder className={cn(Icon && 'peer-placeholder-shown:left-7 peer-focus:left-2', delay && 'delay-1000')}>
      {placeholder}
    </Placeholder>
    {props.maxLength && typeof props.value === 'string' && props.value.trim() ? (
      <p className='absolute top-px right-1 text-[10px] text-muted-foreground/50'>
        {props.value.trim().length}/{props.maxLength}
      </p>
    ) : null}
  </div>
)

export default MyInput
