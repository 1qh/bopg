'use client'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { useSuspenseQuery } from '@tanstack/react-query'

import { api } from '~/trpc/react'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { data, form, saveIndicator } = useSoloForm(),
    { tts } = api(),
    { data: ttss } = useSuspenseQuery(tts.all.queryOptions())
  return data?.language ? (
    <Form {...form}>
      {saveIndicator}
      <form>
        <FormField
          control={form.control}
          name='voice'
          render={({ field }) => (
            <FormItem className='flex items-end justify-between'>
              <p>Select the voice for this agent</p>
              <FormMessage />
              <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                <FormControl>
                  <SelectTrigger className='data-placeholder:normal-case' disabled={field.disabled}>
                    <SelectValue placeholder='Select a voice' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ttss
                    .filter(v => v.language === data.language)
                    .map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.voice}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </form>
    </Form>
  ) : null
}

export default Page
