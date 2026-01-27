'use client'

import { UpdateFlowSchema } from '@a/db/schema'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Switch } from '@a/ui/switch'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Fragment } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import useAutoSave from '~/autosave'
import PlusButton from '~/components/plus-button'
import TrashButton from '~/components/trash-button'
import { api } from '~/trpc/react'

const Page = () => {
  const queryClient = useQueryClient(),
    { id } = useParams<{ id: string }>(),
    { flow } = api(),
    { data: defaultValues } = useSuspenseQuery(flow.byId.queryOptions(id, { enabled: typeof id === 'string' })),
    { isPending, mutate } = useMutation(
      flow.update.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(flow.pathFilter())
        }
      })
    ),
    form = useForm({
      defaultValues,
      mode: 'onChange',
      resolver: standardSchemaResolver(UpdateFlowSchema)
    }),
    { append, fields, remove } = useFieldArray({ control: form.control, name: 'variables' })

  return (
    <Form {...form}>
      {useAutoSave({ form, isPending, mutate })}
      <form className='grid grid-cols-[4fr_4fr_1fr_1fr_0.5fr] place-items-stretch gap-2 pr-2'>
        <p className='pl-1.5'>Name</p>
        <p className='pl-1.5'>Value</p>
        <p>Masking</p>
        <p>Sensitive</p>
        <PlusButton onClick={() => append({ masking: false, name: '', sensitive: false, value: '' })} />
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={form.control}
              name={`variables.${i}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`variables.${i}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Value' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`variables.${i}.masking`}
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <Switch className='mx-auto' {...field} checked={value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`variables.${i}.sensitive`}
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <Switch className='mx-auto' {...field} checked={value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TrashButton onClick={() => remove(i)} />
          </Fragment>
        ))}
      </form>
    </Form>
  )
}

export default Page
