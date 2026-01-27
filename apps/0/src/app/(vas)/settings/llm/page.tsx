'use client'

import type { Control, FieldValues } from 'react-hook-form'

import { InsertLLMSchema, UpdateLLMSchema } from '@a/db/schema'
import { Button } from '@a/ui/button'
import { Form } from '@a/ui/form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import Flag from '@svgr-iconkit/flag-icons'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { lang2flag } from 'constant'
import { upperCase } from 'es-toolkit/string'
import { Save, Search } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import DeleteDialog from '~/components/delete-dialog'
import FieldCheckboxes from '~/components/field-checkboxes'
import FieldInput from '~/components/field-input'
import FieldSelect from '~/components/field-select'
import FormPopup from '~/components/form-popup'
import MyInput from '~/components/input'
import MinimalTable from '~/components/minimal-table'
import NoData from '~/components/no-data'
import Portal from '~/components/portal'
import { api } from '~/trpc/react'

const Fields = <T extends FieldValues>(p: { control: Control<T> }) => (
  <>
    <FieldInput {...p} asterisk name={'name' satisfies Field} />
    <FieldInput {...p} asterisk name={'model' satisfies Field} />
    <FieldInput {...p} asterisk name={'url' satisfies Field} placeholder='URL' />
    <FieldInput {...p} name={'secret' satisfies Field} />
    <FieldSelect
      {...p}
      labelTransformer={upperCase}
      name={'provider' satisfies Field}
      placeholder='Select a provider'
      values={['ai', 'modas']}
    />
    <FieldCheckboxes {...p} className='-mt-1' name={'languages' satisfies Field} options={Object.keys(lang2flag)} />
  </>
)

interface ItemProps {
  defaultValues: typeof UpdateLLMSchema.infer
  index: number
}

const Item = ({ defaultValues, index }: ItemProps) => {
  const [open, setOpen] = useState(false),
    queryClient = useQueryClient(),
    { llm } = api(),
    { id, languages, model, name, url } = defaultValues,
    form = useForm({ defaultValues, resolver: standardSchemaResolver(UpdateLLMSchema) }),
    rm = useMutation(
      llm.delete.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(llm.pathFilter())
        }
      })
    ),
    update = useMutation(
      llm.update.mutationOptions({
        onError: e => toast.error(JSON.stringify(e.data, null, 2)),
        onSuccess: async () => {
          setOpen(false)
          await queryClient.invalidateQueries(llm.pathFilter())
          toast.success('LLM updated')
        }
      })
    )
  return (
    <FormPopup
      cells={
        <>
          <td className='w-10 text-center opacity-30'>{index}</td>
          <td>{name}</td>
          <td>{model}</td>
          <td className='flex gap-1'>
            {languages.map(l => (
              <Flag
                className='size-6 rounded-full shadow-sm drop-shadow-sm'
                key={l}
                name={lang2flag[l]}
                variant='square'
              />
            ))}
          </td>
          <td>{url}</td>
        </>
      }
      onOpenChange={setOpen}
      open={open}
      title='Edit LLM'>
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

type Field = keyof Pick<typeof InsertLLMSchema.infer, 'languages' | 'model' | 'name' | 'provider' | 'secret' | 'url'>

const Page = () => {
  const [q, setQ] = useQueryState('q', { defaultValue: '' }),
    [open, setOpen] = useState(false),
    queryClient = useQueryClient(),
    form = useForm({
      defaultValues: {
        languages: ['english'],
        provider: 'ai',
        secret: ''
      },
      resolver: standardSchemaResolver(InsertLLMSchema)
    }),
    { llm } = api(),
    { data } = useSuspenseQuery(llm.all.queryOptions()),
    llms = data.filter(p => p.name.toLowerCase().includes(q.toLowerCase())),
    { isPending, mutate } = useMutation(
      llm.insert.mutationOptions({
        onError: e => toast.error(JSON.stringify(e.data, null, 2)),
        onSuccess: async () => {
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(llm.pathFilter())
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
        <FormPopup onOpenChange={setOpen} open={open} title='New LLM'>
          <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/strict-void-return */}
            <form className='flex flex-col gap-5' onSubmit={form.handleSubmit(d => mutate(d))}>
              <Fields control={form.control} />
              <Button className='w-full' disabled={isPending || !form.formState.isValid}>
                Create
              </Button>
            </form>
          </Form>
        </FormPopup>
      </Portal>
      {llms.length ? (
        <MinimalTable headers={['', 'name', 'model', 'languages', 'url']}>
          {llms.map((l, index) => (
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
