'use client'

import { Form, FormControl, FormField, FormItem } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Fragment } from 'react'

import FormMessage from '~/components/form-message'
import PlusButton from '~/components/plus-button'
import TrashButton from '~/components/trash-button'
import { api } from '~/trpc/react'
import useFieldArray from '~/use-field-array'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { editable, form, saveIndicator } = useSoloForm(),
    { llm } = api(),
    { data: pbxVariables } = useSuspenseQuery(llm.all.queryOptions()),
    { append, fields, remove } = useFieldArray(form, 'callCenterSettings')
  return (
    <Form {...form}>
      {saveIndicator}
      <form className='grid grid-cols-[10fr_10fr_1fr] place-items-stretch gap-3 pr-1'>
        <p className='pl-1'>Key</p>
        <p className='pl-1'>Value</p>
        {editable ? <PlusButton onClick={() => append({ key: '', value: '' })} /> : <p />}
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={form.control}
              name={`callCenterSettings.${i}.key`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className='w-full data-placeholder:normal-case'>
                        <SelectValue placeholder='key' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pbxVariables.map(v => (
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
              name={`callCenterSettings.${i}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='value' {...field} />
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
  )
}

export default Page
