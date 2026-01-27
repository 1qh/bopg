import { cn } from '@a/ui'
import { Trash } from 'lucide-react'

const TrashButton = ({ className, onClick }: { className?: string; onClick: () => void }) => (
  <Trash
    className={cn(
      'mx-auto size-9 rounded-lg stroke-1 p-1.5 transition-all duration-300 hover:scale-110 hover:bg-destructive/20 hover:stroke-2 hover:text-destructive active:scale-75',
      className
    )}
    onClick={onClick}
  />
)
export default TrashButton
