'use client'

import { cn } from '@a/ui'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { Editor } from '@monaco-editor/react'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { form, saveIndicator } = useSoloForm()
  return (
    <Form {...form}>
      {saveIndicator}
      <form>
        <FormField
          control={form.control}
          name='initVariablesLuaScript'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Editor
                  className={cn(
                    'overflow-hidden rounded-lg border bg-background pt-4 shadow-xs',
                    field.disabled && 'pointer-events-none opacity-70'
                  )}
                  defaultLanguage='lua'
                  height='calc(100vh - 160px)'
                  onChange={field.onChange}
                  options={{ readOnly: field.disabled }}
                  value={field.value}
                />
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
