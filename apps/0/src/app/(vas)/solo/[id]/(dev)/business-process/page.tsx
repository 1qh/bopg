'use client'

import { Button } from '@a/ui/button'
import { Drawer, DrawerContent } from '@a/ui/drawer'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@a/ui/form'
import { startCase } from 'es-toolkit/string'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'

import Textarea from '~/components/textarea'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { form, saveIndicator } = useSoloForm(),
    [active, setActive] = useState<'conversationFlow' | 'guideline' | 'persona' | 'scenario' | undefined>(),
    [optimized, setOptimized] = useState<string>('')
  return (
    <Form {...form}>
      {saveIndicator}
      <form className='space-y-10 pt-2 [&_textarea]:min-h-24'>
        <FormField
          control={form.control}
          name='persona'
          render={({ field }) => (
            <FormItem>
              <div className='mb-2 flex justify-between'>
                <div>
                  <p>{startCase(field.name)}</p>
                  <FormDescription>Define agent role & behavior style</FormDescription>
                </div>
                <Button
                  disabled={!field.value?.trim().length}
                  onClick={() => setActive(field.name)}
                  type='button'
                  variant='outline'>
                  <Sparkles />
                  Optimize
                </Button>
              </div>
              <FormControl>
                <Textarea maxLength={20_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='conversationFlow'
          render={({ field }) => (
            <FormItem>
              <div className='mb-2 flex justify-between'>
                <div>
                  <p>{startCase(field.name)}</p>
                  <FormDescription>Outline the dialog steps the agent follows</FormDescription>
                </div>
                <Button
                  disabled={!field.value?.trim().length}
                  onClick={() => setActive(field.name)}
                  type='button'
                  variant='outline'>
                  <Sparkles />
                  Optimize
                </Button>
              </div>
              <FormControl>
                <Textarea maxLength={20_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='scenario'
          render={({ field }) => (
            <FormItem>
              <div className='mb-2 flex justify-between'>
                <div>
                  <p>{startCase(field.name)}</p>
                  <FormDescription>Handle exception cases that may occur during the flow</FormDescription>
                </div>
                <Button
                  disabled={!field.value?.trim().length}
                  onClick={() => setActive(field.name)}
                  type='button'
                  variant='outline'>
                  <Sparkles />
                  Optimize
                </Button>
              </div>
              <FormControl>
                <Textarea maxLength={20_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='guideline'
          render={({ field }) => (
            <FormItem>
              <div className='mb-2 flex justify-between'>
                <div>
                  <p>{startCase(field.name)}</p>
                  <FormDescription>Brief rules the agent must follow during conversation</FormDescription>
                </div>
                <Button
                  disabled={!field.value?.trim().length}
                  onClick={() => setActive(field.name)}
                  type='button'
                  variant='outline'>
                  <Sparkles />
                  Optimize
                </Button>
              </div>
              <FormControl>
                <Textarea maxLength={20_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <Drawer onOpenChange={() => setActive(undefined)} open={Boolean(active)}>
        <DrawerContent>
          <div className='flex gap-3 px-6'>
            <p className='text-xl font-semibold'>{startCase(active ?? '')}</p>
            <p className='grow' />
            {active ? (
              <>
                <Button
                  disabled={!optimized.length}
                  onClick={() => {
                    form.setValue(active, optimized, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                    setOptimized('')
                    setActive(undefined)
                  }}
                  type='button'
                  variant='outline'>
                  Apply
                </Button>
                <Button
                  disabled={!form.watch(active)?.length}
                  onClick={() => setOptimized(`This is an optimized version of your ${startCase(active)} prompt.`)}
                  type='button'>
                  Optimize
                </Button>
              </>
            ) : null}
          </div>
          <div className='grid max-h-300 min-h-96 grid-cols-[20fr_1fr_20fr] p-5'>
            <p className='overflow-auto rounded-xl border p-4 whitespace-pre-line'>{active ? form.watch(active) : ''}</p>
            <ArrowRight className='m-auto stroke-1' />
            <p className='overflow-auto rounded-xl border p-4 whitespace-pre-line'>
              {optimized.length > 0 ? optimized : `Optimized ${startCase(active ?? '')} prompt will be displayed here.`}
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </Form>
  )
}

export default Page
