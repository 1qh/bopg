'use client'

import type { InvalidateQueryFilters } from '@tanstack/react-query'

import { cn } from '@a/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '~/trpc/react'

const DeletePost = ({ id }: { id: number }) => {
  const { post } = api(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      post.delete.mutationOptions({
        onError: err => {
          toast.error(
            err.data?.code === 'UNAUTHORIZED' ? 'You must be logged in to delete a post' : 'Failed to delete post'
          )
        },
        onSuccess: async () => queryClient.invalidateQueries(post.pathFilter() as InvalidateQueryFilters)
      })
    )
  return (
    <Trash
      className={cn(
        'size-0 cursor-pointer rounded-md stroke-1 px-1 text-muted-foreground transition-all duration-500 group-hover:size-6 hover:scale-110 active:scale-75',
        isPending
          ? 'size-6 animate-spin rounded-[100px] border border-foreground border-t-transparent text-transparent'
          : 'hover:bg-destructive/20 hover:text-destructive'
      )}
      onClick={() => mutate(id)}
    />
  )
}

export default DeletePost
