'use client'

import type { InvalidateQueryFilters } from '@tanstack/react-query'
import type { z } from 'zod/v4'

import { UpdatePostSchema } from '@a/db/schema'
import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@a/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Textarea } from '@a/ui/textarea'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { api } from '~/trpc/react'

type UpdatePostProps = z.infer<typeof UpdatePostSchema>

const UpdatePost = (defaultValues: UpdatePostProps) => {
  const [open, setOpen] = useState(false),
    { post } = api(),
    form = useForm<UpdatePostProps>({
      defaultValues,
      resolver: standardSchemaResolver(UpdatePostSchema)
    }),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      post.update.mutationOptions({
        onError: err => {
          toast.error(err.data?.code === 'UNAUTHORIZED' ? 'You must be logged in to update post' : 'Failed to update post')
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries(post.pathFilter() as InvalidateQueryFilters)
          setOpen(false)
          toast.success('Post updated')
        }
      })
    )
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Pencil className='size-0 cursor-pointer rounded-md stroke-1 px-1 text-muted-foreground transition-all duration-500 group-hover:size-6 hover:scale-110 hover:bg-green-100 active:scale-75 dark:hover:bg-green-900' />
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={e => e.preventDefault()} showCloseButton={false}>
        <Form {...form}>
          <form className='relative' onSubmit={form.handleSubmit(data => mutate(data))}>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem className='mb-4'>
                  <FormDescription className='capitalize'>{field.name}</FormDescription>
                  <FormControl>
                    <Input {...field} />
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
                  <FormDescription className='capitalize'>{field.name}</FormDescription>
                  <FormControl>
                    <Textarea className='min-h-24 pb-11' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className={cn(
                'absolute right-1.5 bottom-1.5 transition-all duration-700',
                isPending &&
                  'animate-spin rounded-3xl border-2 border-foreground border-t-transparent text-foreground *:stroke-none focus-visible:border-t-transparent focus-visible:ring-0'
              )}
              disabled={isPending || !form.formState.isValid}
              size='icon'
              variant='outline'>
              <Check />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePost
