import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { Trash } from 'lucide-react'

export const BaseNode = ({
  children,
  className,
  Icon,
  label,
  onDelete,
  selected,
  ...props
}: ComponentProps<'div'> & {
  Icon: LucideIcon
  label: string
  onDelete: () => void
  selected?: boolean
}) => (
  <div
    className={cn(
      'group max-w-90 rounded-xl border bg-background p-1.5 shadow-lg transition-all duration-300 hover:scale-[101%] hover:shadow-2xl hover:drop-shadow-2xl dark:border-muted-foreground',
      className,
      selected && 'border-foreground'
    )}
    {...props}>
    <p className='mb-1 flex items-center gap-1.5 pl-0.5 text-xl'>
      <Icon className='size-6 stroke-1' />
      {label}
      <Trash
        className='ml-auto size-0 cursor-pointer rounded-md stroke-1 px-1 text-muted-foreground transition-all duration-500 group-hover:size-7 hover:scale-110 hover:bg-destructive/20 hover:text-destructive active:scale-75'
        onClick={onDelete}
      />
    </p>
    {children}
  </div>
)
