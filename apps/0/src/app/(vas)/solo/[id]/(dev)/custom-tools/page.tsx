'use client'

import type { UpdateSoloSchema } from '@a/db/schema'
import type { Control } from 'react-hook-form'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@a/ui/accordion'
import { Button } from '@a/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@a/ui/drawer'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Textarea } from '@a/ui/textarea'
import { Editor } from '@monaco-editor/react'
import { dataTypes } from 'constant'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useFieldArray } from 'react-hook-form'

import FormMessage from '~/components/form-message'
import PlusButton from '~/components/plus-button'
import TrashButton from '~/components/trash-button'

import useSoloForm from '../use-solo-form'

const InputArgs = ({ control, editable, index }: NestedArrayProps) => {
    const { append, fields, remove } = useFieldArray({ control, name: `customTools.${index}.inputArgs` })
    return (
      <div className='grid grid-cols-[10fr_10fr_1fr] place-items-stretch gap-1.5 pr-0.5 text-xs [&_p]:text-muted-foreground/80'>
        <p className='mt-auto pl-1'>Name</p>
        <p className='mt-auto pl-1'>Type</p>
        {editable ? <PlusButton className='size-6' onClick={() => append({ dataType: 'string', name: '' })} /> : <p />}
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={control}
              name={`customTools.${index}.inputArgs.${i}.name`}
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
              control={control}
              name={`customTools.${index}.inputArgs.${i}.dataType`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className='w-full bg-background data-placeholder:normal-case'>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataTypes.map(v => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editable ? <TrashButton onClick={() => remove(i)} /> : <p />}
          </Fragment>
        ))}
      </div>
    )
  },
  OutputArgs = ({ control, editable, index }: NestedArrayProps) => {
    const { append, fields, remove } = useFieldArray({ control, name: `customTools.${index}.outputArgs` })
    return (
      <div className='grid grid-cols-[10fr_10fr_1fr] place-items-stretch gap-1.5 pr-0.5 text-xs [&_p]:text-muted-foreground/80'>
        <p className='mt-auto pl-1'>Name</p>
        <p className='mt-auto pl-1'>Type</p>
        {editable ? <PlusButton className='size-6' onClick={() => append({ dataType: 'string', name: '' })} /> : <p />}
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={control}
              name={`customTools.${index}.outputArgs.${i}.name`}
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
              control={control}
              name={`customTools.${index}.outputArgs.${i}.dataType`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className='w-full bg-background data-placeholder:normal-case'>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataTypes.map(v => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editable ? <TrashButton onClick={() => remove(i)} /> : <p />}
          </Fragment>
        ))}
      </div>
    )
  },
  InputMap = ({ control, editable, index, variables }: NestedArrayProps & { variables: string[] }) => {
    const { append, fields, remove } = useFieldArray({ control, name: `customTools.${index}.inputArgMaps` })
    return (
      <div className='grid grid-cols-[7fr_7fr_7fr_1fr] place-items-stretch gap-1.5 pr-0.5 text-xs [&_p]:text-muted-foreground/80'>
        <p className='mt-auto pl-1'>Name</p>
        <p className='mt-auto pl-1'>Variable</p>
        <p className='mt-auto pl-1'>Description</p>
        {editable ? (
          <PlusButton
            className='size-6'
            onClick={() =>
              append({
                description: '',
                name: '',
                variable: ''
              })
            }
          />
        ) : (
          <p />
        )}
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={control}
              name={`customTools.${index}.inputArgMaps.${i}.name`}
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
              control={control}
              name={`customTools.${index}.inputArgMaps.${i}.variable`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className='w-full bg-background data-placeholder:normal-case'>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {variables.map(v => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`customTools.${index}.inputArgMaps.${i}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editable ? <TrashButton onClick={() => remove(i)} /> : <p />}
          </Fragment>
        ))}
      </div>
    )
  },
  OutputMap = ({ control, editable, index, variables }: NestedArrayProps & { variables: string[] }) => {
    const { append, fields, remove } = useFieldArray({ control, name: `customTools.${index}.outputArgMaps` })
    return (
      <div className='grid grid-cols-[7fr_7fr_7fr_1fr] place-items-stretch gap-1.5 pr-0.5 text-xs [&_p]:text-muted-foreground/80'>
        <p className='mt-auto pl-1'>Name</p>
        <p className='mt-auto pl-1'>Variable</p>
        <p className='mt-auto pl-1'>Description</p>
        {editable ? (
          <PlusButton
            className='size-6'
            onClick={() =>
              append({
                description: '',
                name: '',
                variable: ''
              })
            }
          />
        ) : (
          <p />
        )}
        {fields.map((f, i) => (
          <Fragment key={f.id}>
            <FormField
              control={control}
              name={`customTools.${index}.outputArgMaps.${i}.name`}
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
              control={control}
              name={`customTools.${index}.outputArgMaps.${i}.variable`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className='w-full bg-background data-placeholder:normal-case'>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {variables.map(v => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`customTools.${index}.outputArgMaps.${i}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editable ? <TrashButton onClick={() => remove(i)} /> : <p />}
          </Fragment>
        ))}
      </div>
    )
  }
interface NestedArrayProps {
  control: Control<typeof UpdateSoloSchema.infer>
  editable: boolean
  index: number
}

