'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Switch } from '@a/ui/switch'
import { useSuspenseQuery } from '@tanstack/react-query'
import { interruptionMethods } from 'constant'
import { Lightbulb } from 'lucide-react'
import { useMemo } from 'react'

import InputTags from '~/components/input-tags'
import Textarea from '~/components/textarea'
import Tutip from '~/components/tutip'
import { api } from '~/trpc/react'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { data, form, saveIndicator } = useSoloForm(),
    { llm } = api(),
    { data: llms } = useSuspenseQuery(llm.all.queryOptions()),
    off = useMemo(() => !form.watch('interruption.enable'), [])
  return data?.language ? (
    <Form {...form}>
      {saveIndicator}
      <form className='space-y-5'>
        <FormField
          control={form.control}
          name='interruption.enable'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  className='absolute top-12 right-3 scale-150'
                  disabled={field.disabled}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {off ? null : (
          <>
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='interruption.method'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger
                          className='w-full capitalize data-placeholder:normal-case'
                          disabled={field.disabled}>
                          <SelectValue placeholder='Select a Method' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interruptionMethods.map(v => (
                          <SelectItem className='capitalize' key={v} value={v}>
                            {v} interruption
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
                name='interruption.silence'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Silence Time</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='w-full'
                        disabled={field.disabled}
                        min={0}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                        step={0.1}
                        type='number'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='interruption.llm'
                render={({ field }) => (
                  <FormItem className='grow'>
                    <FormLabel className='uppercase'>LLM *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger className='w-full data-placeholder:normal-case' disabled={field.disabled}>
                          <SelectValue placeholder='Select an LLM' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {llms
                          .filter(l => l.languages.includes(data.language))
                          .map(v => (
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
            </div>
            <FormField
              control={form.control}
              name='interruption.systemPrompt'
              render={({ field }) => (
                <FormItem className='grow'>
                  <FormLabel>System Prompt *</FormLabel>
                  <FormControl>
                    <Textarea className='min-h-28' disabled={field.disabled} maxLength={20_000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='interruption.phrases'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interrupt Phrases</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <InputTags {...field} disabled={field.disabled} value={field.value as string[]} />
                      <Tutip openDelay={150} side='right' tooltip='press Comma or Enter to add a tag'>
                        <Lightbulb className='absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-full stroke-1 p-2 transition-all duration-300 hover:scale-110 hover:bg-muted hover:stroke-2' />
                      </Tutip>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </form>
    </Form>
  ) : null
}

export default Page
