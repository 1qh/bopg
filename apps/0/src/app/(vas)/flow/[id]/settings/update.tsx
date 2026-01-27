'use client'

import { UpdateFlowSchema } from '@a/db/schema'
import { cn } from '@a/ui'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Textarea } from '@a/ui/textarea'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import Flag from '@svgr-iconkit/flag-icons'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { lang2flag } from 'constant'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Select as SelectPrimitive } from 'radix-ui'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import useAutoSave from '~/autosave'
import { api } from '~/trpc/react'

const Update = () => {
  const queryClient = useQueryClient(),
    { id } = useParams<{ id: string }>(),
    { flow } = api(),
    { data: defaultValues } = useSuspenseQuery(flow.byId.queryOptions(id, { enabled: typeof id === 'string' })),
    form = useForm({
      defaultValues,
      mode: 'onChange',
      resolver: standardSchemaResolver(UpdateFlowSchema)
    }),
    { isPending, mutate } = useMutation(
      flow.update.mutationOptions({
        onError: err => {
          if (err.data?.code === 'UNAUTHORIZED') {
            toast.error('Log in to update')
            return
          }
          if (err.data?.code === 'CONFLICT') {
            form.setError('title', { message: 'Name already exists' })
            return
          }
          toast.error('Failed to save. Please try again.')
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries(flow.pathFilter())
        }
      })
    )
  return (
    <Form {...form}>
      {useAutoSave({ form, isPending, mutate })}
      <form className='space-y-5'>
        <div className='flex items-end gap-3'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='grow'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input maxLength={50} {...field} />
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
          <FormField
            control={form.control}
            name='ava'
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectPrimitive.Trigger className='w-fit'>
                      <Image
                        alt=''
                        className='size-full max-w-24'
                        height={24}
                        src={`/ava/${field.value}.svg`}
                        width={24}
                      />
                    </SelectPrimitive.Trigger>
                  </FormControl>
                  <SelectContent>
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
              <FormLabel className='capitalize'>{field.name}</FormLabel>
              <FormControl>
                <Textarea className='min-h-24' maxLength={2000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default Update
