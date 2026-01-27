import { cn } from '@a/ui'

const TdLong = ({ text }: { text?: string }) => (
  <td className={cn('min-w-64 pr-3!', text && text.length > 200 && 'text-xs!')}>
    <p className='line-clamp-2'>{text}</p>
  </td>
)

export default TdLong
