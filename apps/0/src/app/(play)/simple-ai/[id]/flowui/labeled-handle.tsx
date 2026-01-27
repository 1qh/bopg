import type { HandleProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { Handle, useNodeConnections } from '@xyflow/react'

const flexDirections = {
  bottom: 'flex-col-reverse',
  left: '',
  right: 'flex-row-reverse',
  top: 'flex-col'
}

export const LabeledHandle = ({ className, position, ...props }: HandleProps & { id: string }) => (
  <div className={cn('relative -mx-1.5 flex capitalize', flexDirections[position], className)}>
    <Handle
      className={cn(
        'size-3!',
        useNodeConnections({ handleId: props.id, handleType: props.type }).length > 0
          ? 'bg-green-400!'
          : 'border-muted-foreground! bg-background!'
      )}
      position={position}
      {...props}
    />
    <span className='px-3'>{props.id}</span>
  </div>
)
