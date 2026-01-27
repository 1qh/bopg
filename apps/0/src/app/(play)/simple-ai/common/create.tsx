'use client'

import type { LucideIcon } from 'lucide-react'

import { InsertSimpleAiSchema } from '@a/db/schema'
import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@a/ui/select'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startCase } from 'es-toolkit/string'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '~/components/input'
import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

interface CreateProps {
  buttonText: string
  className?: string
  clone?: (typeof InsertSimpleAiSchema.infer)['content']
  Icon?: LucideIcon
}

const Create = ({ buttonText, className, clone, Icon = Plus }: CreateProps) => {
  const [open, setOpen] = useState(false),
    { simpleAi } = api(),
    form = useForm({
      defaultValues: {
        content: clone ?? { edges: [], nodes: [] },
        description: '',
        title: clone?.template ? `Copy of ${startCase(clone.template)}` : ''
      },
      resolver: standardSchemaResolver(InsertSimpleAiSchema)
    }),
    router = useRouter(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      simpleAi.insert.mutationOptions({
        onError: err => toast.error(err.data?.code === 'UNAUTHORIZED' ? 'Log in to create' : 'Failed to create'),
        onSuccess: async data => {
          if (!Array.isArray(data) && data && clone) {
            toast.success('Agent created successfully')
            router.push(`/simple-ai/${data.id}`)
          }
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(simpleAi.pathFilter())
        }
      })
    )
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'group fixed top-4 right-4 h-10 scale-100 overflow-hidden rounded-full border border-muted-foreground font-light capitalize shadow-xl drop-shadow-xl duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[-110%] before:rounded-full before:bg-background before:duration-500 hover:top-6 hover:right-10 hover:scale-125 hover:font-medium hover:text-foreground hover:shadow-2xl hover:before:translate-x-0 active:scale-75',
            className
          )}>
          <Icon className='size-5 text-background! transition-all duration-500 group-hover:text-foreground!' />
          {buttonText}
          <p className='w-0' />
        </Button>
      </DialogTrigger>
      <DialogContent className='gap-5'>
        <DialogTitle>New Flow</DialogTitle>
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
                      <Input {...field} placeholder={field.name} />
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
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea className='min-h-24' {...field} placeholder={field.name} />
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
