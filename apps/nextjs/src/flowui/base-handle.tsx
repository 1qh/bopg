import type { HandleProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { Handle } from '@xyflow/react'
import React from 'react'

export const BaseHandle = React.forwardRef<HTMLDivElement, HandleProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <Handle className={cn('', className)} ref={ref} {...props} />
)

BaseHandle.displayName = 'BaseHandle'
