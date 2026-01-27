import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { AlertCircle } from 'lucide-react'

import type { FlowError } from './types'

const Errors = ({ errors }: { errors: FlowError[] }) =>
  errors.length ? (
    <Popover>
      <PopoverTrigger asChild>
        <AlertCircle className='size-9 cursor-pointer rounded-md p-1.5 text-destructive hover:bg-muted' />
      </PopoverTrigger>
      <PopoverContent asChild className='mx-1 list-disc p-3 text-sm'>
        <ul className='pl-7'>
          {errors.map(e => (
            <li key={`${e.type}-${e.message}`}>{e.message}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  ) : null

export default Errors
