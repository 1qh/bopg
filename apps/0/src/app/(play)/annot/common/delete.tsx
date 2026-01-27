'use client'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash } from 'lucide-react'

import { api } from '~/trpc/react'

const Delete = ({ id }: { id: number }) => {
  const { annot } = api(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      annot.delete.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(annot.pathFilter())
        }
      })
    )
  return (
    <Button className='text-destructive hover:text-destructive' onClick={() => mutate(id)} variant='ghost'>
      <Trash
        className={cn(
          'cursor-pointer rounded-md stroke-[1.2] transition-all duration-500',
          isPending
            ? 'animate-spin rounded-[100px] border border-foreground border-t-transparent text-transparent'
            : 'hover:bg-destructive/20 hover:text-destructive'
        )}
      />
      Delete
    </Button>
  )
}

export default Delete
