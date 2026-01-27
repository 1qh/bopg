import { Form, FormControl, FormField, FormItem, FormLabel } from '@a/ui/form'
import { Input } from '@a/ui/input'
import { Textarea } from '@a/ui/textarea'
import { useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  id: string
}

const Agent = ({ id }: Props) => {
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
        <form className='space-y-4' onSubmit={e => e.preventDefault()}>
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
  },
  AgentDetail = ({ id }: Props) => {
    const { getNode, updateNodeData } = useReactFlow(),
      node = getNode(id),
      form = useForm({
        defaultValues: {
          conversationFlow: typeof node?.data.conversationFlow === 'string' ? node.data.conversationFlow : '',
          guideline: typeof node?.data.guideline === 'string' ? node.data.guideline : '',
          personas: typeof node?.data.personas === 'string' ? node.data.personas : '',
          scenario: typeof node?.data.scenario === 'string' ? node.data.scenario : ''
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
            name='personas'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personas</FormLabel>
                <FormControl>
                  <Textarea className='min-h-36' {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='conversationFlow'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conversation Flow</FormLabel>
                <FormControl>
                  <Textarea className='min-h-36' {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='scenario'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scenario</FormLabel>
                <FormControl>
                  <Textarea className='min-h-36' {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='guideline'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guideline</FormLabel>
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

export { Agent, AgentDetail }
