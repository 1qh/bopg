'use client'

import type { InvalidateQueryFilters } from '@tanstack/react-query'
import type z from 'zod/v4'

import { InsertPostSchema } from '@a/db/schema'
import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Textarea } from '@a/ui/textarea'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { api } from '~/trpc/react'

const CreatePost = () => {
  const { post } = api(),
    form = useForm<z.infer<typeof InsertPostSchema>>({
      defaultValues: { content: '', title: '' },
      resolver: standardSchemaResolver(InsertPostSchema)
    }),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      post.insert.mutationOptions({
        onError: err => {
          toast.error(err.data?.code === 'UNAUTHORIZED' ? 'You must be logged in to post' : 'Failed to create post')
        },
        onSuccess: async () => {
          form.reset()
          await queryClient.invalidateQueries(post.pathFilter() as InvalidateQueryFilters)
        }
      })
    )
  return (
    <Form {...form}>
      <form className='relative mt-2 space-y-2.5' onSubmit={form.handleSubmit(data => mutate(data))}>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem className='grow'>
              <FormControl>
                <Input {...field} className='placeholder:capitalize' placeholder={field.name} />
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
                <Textarea className='min-h-24 pb-11 placeholder:capitalize' {...field} placeholder={field.name} />
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
          <Send />
        </Button>
      </form>
    </Form>
  )
}
export default CreatePost
