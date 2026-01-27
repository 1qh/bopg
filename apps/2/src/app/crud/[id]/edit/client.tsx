'use client'

import type { Doc, Id } from '@a/cv/model'
import type { Preloaded } from 'convex/react'
import type { ComponentProps } from 'react'

import { api } from '@a/cv'
import t from '@a/cv/t'
import { cn } from '@a/ui'
import { Label } from '@a/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Spinner } from '@a/ui/spinner'
import { Switch } from '@a/ui/switch'
import { useMutation, usePreloadedQuery } from 'convex/react'
import { Save, Settings } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Form, useForm } from '~/form'

interface BlogProps {
  blog: Doc<'blog'>
}

type PublishProps = ComponentProps<'div'> & {
  id: Id<'blog'>
  published: boolean
}

const categories = t.blog.shape.category.options.map(c => ({
    label: c.charAt(0).toUpperCase() + c.slice(1),
    value: c
  })),
  Publish = ({ className, id, published, ...props }: PublishProps) => {
    const update = useMutation(api.blog.update),
      [pending, go] = useTransition()
    return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
        <Label htmlFor='publish'>{pending ? <Spinner /> : published ? 'Published' : 'Draft'}</Label>
        <Switch
          checked={published}
          disabled={pending}
          id='publish'
          onCheckedChange={() =>
            go(async () => {
              await update({ id, published: !published })
            })
          }
        />
      </div>
    )
  },
  Edit = ({ blog }: BlogProps) => {
    const update = useMutation(api.blog.update),
      { content, tags, title } = blog,
      form = useForm({
        onSubmit: d => {
          update({ id: blog._id, ...d })
        },
        onSuccess: () => {
          toast.success('Saved')
        },
        schema: t.blog.partial(),
        values: { content, tags, title }
      })
    return (
      <Form
        className='flex flex-col gap-3'
        form={form}
        render={({ Arr, Err, Fields, Submit, Text }) => (
          <>
            <Err error={form.error} />
            <Fields className='gap-5'>
              <Text label='Title' name='title' />
              <Text className='min-h-64' label='Content' multiline name='content' />
              <Arr label='Tags' name='tags' placeholder='Add tag...' transform={s => s.toLowerCase()} />
            </Fields>
            <Submit className='ml-auto' Icon={Save}>
              {form.isPending ? 'Saving...' : 'Save'}
            </Submit>
          </>
        )}
      />
    )
  },
  Setting = ({ blog }: { blog: Doc<'blog'> }) => {
    const updateSettings = useMutation(api.blog.update),
      { category, published, slug } = blog,
      form = useForm({
        onError: () => {
          toast.error('Failed')
        },
        onSubmit: d => {
          updateSettings({ id: blog._id, ...d })
        },
        onSuccess: () => {
          toast.success('Saved')
        },
        schema: t.blog.partial(),
        values: { category, published, slug }
      })
    return (
      <Form
        className='flex flex-col gap-4'
        form={form}
        render={({ Choose, Fields, Submit, Text, Toggle }) => (
          <>
            <Fields className='gap-5'>
              <Choose label='Category' name='category' options={categories} />
              <Text label='Slug' name='slug' />
              <Toggle falseLabel='Draft' name='published' trueLabel='Published' />
            </Fields>
            <Submit>Save</Submit>
          </>
        )}
      />
    )
  }

interface ClientProps {
  preloaded: Preloaded<typeof api.blog.read>
}

const Client = ({ preloaded }: ClientProps) => {
  const blog = usePreloadedQuery(preloaded)
  if (!blog?.own) return <p className='text-muted-foreground'>Blog not found</p>
  return (
    <>
      <div className='mb-3 flex justify-between'>
        <Link className='rounded-lg px-3 py-2 hover:bg-muted' href={`/crud/${blog._id}`}>
          &larr; Back
        </Link>
        <Popover>
          <PopoverTrigger asChild>
            <Settings className='size-8 rounded-lg stroke-1 p-1.5 group-hover:block hover:bg-muted' />
          </PopoverTrigger>
          <PopoverContent>
            <Setting blog={blog} key={blog._id} />
          </PopoverContent>
        </Popover>
      </div>
      <Edit blog={blog} key={blog._id} />
    </>
  )
}

export { categories, Client, Publish }
