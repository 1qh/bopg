'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Switch } from '@a/ui/switch'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

import useSoloForm from '../../use-solo-form'

const Page = () => {
  const { form, saveIndicator } = useSoloForm(),
    { ke } = api(),
    { data: kes } = useSuspenseQuery(ke.all.queryOptions()),
    off = useMemo(() => !form.watch('knowledgeRetrievalSetting.enable'), [])
  return (
    <Form {...form}>
      {saveIndicator}
      <form>
        <FormField
          control={form.control}
          name='knowledgeRetrievalSetting.enable'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  className='absolute top-8 right-8 scale-150'
                  disabled={field.disabled}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {off ? null : (
          <>
            <p className='h-7' />
            <FormField
              control={form.control}
              name='knowledgeRetrievalSetting.ke'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge Retrieval Service</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full data-placeholder:normal-case' disabled={field.disabled}>
                        <SelectValue placeholder='Select a service' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kes.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className='h-4' />
            <FormField
              control={form.control}
              name='knowledgeRetrievalSetting.description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className='min-h-24' disabled={field.disabled} maxLength={20_000} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </form>
    </Form>
  )
}

export default Page
