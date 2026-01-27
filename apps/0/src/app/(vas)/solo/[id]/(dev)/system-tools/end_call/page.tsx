'use client'

import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Switch } from '@a/ui/switch'
import { endCallInstruction } from 'constant'

import Textarea from '~/components/textarea'

import useSoloForm from '../../use-solo-form'

const Page = () => {
  const { data, form, saveIndicator } = useSoloForm()
  return (
    <>
      <Switch checked className='absolute top-8 right-8 scale-150' disabled />
      <Form {...form}>
        {saveIndicator}
        <form className='mt-7'>
          <FormField
            control={form.control}
            name='endCallInstruction'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-end justify-between'>
                  <div>
                    <p>Instruction *</p>
                    <FormDescription>
                      This instruction will be used as LLM prompt to when End Call tool is triggered
                    </FormDescription>
                  </div>
                  {data?.language && ['english', 'japanese', 'vietnamese'].includes(data.language) ? (
                    <button
                      className='text-sm text-blue-500 hover:underline disabled:hidden'
                      disabled={field.disabled}
                      onClick={() => field.onChange(endCallInstruction[data.language])}
                      type='button'>
                      Set default instruction
                    </button>
                  ) : null}
                </div>
                <FormControl>
                  <Textarea className='min-h-24' maxLength={20_000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  )
}

export default Page
