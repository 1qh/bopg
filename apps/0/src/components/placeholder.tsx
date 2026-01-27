import type { ComponentProps } from 'react'

import { cn } from '@a/ui'

const Placeholder = ({ children, className }: ComponentProps<'p'>) => (
  <p
    className={cn(
      'pointer-events-none absolute start-2 top-2 origin-left -translate-y-5 scale-75 cursor-text rounded-lg bg-background px-1.5 text-sm font-normal text-muted-foreground capitalize duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:px-1.5 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
      className
    )}>
    {children}
  </p>
)

export default Placeholder
