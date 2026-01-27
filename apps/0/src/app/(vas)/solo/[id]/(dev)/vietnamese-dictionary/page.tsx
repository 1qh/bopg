'use client'

import { Checkbox } from '@a/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Fragment } from 'react'

import FormMessage from '~/components/form-message'
import H from '~/components/h'
import PlusButton from '~/components/plus-button'
import TrashButton from '~/components/trash-button'
import useFieldArray from '~/use-field-array'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { data, editable, form, saveIndicator } = useSoloForm(),
    { append, fields, remove } = useFieldArray(form, 'vietnameseDictionary')

  return data?.language === 'vietnamese' ? (
    <Form {...form}>
      {saveIndicator}
      <H className='border-t'>Vietnamese Spoken Dictionary</H>
      <p className='mb-5 text-sm text-muted-foreground'>
        This dictionary will apply pronunciation replacements to agent responses.
      </p>
      <form className='grid grid-cols-[10fr_10fr_2fr_1fr] place-items-stretch gap-3 pr-1'>
        <p className='pl-1'>Phrase</p>
        <p className='pl-1'>Pronunciation</p>
        <p className='text-center'>is Regex</p>
        {editable ? <PlusButton onClick={() => append({ isRegex: false, phrase: '', pronunciation: '' })} /> : <p />}
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={form.control}
              name={`vietnameseDictionary.${i}.phrase`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`vietnameseDictionary.${i}.pronunciation`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`vietnameseDictionary.${i}.isRegex`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className='m-auto transition-all duration-300 hover:scale-150 active:scale-75'
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editable ? <TrashButton onClick={() => remove(i)} /> : <p />}
          </Fragment>
        ))}
      </form>
    </Form>
  ) : null
}

export default Page
