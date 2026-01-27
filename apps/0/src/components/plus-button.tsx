import { cn } from '@a/ui'
import { Plus } from 'lucide-react'

const PlusButton = ({ className, onClick }: { className?: string; onClick: () => void }) => (
  <Plus
    className={cn(
      'mx-auto size-7 rounded-full stroke-1 text-muted-foreground transition-all duration-300 hover:scale-150 hover:bg-muted hover:stroke-2 hover:p-1 hover:text-foreground active:scale-75',
      className
    )}
    onClick={onClick}
  />
)
export default PlusButton
