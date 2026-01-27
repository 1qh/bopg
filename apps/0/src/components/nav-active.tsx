import type { ComponentProps } from 'react'

import { cn } from '@a/ui'

interface NavActiveProps {
  active: boolean
  vertical?: boolean
}

const NavActive = ({ active, className, vertical = true, ...props }: ComponentProps<'div'> & NavActiveProps) => (
  <div
    {...props}
    className={cn(
      'absolute size-0 rounded-full bg-blue-500/70 transition-all duration-500',
      vertical ? 'top-1/2 left-0 -translate-y-1/2' : 'bottom-0 left-1/2 -translate-x-1/2',
      active && (vertical ? '-left-2 h-[80%] w-1' : '-bottom-1.5 h-0.75 w-[80%]'),
      className
    )}
  />
)

export default NavActive
