import type { ComponentProps } from 'react'

import { cn } from '@a/ui'

const Tr = ({ className, ...props }: ComponentProps<'tr'>) => (
  <tr
    className={cn(
      'group/tr rounded-2xl transition-all duration-300 *:max-w-36 *:truncate *:px-0.5 *:py-1.5 *:text-sm *:whitespace-pre-line hover:cursor-pointer hover:bg-muted [&>td]:first:rounded-l-3xl [&>td]:last:rounded-r-3xl [&>td]:last:pr-3',
      className
    )}
    {...props}
  />
)

export default Tr
