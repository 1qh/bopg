'use client'

import type { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@a/ui'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@a/ui/dialog'
import { Plus } from 'lucide-react'

import Tr from './tr'
import Tutip from './tutip'

const FormPopup = ({
  cells,
  children,
  className,
  title,
  trigger,
  ...props
}: ComponentProps<typeof DialogPrimitive.Root> & {
  cells?: ReactNode
  className?: string
  title: string
  trigger?: ReactNode
}) => (
  <Dialog {...props}>
    <DialogTrigger asChild className='gap-2'>
      {trigger ??
        (cells ? (
          <Tr>{cells}</Tr>
        ) : (
          <Tutip openDelay={150} side='left' tooltip='Add'>
            <Plus className='size-9 cursor-pointer rounded-full border bg-blue-600! p-1.5 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-muted hover:stroke-2 active:scale-75' />
          </Tutip>
        ))}
    </DialogTrigger>
    <DialogContent
      className={cn('max-h-[calc(100vh-8px)]! overflow-y-auto p-4', className)}
      onInteractOutside={e => e.preventDefault()}
      onOpenAutoFocus={e => e.preventDefault()}>
      {title.length ? <DialogTitle className='mt-1.5 mb-2 ml-2'>{title}</DialogTitle> : null}
      {children}
    </DialogContent>
  </Dialog>
)

export default FormPopup
