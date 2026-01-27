'use client'

import type { Control, FieldValues } from 'react-hook-form'

import { InsertKESchema, UpdateKESchema } from '@a/db/schema'
import { Button } from '@a/ui/button'
import { Form } from '@a/ui/form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Save, Search } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import DeleteDialog from '~/components/delete-dialog'
import FieldInput from '~/components/field-input'
import FieldSecret from '~/components/field-secret'
import FieldTextarea from '~/components/field-textarea'
import FormPopup from '~/components/form-popup'
import MyInput from '~/components/input'
import MinimalTable from '~/components/minimal-table'
import NoData from '~/components/no-data'
import Portal from '~/components/portal'
import TdLong from '~/components/td-long'
import { api } from '~/trpc/react'

const Fields = <T extends FieldValues>(p: { control: Control<T> }) => (
  <>
    <FieldInput {...p} asterisk name={'model' satisfies Field} />
    <FieldInput {...p} asterisk name={'url' satisfies Field} placeholder='URL' />
    <FieldSecret {...p} name={'secret' satisfies Field} />
    <FieldTextarea {...p} name={'description' satisfies Field} />
  </>
)

interface ItemProps {
  defaultValues: typeof UpdateKESchema.infer
  index: number
}

const Item = ({ defaultValues, index }: ItemProps) => {
  const [open, setOpen] = useState(false),
    queryClient = useQueryClient(),
    { ke } = api(),
    { description, id, model, url } = defaultValues,
    form = useForm({ defaultValues, resolver: standardSchemaResolver(UpdateKESchema) }),
    rm = useMutation(
      ke.delete.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(ke.pathFilter())
        }
      })
    ),
    update = useMutation(
      ke.update.mutationOptions({
        onError: e => toast.error(JSON.stringify(e.data, null, 2)),
        onSuccess: async () => {
          setOpen(false)
          await queryClient.invalidateQueries(ke.pathFilter())
          toast.success('KE updated')
        }
      })
    )
  return (
    <FormPopup
      cells={
        <>
          <td className='w-10 text-center opacity-30'>{index}</td>
          <td>{model}</td>
          <TdLong text={description} />
          <td>{url}</td>
        </>
      }
      onOpenChange={setOpen}
      open={open}
      title='Edit KE'>
      <Form {...form}>
        <form
          className='space-y-5'
          id='up'
          onSubmit={() => {
            form.handleSubmit(d => update.mutate(d))
          }}>
          <Fields control={form.control} />
        </form>
      </Form>
      <div className='flex gap-2 *:flex-1'>
        <DeleteDialog isPending={rm.isPending} onClick={() => rm.mutate(id)} />
        <Button disabled={update.isPending || !form.formState.isValid} form='up'>
          <Save />
          Save
        </Button>
      </div>
    </FormPopup>
  )
}

type Field = keyof Pick<typeof InsertKESchema.infer, 'description' | 'model' | 'secret' | 'url'>

const Page = () => {
  const [q, setQ] = useQueryState('q', { defaultValue: '' }),
    [open, setOpen] = useState(false),
    queryClient = useQueryClient(),
    form = useForm({
      defaultValues: {
        description: '',
        secret: ''
      },
      resolver: standardSchemaResolver(InsertKESchema)
    }),
    { ke } = api(),
    { data } = useSuspenseQuery(ke.all.queryOptions()),
    kes = data.filter(p => p.model.toLowerCase().includes(q.toLowerCase())),
    { isPending, mutate } = useMutation(
      ke.insert.mutationOptions({
        onError: e => toast.error(JSON.stringify(e.data, null, 2)),
        onSuccess: async () => {
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(ke.pathFilter())
        }
      })
    )
  return (
    <>
      <Portal id='top-nav'>
        <MyInput
          className='grow'
          disabled={!data.length}
          Icon={Search}
          inputClassName='rounded-full'
          onChange={e => {
            setQ(e.target.value)
          }}
          placeholder='Search'
          value={q}
        />
        <FormPopup onOpenChange={setOpen} open={open} title='New KE'>
          <Form {...form}>
            <form
              className='flex flex-col gap-5'
              // eslint-disable-next-line @typescript-eslint/strict-void-return
              onSubmit={form.handleSubmit(d => mutate(d))}>
              <Fields control={form.control} />
              <Button className='w-full' disabled={isPending || !form.formState.isValid}>
                Create
              </Button>
            </form>
          </Form>
        </FormPopup>
      </Portal>
      {kes.length ? (
        <MinimalTable headers={['', 'model', 'description', 'URL']}>
          {kes.map((l, index) => (
            <Item defaultValues={l} index={index + 1} key={l.id} />
          ))}
        </MinimalTable>
      ) : (
        <NoData />
      )}
    </>
  )
}

export default Page
