'use client'

import { Form, FormControl, FormDescription, FormField, FormItem } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Switch } from '@a/ui/switch'
import { transferToOperatorInstruction } from 'constant'
import { Fragment, useMemo } from 'react'

import FormMessage from '~/components/form-message'
import PlusButton from '~/components/plus-button'
import Textarea from '~/components/textarea'
import TrashButton from '~/components/trash-button'
import useFieldArray from '~/use-field-array'

import useSoloForm from '../../use-solo-form'

const Page = () => {
  const { data, editable, form, saveIndicator } = useSoloForm(),
    { append, fields, remove } = useFieldArray(form, 'transferPhones'),
    off = useMemo(() => !form.watch('transferSetting.enable'), [])
  return (
    <Form {...form}>
      {saveIndicator}
      <form>
        <FormField
          control={form.control}
          name='transferSetting.enable'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  className='absolute top-8 right-8 scale-150'
                  disabled={field.disabled}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {off ? null : (
          <>
            <p className='h-7' />
            <FormField
              control={form.control}
              name='transferSetting.instruction'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-end justify-between'>
                    <div>
                      <p>Instruction *</p>
                      <FormDescription>
                        This instruction will be used as LLM prompt when Transfer Call tool is triggered
                      </FormDescription>
                    </div>
                    {data?.language && ['english', 'japanese', 'vietnamese'].includes(data.language) ? (
                      <button
                        className='text-sm text-blue-500 hover:underline disabled:hidden'
                        disabled={field.disabled}
                        onClick={() => field.onChange(transferToOperatorInstruction[data.language])}
                        type='button'>
                        Set default instruction
                      </button>
                    ) : null}
                  </div>
                  <FormControl>
                    <Textarea className='min-h-24' disabled={field.disabled} maxLength={20_000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className='mt-5 ml-1'>Phone Numbers</p>
            <div className='grid grid-cols-[12fr_12fr_1fr] place-items-stretch gap-2 pr-1'>
              <p className='mt-auto pl-1 text-sm font-medium'>Name</p>
              <p className='mt-auto pl-1 text-sm font-medium'>Phone</p>
              {editable ? <PlusButton onClick={() => append({ name: '', phone: '' })} /> : <p />}
              {fields.map((f, i) => (
                <Fragment key={f.id}>
                  <FormField
                    control={form.control}
                    name={`transferPhones.${i}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder='Operator Name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`transferPhones.${i}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder='0123456789' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {editable ? <TrashButton onClick={() => remove(i)} /> : <p />}
                </Fragment>
              ))}
            </div>
          </>
        )}
      </form>
    </Form>
  )
}

export default Page
