'use client'
import { InsertBlogSchema } from '@a/db/schema'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Spinner } from '@a/ui/spinner'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '~/components/input'
import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

const Create = () => {
  const [open, setOpen] = useState(false),
    { blog } = api(),
    form = useForm({
      defaultValues: { content: '', title: '' },
      resolver: standardSchemaResolver(InsertBlogSchema)
    }),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      blog.insert.mutationOptions({
        onError: err => toast.error(err.data?.code === 'UNAUTHORIZED' ? 'Log in to create' : 'Failed to create'),
        onSuccess: async () => {
          setOpen(false)
          form.reset()
          await queryClient.invalidateQueries(blog.pathFilter())
        }
      })
    )
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Plus className='fixed top-2 right-2 size-10 rounded-full stroke-1 group-hover:block hover:bg-muted' />
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
            ) : form.formState.isValid ? (
              <Button className='absolute -right-1 -bottom-1 rounded-xl' size='icon' variant='outline'>
                <Send />
              </Button>
            ) : null}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default Create
