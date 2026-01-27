'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import Flag from '@svgr-iconkit/flag-icons'
import { lang2flag } from 'constant'

import useSoloForm from '../use-solo-form'

const Update = () => {
  const { form, saveIndicator } = useSoloForm()
  return (
    <Form {...form}>
      {saveIndicator}
      <form className='mt-10 flex w-full items-end gap-4'>
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
                  <SelectTrigger className='w-full capitalize data-placeholder:normal-case' disabled={field.disabled}>
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
      </form>
    </Form>
  )
}

export default Update
