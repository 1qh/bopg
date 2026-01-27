import type { HandleProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { Handle, Position } from '@xyflow/react'

type HandProps = Omit<HandleProps, 'position' | 'type'> & { className?: string }

const SourceHand = ({ className, ...props }: HandProps) => (
  <Handle
    className={cn(
      'size-0! translate-x-4 border-transparent! bg-transparent! transition-all duration-200 group-hover:size-5! group-hover:border-foreground! group-hover:bg-muted! hover:size-6!',
      className
    )}
    position={Position.Right}
    type='source'
    {...props}
  />
)

export default SourceHand
