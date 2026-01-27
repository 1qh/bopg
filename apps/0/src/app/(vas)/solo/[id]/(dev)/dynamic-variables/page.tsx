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
    { append, fields, remove } = useFieldArray(form, 'dynamicVariables')
  return (
    <Form {...form}>
      {saveIndicator}
      <form className='grid grid-cols-[5fr_5fr_8fr_1fr] place-items-stretch gap-3 pr-1'>
        <p className='pl-1'>Name</p>
        <p className='pl-1'>Value</p>
        <p className='pl-1'>Description</p>
        {editable ? <PlusButton onClick={() => append({ description: '', name: '', value: '' })} /> : <p />}
        {fields.map((f, index) => (
          <Fragment key={f.id}>
            <FormField
              control={form.control}
              name={`dynamicVariables.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dynamicVariables.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='value' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dynamicVariables.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editable ? <TrashButton onClick={() => remove(index)} /> : <p />}
          </Fragment>
        ))}
      </form>
    </Form>
  )
}

export default Page
