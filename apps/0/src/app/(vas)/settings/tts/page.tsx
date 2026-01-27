'use client'

import type { Control, FieldValues } from 'react-hook-form'

import { InsertTTSSchema, UpdateTTSSchema } from '@a/db/schema'
import { Button } from '@a/ui/button'
import { Form } from '@a/ui/form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { upperCase } from 'es-toolkit/string'
import { Save, Search } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import DeleteDialog from '~/components/delete-dialog'
import FieldInput from '~/components/field-input'
import FieldLanguage from '~/components/field-language'
import FieldSecret from '~/components/field-secret'
import FieldSelect from '~/components/field-select'
import FieldTags from '~/components/field-tags'
import FieldTextarea from '~/components/field-textarea'
import FormPopup from '~/components/form-popup'
import MyInput from '~/components/input'
import MinimalTable from '~/components/minimal-table'
import NoData from '~/components/no-data'
import Portal from '~/components/portal'
import TdLang from '~/components/td-lang'
import TdLong from '~/components/td-long'
import { api } from '~/trpc/react'

const Fields = <T extends FieldValues>(p: { control: Control<T> }) => (
  <>
    <FieldInput {...p} asterisk name={'name' satisfies Field} />
    <FieldInput {...p} asterisk name={'voice' satisfies Field} />
    <FieldTextarea {...p} name={'description' satisfies Field} />
    <FieldLanguage {...p} asterisk name={'language' satisfies Field} />
    <FieldInput {...p} asterisk name={'primaryURL' satisfies Field} placeholder='Primary URL' />
    <FieldInput {...p} name={'secondaryURL' satisfies Field} placeholder='Secondary URL' />
    <FieldTags {...p} name={'labels' satisfies Field} />
    <FieldSecret {...p} name={'secret' satisfies Field} />
    <FieldSelect
      {...p}
      labelTransformer={upperCase}
      name={'provider' satisfies Field}
      placeholder='Select a provider'
      values={['ai', 'modas']}
    />
  </>
)

interface ItemProps {
  defaultValues: typeof UpdateTTSSchema.infer
  index: number
}

const Item = ({ defaultValues, index }: ItemProps) => {
  const [open, setOpen] = useState(false),
    queryClient = useQueryClient(),
    { tts } = api(),
    { description, id, language, name, provider, voice } = defaultValues,
    form = useForm({ defaultValues, resolver: standardSchemaResolver(UpdateTTSSchema) }),
    update = useMutation(
      tts.update.mutationOptions({
        onError: e => toast.error(JSON.stringify(e.data, null, 2)),
        onSuccess: async () => {
          setOpen(false)
          await queryClient.invalidateQueries(tts.pathFilter())
          toast.success('TTS updated')
        }
      })
    ),
    rm = useMutation(
      tts.delete.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries(tts.pathFilter())
        }
      })
    )
  return (
    <FormPopup
      cells={
        <>
          <td className='w-10 text-center opacity-30'>{index}</td>
          <td>{name}</td>
          <TdLang language={language} />
          <TdLong text={description} />
          <td>{voice}</td>
          <td>{upperCase(provider)}</td>
        </>
      }
      onOpenChange={setOpen}
      open={open}
      title='Edit TTS'>
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

type Field = keyof Pick<
  typeof InsertTTSSchema.infer,
  'description' | 'labels' | 'language' | 'name' | 'primaryURL' | 'provider' | 'secondaryURL' | 'secret' | 'voice'
>

const Page = () => {
  const [q, setQ] = useQueryState('q', { defaultValue: '' }),
    [open, setOpen] = useState(false),
    queryClient = useQueryClient(),
    form = useForm({
      defaultValues: {
        description: '',
        labels: [],
        language: 'vietnamese',
        provider: 'ai',
        secondaryURL: '',
        secret: ''
      },
      resolver: standardSchemaResolver(InsertTTSSchema)
    }),
    { tts } = api(),
    { data } = useSuspenseQuery(tts.all.queryOptions()),
    { isPending, mutate } = useMutation(
      tts.insert.mutationOptions({
        onError: e => toast.error(JSON.stringify(e.data, null, 2)),
        onSuccess: async () => {
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(tts.pathFilter())
        }
      })
    ),
    ttss = data.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
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
        <FormPopup onOpenChange={setOpen} open={open} title='New TTS'>
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
      {ttss.length ? (
        <MinimalTable headers={['', 'name', 'language', 'description', 'voice', 'provider']}>
          {ttss.map((l, index) => (
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
