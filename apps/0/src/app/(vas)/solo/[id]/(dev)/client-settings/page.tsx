'use client'

import { Form, FormControl, FormField, FormItem } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Fragment } from 'react'

import FormMessage from '~/components/form-message'
import PlusButton from '~/components/plus-button'
import TrashButton from '~/components/trash-button'
import useFieldArray from '~/use-field-array'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { editable, form, saveIndicator } = useSoloForm(),
    { append, fields, remove } = useFieldArray(form, 'customClientSettings')
  return (
    <Form {...form}>
      {saveIndicator}
      <form className='grid grid-cols-[10fr_10fr_1fr] place-items-stretch gap-3 pr-1'>
        <p className='pl-1'>Key</p>
        <p className='pl-1'>Value</p>
        {editable ? <PlusButton onClick={() => append({ key: '', value: '' })} /> : <p />}
        {fields.map((f, index) => (
          <Fragment key={f.id}>
            <FormField
              control={form.control}
              name={`customClientSettings.${index}.key`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='key' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`customClientSettings.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='value' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TrashButton onClick={() => remove(index)} />
          </Fragment>
        ))}
      </form>
    </Form>
  )
}

export default Page
