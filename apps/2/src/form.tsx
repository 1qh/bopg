/** biome-ignore-all lint/suspicious/noExplicitAny: x */
'use client'
import type { ReactNode } from 'react'
import type { infer as zinfer, ZodObject, ZodRawShape } from 'zod/v4'

import { Button } from '@a/ui/button'
import { Dialog, DialogContent } from '@a/ui/dialog'
import { useForm as useTanStackForm } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { useNavigationGuard } from 'next-navigation-guard'
import { useEffect, useRef, useState } from 'react'

import type { Api } from './fields'

import { fields, FormContext } from './fields'

interface FormReturn<T extends Record<string, unknown>, S extends ZodObject<ZodRawShape>> {
  error: Error | null
  guard: ReturnType<typeof useNavigationGuard>
  instance: Api<T>
  isDirty: boolean
  isPending: boolean
  reset: () => void
  schema: S
}

type KeyArr<T> = string & { [K in keyof T]: T[K] extends string[] | undefined ? K : never }[keyof T]
type KeyBol<T> = string & { [K in keyof T]: T[K] extends boolean | undefined ? K : never }[keyof T]
type KeyNum<T> = string & { [K in keyof T]: T[K] extends number | undefined ? K : never }[keyof T]
type KeyStr<T> = string &
  { [K in keyof T]: T[K] extends string | undefined ? (T[K] extends string[] | undefined ? never : K) : never }[keyof T]

interface TypedFields<T> {
  Arr: (props: Omit<Parameters<typeof fields.Arr>[0], 'name'> & { name: KeyArr<T> }) => ReactNode
  Choose: (props: Omit<Parameters<typeof fields.Choose>[0], 'name'> & { name: KeyStr<T> }) => ReactNode
  Err: typeof fields.Err
  Fields: typeof fields.Fields
  Num: (props: Omit<Parameters<typeof fields.Num>[0], 'name'> & { name: KeyNum<T> }) => ReactNode
  Submit: typeof fields.Submit
  Text: (props: Omit<Parameters<typeof fields.Text>[0], 'name'> & { name: KeyStr<T> }) => ReactNode
  Toggle: (props: { falseLabel?: string; name: KeyBol<T>; trueLabel: string }) => ReactNode
}

export const useForm = <S extends ZodObject<ZodRawShape>>({
    onError,
    onSubmit,
    onSuccess,
    schema,
    values
  }: {
    onError?: (e: unknown) => void
    onSubmit: (d: zinfer<S>) => unknown
    onSuccess?: () => void
    schema: S
    values: zinfer<S>
  }) => {
    type T = typeof values
    const [er, setEr] = useState<Error | null>(null),
      valuesRef = useRef(values)
    // eslint-disable-next-line react-hooks/refs
    valuesRef.current = values
    const instance = useTanStackForm({
        defaultValues: values,
        onSubmit: async ({ value }) => {
          setEr(null)
          try {
            await onSubmit(value)
            instance.reset(value)
            onSuccess?.()
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error')
            setEr(err)
            onError?.(err)
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        validators: { onSubmit: schema as any }
      }),
      isDirty = useStore(instance.store, s => s.isDirty),
      isPending = useStore(instance.store, s => s.isSubmitting)
    useEffect(() => {
      if (!(isDirty || isPending)) return
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        e.returnValue = ''
      }
      window.addEventListener('beforeunload', handler)
      return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty, isPending])
    const guard = useNavigationGuard({ enabled: isDirty || isPending })
    return {
      error: er,
      guard,
      instance,
      isDirty,
      isPending,
      reset: () => {
        instance.reset(valuesRef.current)
        setEr(null)
      },
      schema
    } satisfies FormReturn<T, S>
  },
  Form = <T extends Record<string, unknown>, S extends ZodObject<ZodRawShape>>({
    className,
    form,
    render
  }: {
    className?: string
    form: FormReturn<T, S>
    render: (f: TypedFields<T>) => ReactNode
  }) => (
    <FormContext value={{ form: form.instance, schema: form.schema }}>
      <form
        className={className}
        onSubmit={e => {
          e.preventDefault()
          form.instance.handleSubmit()
        }}>
        {render(fields as TypedFields<T>)}
      </form>
      <Dialog open={form.guard.active}>
        <DialogContent
          className='[&>button]:hidden'
          onEscapeKeyDown={form.guard.reject}
          onInteractOutside={form.guard.reject}>
          <p>You have unsaved changes. Are you sure you want to leave?</p>
          <div className='flex justify-end gap-2'>
            <Button onClick={form.guard.reject} variant='outline'>
              Cancel
            </Button>
            <Button onClick={form.guard.accept} variant='destructive'>
              Discard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FormContext>
  )
