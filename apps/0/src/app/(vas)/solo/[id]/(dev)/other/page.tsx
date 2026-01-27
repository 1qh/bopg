'use client'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { startCase } from 'es-toolkit/string'

import Textarea from '~/components/textarea'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { form, saveIndicator } = useSoloForm()
  return (
    <Form {...form}>
      {saveIndicator}
      <form className='space-y-8 pt-4'>
        <FormField
          control={form.control}
          name='turnListeningTimeout'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <div className='space-y-1'>
                <FormLabel>{startCase(field.name)}</FormLabel>
                <FormDescription>
                  The maximum number of seconds the agent can listen for the each user utterance
                </FormDescription>
              </div>
              <FormMessage />
              <FormControl>
                <Input {...field} className='w-28' onChange={e => field.onChange(e.target.valueAsNumber)} type='number' />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='silenceEndCallTimeout'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <div className='space-y-1'>
                <FormLabel>{startCase(field.name)}</FormLabel>
                <FormDescription>The maximum number of turns since the user last spoke</FormDescription>
              </div>
              <FormMessage />
              <FormControl>
                <Input {...field} className='w-28' onChange={e => field.onChange(e.target.valueAsNumber)} type='number' />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='maxConversationDuration'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <div className='space-y-1'>
                <FormLabel>{startCase(field.name)}</FormLabel>
                <FormDescription>The maximum number of seconds that a conversation can last</FormDescription>
              </div>
              <FormMessage />
              <FormControl>
                <Input {...field} className='w-28' onChange={e => field.onChange(e.target.valueAsNumber)} type='number' />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='fallbackEndCallMessage'
          render={({ field }) => (
            <FormItem className='gap-1'>
              <FormLabel>{startCase(field.name)}</FormLabel>
              <FormDescription>
                The message agent will say when it can no longer handle the conversation. If empty, the agent will hang up
                without saying anything.
              </FormDescription>
              <FormControl>
                <Textarea className='mt-2 min-h-24' maxLength={20_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default Page
