/* eslint-disable max-statements, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/nursery/noContinue: x */
/** biome-ignore-all lint/suspicious/noExplicitAny: x */
'use client'
import type { AnyFieldApi, ReactFormExtendedApi } from '@tanstack/react-form'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import type { ZodObject } from 'zod/v4'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@a/ui/field'
import { Input } from '@a/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Spinner } from '@a/ui/spinner'
import { Switch } from '@a/ui/switch'
import { Textarea } from '@a/ui/textarea'
import { X } from 'lucide-react'
import { createContext, use } from 'react'
import { toast } from 'sonner'

const SEP = /[,;]+/u,
  FormContext = createContext<null | { form: Api<any>; schema: ZodObject<any> }>(null),
  useFormContext = () => {
    const ctx = use(FormContext)
    if (!ctx) throw new Error('Field components must be used inside <Form>')
    return ctx
  },
  getArrayMax = (schema: ZodObject<any>, name: string): number | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    let field = schema.shape[name]
    if (!field) return
    while (field) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const def = field._zod?.def ?? field._def
      if (!def) break
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const type = def.type ?? def.typeName
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (['default', 'nullable', 'optional', 'ZodDefault', 'ZodNullable', 'ZodOptional'].includes(type)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        field = def.inner ?? def.innerType
        // eslint-disable-next-line no-continue
        continue
      }
      if (type === 'array' || type === 'ZodArray') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const checks = def.checks as undefined | { _zod?: { def?: { check?: string; maximum?: number } } }[]
        if (checks) {
          const maxCheck = checks.find(c => c._zod?.def?.check === 'max_length')
          if (maxCheck?._zod?.def?.maximum !== undefined) return maxCheck._zod.def.maximum
        }
      }
      break
    }
  }

type Api<T extends Record<string, unknown>> = ReactFormExtendedApi<
  T,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>

