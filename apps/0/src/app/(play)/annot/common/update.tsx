'use client'

import { UpdateAnnotSchema } from '@a/db/schema'
import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@a/ui/select'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '~/components/input'
import InputTags from '~/components/input-tags'
import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

const Update = (defaultValues: typeof UpdateAnnotSchema.infer) => {
  const [open, setOpen] = useState(false),
    { annot } = api(),
    form = useForm({
      defaultValues,
      resolver: standardSchemaResolver(UpdateAnnotSchema)
    }),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      annot.update.mutationOptions({
        onSuccess: async () => {
          setOpen(false)
          await queryClient.invalidateQueries(annot.pathFilter())
          toast.success('Annot updated')
        }
      })
    )
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant='ghost'>
          <Pencil className='stroke-1' />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className='gap-5' onOpenAutoFocus={e => e.preventDefault()}>
        <DialogTitle>Edit Annot</DialogTitle>
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
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputTags {...field} placeholder={field.name} value={field.value ?? []} />
                  </FormControl>
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
                    <Textarea className='min-h-24' {...field} placeholder={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='ml-auto' disabled={isPending || !form.formState.isValid}>
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default Update