const Page = () => {
  const { data, editable, form, saveIndicator } = useSoloForm(),
    { append, fields, remove } = useFieldArray({ control: form.control, name: 'customTools' }),
    [optimized, setOptimized] = useState<string>('')

  return (
    <Form {...form}>
      {saveIndicator}
      <div className='mb-5 flex items-center justify-between gap-5'>
        <p className='text-sm text-muted-foreground'>Define custom tools for the agent by python functions</p>
        {editable ? (
          <Button
            onClick={() =>
              append({
                inputArgMaps: [],
                inputArgs: [],
                instruction: '',
                name: '',
                outputArgMaps: [],
                outputArgs: [],
                python: ''
              })
            }
            type='button'
            variant='outline'>
            <Plus />
            Add Tool
          </Button>
        ) : null}
      </div>
      <form className='space-y-6'>
        <Accordion collapsible type='single'>
          {fields.map((f, index) => (
            <AccordionItem
              className='group rounded-xl border border-none px-3 transition-all duration-500 hover:bg-muted! data-[state=open]:rounded-3xl data-[state=open]:bg-muted/80'
              key={f.id}
              value={`tool-${index}`}>
              <AccordionTrigger className='items-center py-0 hover:no-underline'>
                <div className='flex h-12 items-center gap-2 text-base font-normal transition-all duration-300 group-data-[state=open]:mb-2 group-data-[state=open]:pl-2 group-data-[state=open]:text-lg group-data-[state=open]:font-semibold'>
                  <div>
                    {form.watch(`customTools.${index}.name`)?.length
                      ? form.watch(`customTools.${index}.name`)
                      : 'Untitled Tool'}
                    <p className='-mt-1 text-xs font-light text-muted-foreground transition-all duration-300 group-data-[state=open]:text-[0px]'>
                      {form.watch(`customTools.${index}.instruction`)}
                    </p>
                  </div>
                  {editable ? (
                    <TrashButton
                      className='group-data-[state=closed]:pointer-events-none group-data-[state=closed]:size-0'
                      onClick={() => remove(index)}
                    />
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-4 px-0.75 [&_input]:bg-background [&_label]:ml-1'>
                <FormField
                  control={form.control}
                  name={`customTools.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`customTools.${index}.instruction`}
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-end justify-between'>
                        <FormLabel>Instruction *</FormLabel>
                        <Drawer>
                          <DrawerTrigger asChild disabled={!field.value?.trim().length}>
                            <Button type='button' variant='outline'>
                              <Sparkles />
                              Optimize
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <div className='flex gap-3 px-6'>
                              <p className='text-xl font-semibold'>
                                {form.watch(`customTools.${index}.name`)?.length
                                  ? form.watch(`customTools.${index}.name`)
                                  : 'Untitled Tool'}
                              </p>
                              <p className='grow' />
                              <Button
                                disabled={!optimized.length}
                                onClick={() => {
                                  form.setValue(field.name, optimized, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true
                                  })
                                  setOptimized('')
                                }}
                                type='button'
                                variant='outline'>
                                Apply
                              </Button>
                              <Button
                                onClick={() => setOptimized('This is an optimized version of your prompt.')}
                                type='button'>
                                Optimize
                              </Button>
                            </div>
                            <div className='grid max-h-300 min-h-96 grid-cols-[20fr_1fr_20fr] p-5'>
                              <p className='overflow-auto rounded-xl border p-4 whitespace-pre-line'>{field.value}</p>
                              <ArrowRight className='m-auto stroke-1' />
                              <p className='overflow-auto rounded-xl border p-4 whitespace-pre-line'>
                                {optimized.length > 0 ? optimized : 'Optimized prompt will be displayed here.'}
                              </p>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      </div>
                      <FormControl>
                        <Textarea className='bg-background' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`customTools.${index}.python`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Python 3 *</FormLabel>
                      <FormControl>
                        <Editor
                          className='overflow-hidden rounded-lg border bg-background pt-4 shadow-xs'
                          defaultLanguage='python'
                          height='369px'
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <p className='mb-2 ml-2 text-sm font-medium'>Arguments</p>
                  <div className='grid grid-cols-2 gap-4 *:rounded-xl *:border *:bg-background/50 *:p-2 *:pt-0'>
                    <div>
                      <p className='mx-auto -mt-3.5 w-fit rounded-full border bg-background px-3 font-medium'>Input</p>
                      <InputArgs control={form.control} editable={editable} index={index} />
                    </div>
                    <div>
                      <p className='mx-auto -mt-3.5 w-fit rounded-full border bg-background px-3 font-medium'>Output</p>
                      <OutputArgs control={form.control} editable={editable} index={index} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className='mb-2 ml-2 text-sm font-medium'>Arguments Mapping</p>
                  <div className='grid grid-cols-2 gap-4 *:rounded-xl *:border *:bg-background/50 *:p-2 *:pt-0'>
                    <div>
                      <p className='mx-auto -mt-3.5 w-fit rounded-full border bg-background px-3 font-medium'>Input</p>
                      <InputMap
                        control={form.control}
                        editable={editable}
                        index={index}
                        variables={data?.dynamicVariables.length ? data.dynamicVariables.map(({ name }) => name) : []}
                      />
                    </div>
                    <div>
                      <p className='mx-auto -mt-3.5 w-fit rounded-full border bg-background px-3 font-medium'>Output</p>
                      <OutputMap
                        control={form.control}
                        editable={editable}
                        index={index}
                        variables={data?.dynamicVariables.length ? data.dynamicVariables.map(({ name }) => name) : []}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </form>
    </Form>
  )
}

export default Page
