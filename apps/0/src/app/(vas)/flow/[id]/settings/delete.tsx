'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'

import DeleteDialog from '~/components/delete-dialog'
import { api } from '~/trpc/react'

const Delete = () => {
  const { id } = useParams<{ id: string }>(),
    router = useRouter(),
    { flow } = api(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      flow.delete.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(flow.pathFilter())
          router.push('/flow')
        }
      })
    )
  return <DeleteDialog isPending={isPending} onClick={() => mutate(id)} />
}

export default Delete
