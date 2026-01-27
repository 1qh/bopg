'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Slider } from '@a/ui/slider'
import { Switch } from '@a/ui/switch'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import Textarea from '~/components/textarea'
import { api } from '~/trpc/react'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { data, form, saveIndicator } = useSoloForm(),
    { llm } = api(),
    { data: llms } = useSuspenseQuery(llm.all.queryOptions()),
    off = useMemo(() => !form.watch('conversationSummary.enable'), [])
  return data?.language ? (
    <Form {...form}>
      {saveIndicator}
      <form className='space-y-5'>
        <FormField
          control={form.control}
          name='conversationSummary.enable'
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
            <div className='flex items-start gap-4'>
              <FormField
                control={form.control}
                name='conversationSummary.llm'
                render={({ field }) => (
                  <FormItem className='grow'>
                    <FormLabel>LLM *</FormLabel>
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
              <FormField
                control={form.control}
                name='conversationSummary.maxTokens'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='w-full'
                        disabled={field.disabled}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                        type='number'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='conversationSummary.temperature'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='w-44 space-y-1 *:text-center'>
                        <p className='text-sm font-medium'>Temperature</p>
                        <input
                          {...field}
                          className='w-48 outline-none'
                          max={1}
                          min={0}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                          step={0.05}
                          type='number'
                        />
                        <Slider
                          disabled={field.disabled}
                          max={1}
                          min={0}
                          onValueChange={([v]) => field.onChange(v)}
                          step={0.05}
                          value={[field.value ?? 0]}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='w-44 text-xs' />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='conversationSummary.systemPrompt'
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
          </>
        )}
      </form>
    </Form>
  ) : null
}

export default Page
