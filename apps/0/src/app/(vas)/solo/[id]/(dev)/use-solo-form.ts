'use client'

import { UpdateSoloSchema } from '@a/db/schema'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import authClient from '~/auth/client'
import useAutoSave from '~/autosave'
import { api } from '~/trpc/react'

const useSoloForm = () => {
  const queryClient = useQueryClient(),
    { data: session } = authClient.useSession(),
    editable = Boolean(session),
    { id } = useParams<{ id: string }>(),
    { solo } = api(),
    { data } = useSuspenseQuery(solo.byId.queryOptions(id, { enabled: typeof id === 'string' })),
    form = useForm({
      defaultValues: data,
      disabled: !editable,
      mode: 'onChange',
      resolver: standardSchemaResolver(UpdateSoloSchema)
    }),
    { isPending, mutate } = useMutation(
      solo.update.mutationOptions({
        onError: err => {
          console.error(err)
          if (err.data?.code === 'CONFLICT') {
            form.setError('title', { message: 'Name already exists' })
            return
          }
          toast.error('Failed to save. Please try again.')
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries(solo.pathFilter())
        }
      })
    ),
    saveIndicator = useAutoSave({ enable: editable, form, isPending, mutate })

  return { data, editable, form, saveIndicator }
}

export default useSoloForm
