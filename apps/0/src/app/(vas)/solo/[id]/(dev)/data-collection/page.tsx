'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@a/ui/accordion'
import { Button } from '@a/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Slider } from '@a/ui/slider'
import { useSuspenseQuery } from '@tanstack/react-query'
import { dataTypes } from 'constant'
import { Plus } from 'lucide-react'

import FormMessage from '~/components/form-message'
import Textarea from '~/components/textarea'
import TrashButton from '~/components/trash-button'
import { api } from '~/trpc/react'
import useFieldArray from '~/use-field-array'

import useSoloForm from '../use-solo-form'

const Page = () => {
  const { data, editable, form, saveIndicator } = useSoloForm(),
    { llm } = api(),
    { data: llms } = useSuspenseQuery(llm.all.queryOptions()),
    llmItems = useFieldArray(form, 'dataCollectionLlmItems'),
    varItems = useFieldArray(form, 'dataCollectionVariableItems')

  return data?.language ? (
    <Form {...form}>
      {saveIndicator}
      <form className='relative flex flex-col gap-4'>
        <div className='flex items-start gap-3'>
          <FormField
            control={form.control}
            name='dataCollection.llm'
            render={({ field }) => (
              <FormItem className='grow'>
                <FormLabel className='uppercase'>LLM *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger className='w-full data-placeholder:normal-case' disabled={field.disabled}>
                      <SelectValue placeholder='Select an LLM' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {llms
                      .filter(l => l.languages.includes(data.language))
                      .map(v => (
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
            name='dataCollection.temperature'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='w-44 space-y-1 *:text-center'>
                    <p className='text-sm font-medium'>Temperature</p>
                    <input
                      {...field}
                      className='w-48 outline-none'
                      max={1}
                      min={0}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                      step={0.05}
                      type='number'
                    />
                    <Slider
                      disabled={field.disabled}
                      max={1}
                      min={0}
                      onValueChange={([v]) => field.onChange(v)}
                      step={0.05}
                      value={[field.value ?? 0]}
                    />
                  </div>
                </FormControl>
                <FormMessage className='w-44 text-xs' />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='dataCollection.systemPrompt'
          render={({ field }) => (
            <FormItem className='grow'>
              <FormLabel>System Prompt *</FormLabel>
              <FormControl>
                <Textarea className='min-h-28' maxLength={20_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Accordion collapsible type='single'>
          {llmItems.fields.map((f, index) => (
            <AccordionItem
              className='group rounded-xl border border-none px-3 transition-all duration-500 hover:bg-muted! data-[state=open]:rounded-3xl data-[state=open]:bg-muted/80'
              key={f.id}
              value={`llm-${index}`}>
              <AccordionTrigger className='items-center py-0 hover:no-underline'>
                <div className='flex h-12 grow items-center gap-2 text-base font-normal transition-all duration-300 group-data-[state=open]:mb-2 group-data-[state=open]:pl-2 group-data-[state=open]:text-lg group-data-[state=open]:font-semibold'>
                  <div>
                    {form.watch(`dataCollectionLlmItems.${index}.name`)?.length
                      ? form.watch(`dataCollectionLlmItems.${index}.name`)
                      : 'Untitled'}
                    <p className='-mt-1 text-xs font-light text-muted-foreground transition-all duration-300 group-data-[state=open]:text-[0px]'>
                      {form.watch(`dataCollectionLlmItems.${index}.dataType`)}
                    </p>
                  </div>
                  {editable ? (
                    <TrashButton
                      className='group-data-[state=closed]:pointer-events-none group-data-[state=closed]:size-0'
                      onClick={() => llmItems.remove(index)}
                    />
                  ) : null}
                  <p className='grow' />
                  <p className='rounded-full border px-2 py-px text-xs text-muted-foreground'>LLM</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-4 px-0.75 pb-4 [&_input]:bg-background [&_label]:ml-1'>
                <div className='flex items-start gap-3'>
                  <FormField
                    control={form.control}
                    name={`dataCollectionLlmItems.${index}.name`}
                    render={({ field }) => (
                      <FormItem className='grow'>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input className='bg-background' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`dataCollectionLlmItems.${index}.dataType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className='min-w-32 bg-background data-placeholder:normal-case'>
                              <SelectValue placeholder='Select a Data Type' />
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
                </div>
                <FormField
                  control={form.control}
                  name={`dataCollectionLlmItems.${index}.instruction`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruction</FormLabel>
                      <FormControl>
                        <Textarea className='min-h-24 bg-background' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
          {varItems.fields.map((f, index) => (
            <AccordionItem
              className='group rounded-xl border border-none px-3 transition-all duration-500 hover:bg-muted! data-[state=open]:rounded-3xl data-[state=open]:bg-muted/80'
              key={f.id}
              value={`variable-${index}`}>
              <AccordionTrigger className='items-center py-0 hover:no-underline'>
                <div className='flex h-12 grow items-center gap-2 text-base font-normal transition-all duration-300 group-data-[state=open]:mb-2 group-data-[state=open]:pl-2 group-data-[state=open]:text-lg group-data-[state=open]:font-semibold'>
                  <div>
                    {form.watch(`dataCollectionVariableItems.${index}.name`)?.length
                      ? form.watch(`dataCollectionVariableItems.${index}.name`)
                      : 'Untitled'}
                    <p className='-mt-1 text-xs font-light text-muted-foreground transition-all duration-300 group-data-[state=open]:text-[0px]'>
                      {form.watch(`dataCollectionVariableItems.${index}.dataType`)}
                    </p>
                  </div>
                  {editable ? (
                    <TrashButton
                      className='group-data-[state=closed]:pointer-events-none group-data-[state=closed]:size-0'
                      onClick={() => varItems.remove(index)}
                    />
                  ) : null}
                  <p className='grow' />
                  <p className='rounded-full border px-2 py-px text-xs text-muted-foreground'>Variable</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-4 px-0.75 pb-4 [&_input]:bg-background [&_label]:ml-1'>
                <div className='flex items-start gap-3'>
                  <FormField
                    control={form.control}
                    name={`dataCollectionVariableItems.${index}.name`}
                    render={({ field }) => (
                      <FormItem className='grow'>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input className='bg-background' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`dataCollectionVariableItems.${index}.variable`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variable</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className='min-w-32 bg-background data-placeholder:normal-case'>
                              <SelectValue placeholder='Select a variable' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {data.dynamicVariables.map(v => (
                              <SelectItem key={v.name} value={v.name}>
                                {v.name}
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
                    name={`dataCollectionVariableItems.${index}.dataType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className='min-w-32 bg-background data-placeholder:normal-case'>
                              <SelectValue placeholder='Select a Data Type' />
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
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {editable ? (
          <div className='ml-auto space-x-2'>
            <Button
              onClick={() => llmItems.append({ dataType: 'string', instruction: '', name: '' })}
              type='button'
              variant='outline'>
              <Plus />
              LLM Item
            </Button>
            <Button
              onClick={() => varItems.append({ dataType: 'string', name: '', variable: '' })}
              type='button'
              variant='outline'>
              <Plus />
              Variable Item
            </Button>
          </div>
        ) : null}
      </form>
    </Form>
  ) : null
}

export default Page
