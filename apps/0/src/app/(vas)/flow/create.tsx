'use client'

import { InsertFlowSchema } from '@a/db/schema'
import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import Flag from '@svgr-iconkit/flag-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lang2flag } from 'constant'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '~/components/input'
import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

const Create = () => {
  const [open, setOpen] = useState(false),
    { flow } = api(),
    form = useForm({
      defaultValues: { description: '' },
      mode: 'onChange',
      resolver: standardSchemaResolver(InsertFlowSchema)
    }),
    router = useRouter(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      flow.insert.mutationOptions({
        onError: err => {
          if (err.data?.code === 'UNAUTHORIZED') {
            toast.error('Log in to create')
            return
          }
          if (err.data?.code === 'CONFLICT') {
            form.setError('title', { message: 'Name already exists' })
            return
          }
          toast.error('Failed to create flow')
        },
        onSuccess: async data => {
          if (!Array.isArray(data) && data) router.push(`/flow/${data.id}`)
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(flow.pathFilter())
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
      <DialogContent className='gap-5'>
        <DialogTitle>New agent</DialogTitle>
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/strict-void-return */}
          <form className='flex flex-col gap-5' onSubmit={form.handleSubmit(d => mutate(d))}>
            <div className='flex gap-3'>
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
                name='ava'
                render={({ field }) => (
                  <FormItem>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className={cn('focus-visible:ring-0', field.value && '[&_svg]:hidden')}>
                          {field.value ? (
                            <Image
                              alt=''
                              className='-ml-7 size-13 min-w-13 translate-x-3.5'
                              height={24}
                              src={`/ava/${field.value}.svg`}
                              width={24}
                            />
                          ) : (
                            'Select an icon'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent align='center' className='my-1'>
                        <div className='flex w-94 flex-wrap gap-2.5 p-2'>
                          {Array.from({ length: 59 }, (_, i) => {
                            const value = String(i + 1).padStart(2, '0')
                            return (
                              <SelectItem
                                className={cn(
                                  'size-16 rounded-xl p-0 transition-all duration-500 hover:scale-110 active:scale-75 [&_svg]:hidden',
                                  field.value === value && 'ring-2 ring-offset-2'
                                )}
                                key={i}
                                value={value}>
                                <Image alt='' height={64} src={`/ava/${value}.svg`} width={64} />
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea className='min-h-24' maxLength={2000} {...field} placeholder={field.name} />
                  </FormControl>
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
