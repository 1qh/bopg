import { cn } from '@a/ui'
import { Badge } from '@a/ui/badge'

export const NodeHeaderStatus = ({ status }: { status?: 'error' | 'idle' | 'processing' | 'success' }) => {
  const statusColors = {
    error: 'bg-red-500 text-white',
    idle: 'bg-muted text-muted-foreground',
    processing: 'bg-orange-500 text-white',
    success: 'bg-green-500 text-white'
  }
  return status ? (
    <Badge className={cn('mr-2 font-normal', statusColors[status])} variant='secondary'>
      {status}
    </Badge>
  ) : null
}

NodeHeaderStatus.displayName = 'NodeHeaderStatus'
