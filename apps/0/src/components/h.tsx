import type { ComponentProps } from 'react'

import { cn } from '@a/ui'

const H = ({ children, className, ...props }: ComponentProps<'p'>) => (
  <p className={cn('mt-7 mb-2 pt-5 text-2xl font-semibold', className)} {...props}>
    {children}
  </p>
)

export default H
