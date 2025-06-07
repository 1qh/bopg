import { Button } from '@a/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { AlertCircle } from 'lucide-react'

import type { WorkflowError } from './workflow'

export const ErrorIndicator = ({ errors }: { errors: WorkflowError[] }) =>
  errors.length ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button className='text-red-500' size='icon' variant='ghost'>
          <AlertCircle className='h-5 w-5' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='center' className='mt-4 mr-4 w-80'>
        <div className='space-y-2'>
          <h4 className='font-medium'>Workflow Errors</h4>
          <div className='space-y-1'>
            {errors.map(error => (
              <div className='text-sm text-red-500' key={`${error.type}-${error.message}`}>
                {error.message}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ) : null
