'use client'

import { Spinner } from '@a/ui/spinner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '~/trpc/react'

const Delete = ({ id }: { id: number }) => {
  const { blog } = api(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      blog.delete.mutationOptions({
        onError: err => toast.error(err.data?.code === 'UNAUTHORIZED' ? 'Log in to delete' : 'Failed to delete'),
        onSuccess: async () => {
          await queryClient.invalidateQueries(blog.pathFilter())
        }
      })
    )
  return isPending ? (
    <Spinner className='size-10' />
  ) : (
    <Trash
      className='hidden size-10 rounded-lg stroke-1 p-1.5 group-hover:block hover:bg-destructive/10 hover:text-destructive'
      onClick={() => mutate(id)}
    />
  )
}

export default Delete
