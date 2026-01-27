import { Form, FormControl, FormField, FormItem, FormLabel } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Textarea } from '@a/ui/textarea'
import { useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import type { Item } from '../base'

type PathItem = Item & {
  description?: string
  note?: string
}

const PathForm = ({ nodeId, pathId }: { nodeId: string; pathId: string }) => {
  const { getNode, setNodes } = useReactFlow(),
    node = getNode(nodeId),
    item = (node?.data.items as PathItem[] | undefined)?.find(i => i.id === pathId),
    form = useForm({
      defaultValues: {
        description: typeof item?.description === 'string' ? item.description : '',
        name: typeof item?.name === 'string' ? item.name : '',
        note: typeof item?.note === 'string' ? item.note : ''
      }
    })
  useEffect(() => {
    const { unsubscribe } = form.watch(values => {
      setNodes(ns =>
        ns.map(n => {
          if (n.id === nodeId) {
            const { items } = n.data,
              updatedItems = (items as PathItem[]).map(i => (i.id === pathId ? { ...i, ...values } : i))
            return { ...n, data: { ...n.data, items: updatedItems } }
          }
          return n
        })
      )
    })
    return () => unsubscribe()
  }, [nodeId, pathId, setNodes, form])

  return (
    <Form {...form}>
      <form className='space-y-4 px-4' onSubmit={e => e.preventDefault()}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className='min-h-36' {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea className='min-h-36' {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default PathForm
