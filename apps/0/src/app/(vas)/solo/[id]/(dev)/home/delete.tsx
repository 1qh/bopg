'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'

import DeleteDialog from '~/components/delete-dialog'
import { api } from '~/trpc/react'

const Delete = ({ disabled = false }: { disabled?: boolean }) => {
  const { id } = useParams<{ id: string }>(),
    router = useRouter(),
    { solo } = api(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      solo.delete.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(solo.pathFilter())
          router.push('/solo')
        }
      })
    )
  return <DeleteDialog disabled={disabled} isPending={isPending} onClick={() => mutate(id)} />
}

export default Delete
