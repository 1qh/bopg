'use client'

import { InsertSoloSchema } from '@a/db/schema'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import Flag from '@svgr-iconkit/flag-icons'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { lang2flag } from 'constant'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '~/components/input'
import { api } from '~/trpc/react'

const Create = () => {
  const [open, setOpen] = useState(false),
    { llm, solo } = api(),
    { data: llms } = useSuspenseQuery(llm.all.queryOptions()),
    form = useForm({
      mode: 'onChange',
      resolver: standardSchemaResolver(InsertSoloSchema)
    }),
    router = useRouter(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      solo.insert.mutationOptions({
        onError: err => {
          if (err.data?.code === 'UNAUTHORIZED') {
            toast.error('Log in to create')
            return
          }
          if (err.data?.code === 'CONFLICT') {
            form.setError('title', { message: 'Name already exists' })
            return
          }
          toast.error('Failed to create solo')
        },
        onSuccess: async data => {
          if (!Array.isArray(data) && data) router.push(`/solo/${data.id}`)
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(solo.pathFilter())
        }
      })
    )
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className='group fixed top-4 right-4 z-2 h-10 scale-100 overflow-hidden rounded-full border border-muted-foreground font-light capitalize shadow-xl drop-shadow-xl duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[-110%] before:rounded-full before:bg-background before:duration-500 hover:top-6 hover:right-10 hover:scale-125 hover:gap-0.5 hover:font-medium hover:text-foreground hover:shadow-2xl hover:before:translate-x-0 active:scale-75'>
          <Plus className='size-5 text-background! transition-all duration-500 group-hover:text-foreground!' />
          new agent
          <p className='w-0' />
        </Button>
      </DialogTrigger>
      <DialogContent className='gap-5 sm:max-w-2xl'>
        <DialogTitle>New agent</DialogTitle>
        <Form {...form}>
          <form
            className='flex gap-3'
            // eslint-disable-next-line @typescript-eslint/strict-void-return
            onSubmit={form.handleSubmit(data => {
              const { language } = data
              if (!language) return
              const llmId = llms.toReversed().find(l => l.languages.includes(language))?.id
              if (!llmId) {
                toast.error(`No LLMs available for ${language}`)
                return
              }
              mutate({
                ...data,
                conversationSummary: {
                  enable: false,
                  llm: llmId,
                  maxTokens: 500,
                  systemPrompt:
                    'You are an advanced language model tasked with summarizing call conversations between Bot/Agent and Customers. Given a transcript of a call conversation, your job is to provide a concise summary that captures the main points and key outcomes of this interaction. Use a maximum of 3 sentences.',
                  temperature: 0
                },
                dataCollection: {
                  llm: llmId,
                  systemPrompt: '',
                  temperature: 0
                },
                interruption: {
                  enable: false,
                  llm: llmId,
                  method: 'immediate',
                  phrases: [],
                  silence: 10,
                  systemPrompt: ''
                },
                llm: llmId
              })
            })}>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem className='grow'>
                  <FormControl>
                    <Input maxLength={50} {...field} placeholder={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='language'
              render={({ field }) => (
                <FormItem className='relative'>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full capitalize data-placeholder:normal-case'>
                        <SelectValue placeholder='Select a language' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(lang2flag).map(([lang, flag]) => (
                        <SelectItem className='capitalize' key={lang} value={lang}>
                          <Flag className='size-5 rounded-full' name={flag} variant='square' />
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='ml-auto' disabled={isPending || !form.formState.isValid}>
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
export default Create
