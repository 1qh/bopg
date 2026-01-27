import type { ALIGN_OPTIONS, SIDE_OPTIONS } from '@radix-ui/react-popper'
import type { HTMLAttributes, ReactNode } from 'react'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@a/ui/hover-card'

interface TutipProps extends HTMLAttributes<HTMLElement> {
  align?: (typeof ALIGN_OPTIONS)[number]
  asChild?: boolean
  children: ReactNode
  closeDelay?: number
  openDelay?: number
  side: (typeof SIDE_OPTIONS)[number]
  sideOffset?: number
  tooltip?: ReactNode
  tooltipClassName?: string
}

const Tutip = ({
  align,
  asChild = true,
  children,
  closeDelay = 100,
  openDelay = 0,
  side,
  sideOffset = 4,
  tooltip,
  tooltipClassName,
  ...props
  // eslint-disable-next-line @typescript-eslint/promise-function-async
}: TutipProps) =>
  // biome-ignore lint/nursery/noMisusedPromises: x
  tooltip ? (
    <HoverCard closeDelay={closeDelay} openDelay={openDelay}>
      <HoverCardTrigger asChild={asChild} {...props}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        align={align}
        className={tooltipClassName ?? 'w-fit border-none px-2.5 py-1 text-sm font-light'}
        side={side}
        sideOffset={sideOffset}>
        {tooltip}
      </HoverCardContent>
    </HoverCard>
  ) : (
    children
  )

export default Tutip
