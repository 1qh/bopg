'use client'

import { UpdateBlogSchema } from '@a/db/schema'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Spinner } from '@a/ui/spinner'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '~/components/input'
import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

const Update = (defaultValues: typeof UpdateBlogSchema.infer) => {
  const [open, setOpen] = useState(false),
    { blog } = api(),
    form = useForm({
      defaultValues,
      resolver: standardSchemaResolver(UpdateBlogSchema)
    }),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      blog.update.mutationOptions({
        onError: err => toast.error(err.data?.code === 'UNAUTHORIZED' ? 'Log in to update' : 'Failed to update'),
        onSuccess: async () => {
          setOpen(false)
          toast.success('Blog updated')
          await queryClient.invalidateQueries(blog.pathFilter())
        }
      })
    )
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Pencil className='hidden size-10 rounded-lg stroke-1 p-1.5 group-hover:block hover:bg-muted' />
      </DialogTrigger>
      <DialogContent
        className='rounded-xl border-none p-1.5'
        onOpenAutoFocus={e => e.preventDefault()}
        showCloseButton={false}>
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/strict-void-return */}
          <form className='relative flex flex-col gap-3' onSubmit={form.handleSubmit(d => mutate(d))}>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} inputClassName='focus-visible:border-none' placeholder='Title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea className='min-h-24 border-none' {...field} placeholder='Content' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPending ? (
              <Spinner className='absolute right-0 bottom-0 size-9' />
            ) : (
              <Button
                className='absolute -right-1 -bottom-1 rounded-xl'
                disabled={!form.formState.isValid}
                size='icon'
                variant='outline'>
                <Check className='mt-0.5 text-green-500' />
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default Update
