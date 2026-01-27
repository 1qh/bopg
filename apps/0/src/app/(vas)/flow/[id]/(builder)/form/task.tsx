import { Form, FormControl, FormField, FormItem, FormLabel } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Textarea } from '@a/ui/textarea'
import { useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const TaskForm = ({ id }: { id: string }) => {
  const { getNode, updateNodeData } = useReactFlow(),
    node = getNode(id),
    form = useForm({
      defaultValues: {
        description: typeof node?.data.description === 'string' ? node.data.description : '',
        name: typeof node?.data.name === 'string' ? node.data.name : '',
        note: typeof node?.data.note === 'string' ? node.data.note : ''
      }
    })
  useEffect(() => {
    const { unsubscribe } = form.watch(v => updateNodeData(id, v))
    return () => unsubscribe()
  }, [id, updateNodeData, form])
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

export default TaskForm
