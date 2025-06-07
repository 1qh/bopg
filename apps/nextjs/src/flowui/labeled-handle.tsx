'use client'

import type { HandleProps } from '@xyflow/react'

import { cn } from '@a/ui'
import React from 'react'

import { BaseHandle } from './base-handle'

const flexDirections = {
    bottom: 'flex-col-reverse',
    left: '',
    right: 'flex-row-reverse',
    top: 'flex-col'
  },
  LabeledHandle = React.forwardRef<
    HTMLDivElement,
    HandleProps &
      React.HTMLAttributes<HTMLDivElement> & {
        handleClassName?: string
        labelClassName?: string
        title: string
      }
  >(({ className, handleClassName, labelClassName, position, title, ...props }, ref) => (
    <div className={cn('relative mt-1 flex items-center', flexDirections[position], className)} ref={ref} title={title}>
      <BaseHandle className={handleClassName} position={position} {...props} />
      <p className={cn('px-3 text-foreground', labelClassName)}>{title}</p>
    </div>
  ))

LabeledHandle.displayName = 'LabeledHandle'

export { LabeledHandle }
