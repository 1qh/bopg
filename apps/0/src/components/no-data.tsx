import { Inbox } from 'lucide-react'

const NoData = () => (
  <div className='flex flex-col items-center tracking-tight text-muted-foreground/50'>
    <Inbox className='mt-3 size-24 stroke-[0.36]' />
    No data available
  </div>
)

export default NoData