const fields = {
  Arr: ({
    className,
    disabled,
    inputClassName,
    label,
    name,
    placeholder,
    tagClassName,
    transform
  }: {
    className?: string
    disabled?: boolean
    inputClassName?: string
    label?: string
    name: string
    placeholder?: string
    tagClassName?: string
    transform?: (v: string) => string
  }) => {
    const { form, schema } = useFormContext(),
      maxTags = getArrayMax(schema, name)
    return (
      <form.Field mode='array' name={name}>
        {(f: AnyFieldApi) => {
          const tags = (f.state.value ?? []) as string[],
            invalid = f.state.meta.isTouched && !f.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              {label ? <FieldLabel htmlFor={f.name}>{label}</FieldLabel> : null}
              <div
                className={cn(
                  'relative flex min-h-10 w-full flex-wrap items-center gap-0.75 rounded-md border border-input bg-transparent p-1 text-sm transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50 dark:bg-background',
                  className
                )}>
                {tags.map((t, i) => (
                  <p
                    className={cn(
                      'flex h-7 items-center gap-0.5 rounded-full bg-muted pr-1.5 pl-3 transition-all duration-300 hover:bg-input',
                      tagClassName,
                      disabled && 'cursor-not-allowed opacity-50 *:cursor-not-allowed'
                    )}
                    key={t}>
                    <span className='mb-px'>{t}</span>
                    <X
                      className='size-4 cursor-pointer rounded-full stroke-1 p-0.5 text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-background hover:stroke-2 hover:text-destructive active:scale-75'
                      onClick={() => {
                        if (disabled) return
                        f.removeValue(i)
                      }}
                    />
                  </p>
                ))}
                <input
                  aria-invalid={invalid}
                  className={cn(
                    'peer ml-1 w-0 flex-1 outline-none placeholder:text-muted-foreground placeholder:capitalize',
                    tags.length ? 'placeholder:opacity-0' : 'pl-1',
                    inputClassName
                  )}
                  disabled={disabled}
                  id={f.name}
                  name={f.name}
                  onBlur={f.handleBlur}
                  onKeyDown={e => {
                    const { value } = e.currentTarget,
                      values = value
                        .split(SEP)
                        .map(v => {
                          const trimmed = v.trim()
                          return transform ? transform(trimmed) : trimmed
                        })
                        .filter(Boolean)
                    if (values.length) {
                      if ([',', ';', 'Enter'].includes(e.key)) {
                        if (maxTags && tags.length + values.length > maxTags) {
                          e.preventDefault()
                          toast.error(`You can only add up to ${maxTags} items.`)
                          return
                        }
                        e.preventDefault()
                        f.handleChange([...new Set([...tags, ...values])])
                        e.currentTarget.value = ''
                      }
                    } else if (e.key === 'Backspace' && tags.length) {
                      e.preventDefault()
                      f.removeValue(tags.length - 1)
                    }
                  }}
                  placeholder={tags.length ? undefined : placeholder}
                />
              </div>
              {invalid ? <FieldError errors={f.state.meta.errors} /> : null}
            </Field>
          )
        }}
      </form.Field>
    )
  },
  Choose: ({
    label,
    name,
    options,
    placeholder
  }: {
    label?: string
    name: string
    options: readonly { label: string; value: string }[]
    placeholder?: string
  }) => {
    const { form } = useFormContext()
    return (
      <form.Field name={name}>
        {(f: AnyFieldApi) => {
          const invalid = f.state.meta.isTouched && !f.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              {label ? <FieldLabel htmlFor={f.name}>{label}</FieldLabel> : null}
              <Select name={f.name} onValueChange={v => f.handleChange(v)} value={f.state.value ?? ''}>
                <SelectTrigger aria-invalid={invalid} id={f.name} onBlur={f.handleBlur}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {invalid ? <FieldError errors={f.state.meta.errors} /> : null}
            </Field>
          )
        }}
      </form.Field>
    )
  },
  Err: ({ error }: { error: Error | null }) =>
    error ? <p className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error.message}</p> : null,
  Fields: (props: ComponentProps<'div'>) => <FieldGroup {...props} />,
  Num: ({
    label,
    name,
    ...props
  }: Omit<ComponentProps<'input'>, 'form' | 'id' | 'name' | 'onBlur' | 'onChange' | 'type' | 'value'> & {
    label?: string
    name: string
  }) => {
    const { form } = useFormContext()
    return (
      <form.Field name={name}>
        {(f: AnyFieldApi) => {
          const invalid = f.state.meta.isTouched && !f.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              {label ? <FieldLabel htmlFor={f.name}>{label}</FieldLabel> : null}
              <Input
                aria-invalid={invalid}
                id={f.name}
                name={f.name}
                onBlur={f.handleBlur}
                onChange={e => f.handleChange(e.target.valueAsNumber)}
                type='number'
                value={f.state.value ?? ''}
                {...props}
              />
              {invalid ? <FieldError errors={f.state.meta.errors} /> : null}
            </Field>
          )
        }}
      </form.Field>
    )
  },
  Submit: ({
    children,
    disabled,
    Icon,
    ...props
  }: Omit<ComponentProps<typeof Button>, 'type'> & {
    children: ReactNode
    Icon?: LucideIcon
  }) => {
    const { form } = useFormContext()
    return (
      <form.Subscribe selector={s => ({ dirty: s.isDirty, pending: s.isSubmitting })}>
        {({ dirty, pending }) => (
          <Button disabled={disabled ?? !(dirty || pending)} type='submit' {...props}>
            {pending ? <Spinner /> : Icon ? <Icon /> : null}
            {children}
          </Button>
        )}
      </form.Subscribe>
    )
  },
  Text: ({
    label,
    maxLength,
    multiline,
    name,
    ...props
  }: Omit<
    ComponentProps<'input'> & ComponentProps<'textarea'>,
    'form' | 'id' | 'maxLength' | 'name' | 'onBlur' | 'onChange' | 'value'
  > & {
    label?: string
    maxLength?: number
    multiline?: boolean
    name: string
  }) => {
    const { form } = useFormContext()
    return (
      <form.Field name={name}>
        {(f: AnyFieldApi) => {
          const invalid = f.state.meta.isTouched && !f.state.meta.isValid,
            C = multiline ? Textarea : Input,
            value = f.state.value ?? ''
          return (
            <Field data-invalid={invalid}>
              <div className='flex items-center justify-between'>
                {label ? <FieldLabel htmlFor={f.name}>{label}</FieldLabel> : null}
                {maxLength ? (
                  <span className='text-xs text-muted-foreground'>
                    {String(value).length}/{maxLength}
                  </span>
                ) : null}
              </div>
              <C
                aria-invalid={invalid}
                id={f.name}
                maxLength={maxLength}
                name={f.name}
                onBlur={f.handleBlur}
                onChange={e => f.handleChange(e.target.value)}
                value={value}
                {...props}
              />
              {invalid ? <FieldError errors={f.state.meta.errors} /> : null}
            </Field>
          )
        }}
      </form.Field>
    )
  },
  Toggle: ({ falseLabel, name, trueLabel }: { falseLabel?: string; name: string; trueLabel: string }) => {
    const { form } = useFormContext()
    return (
      <form.Field name={name}>
        {(f: AnyFieldApi) => {
          const invalid = f.state.meta.isTouched && !f.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <div className='flex items-center gap-2'>
                <Switch
                  aria-invalid={invalid}
                  checked={f.state.value ?? false}
                  id={f.name}
                  name={f.name}
                  onBlur={f.handleBlur}
                  onCheckedChange={v => f.handleChange(v)}
                />
                <FieldLabel htmlFor={f.name}>{f.state.value ? trueLabel : (falseLabel ?? trueLabel)}</FieldLabel>
              </div>
              {invalid ? <FieldError errors={f.state.meta.errors} /> : null}
            </Field>
          )
        }}
      </form.Field>
    )
  }
}

export type { Api }
export { fields, FormContext }
