import { cn } from '@a/ui'
import React from 'react'

export const BaseNode = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }>(
  ({ className, selected, ...props }, ref) => (
    <div
      className={cn(
        'max-w-90 overflow-hidden rounded-xl border bg-background p-1.5 shadow-lg transition-all duration-300 hover:scale-[101%] hover:shadow-2xl hover:drop-shadow-2xl dark:border-muted-foreground',
        className,
        selected && 'border-foreground'
      )}
      ref={ref}
      {...props}
    />
  )
)
BaseNode.displayName = 'BaseNode'
