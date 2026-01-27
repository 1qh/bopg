'use client'

import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import { cn } from '@a/ui'
import { X } from 'lucide-react'

import Placeholder from './placeholder'

const SEP_REGEX = /[,;]+/u

type InputTagsProps = Omit<ComponentProps<'input'>, 'onChange' | 'value'> & {
  onChange: Dispatch<SetStateAction<string[]>>
  value: string[]
}

const InputTags = ({ className, onChange, placeholder, value: tags, ...props }: InputTagsProps) => (
  <div
    className={cn(
      'relative flex min-h-10 w-full flex-wrap items-center gap-0.75 rounded-md border border-input bg-transparent p-1 text-sm transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50 dark:bg-background',
      className
    )}>
    {tags.map(t => (
      <p
        className={cn(
          'flex h-7 items-center gap-0.5 rounded-full bg-muted pr-1.5 pl-3 transition-all duration-300 hover:bg-input',
          props.disabled && 'cursor-not-allowed opacity-50 *:cursor-not-allowed'
        )}
        key={t}>
        <span className='mb-px'>{t}</span>
        <X
          className='size-4 cursor-pointer rounded-full stroke-1 p-0.5 text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-background hover:stroke-2 hover:text-destructive active:scale-75'
          onClick={() => {
            if (props.disabled) return
            onChange(tags.filter(i => i !== t))
          }}
        />
      </p>
    ))}
    <input
      className={cn(
        'peer ml-1 w-0 flex-1 outline-none placeholder:text-muted-foreground placeholder:capitalize',
        tags.length ? 'placeholder:opacity-0' : 'pl-1'
      )}
      onKeyDown={e => {
        const { value } = e.currentTarget,
          values = value
            .split(SEP_REGEX)
            .map(v => v.trim())
            .filter(Boolean)
        if (values.length) {
          if ([',', ';', 'Enter'].includes(e.key)) {
            e.preventDefault()
            onChange([...new Set([...tags, ...values])])
            e.currentTarget.value = ''
          }
        } else if (e.key === 'Backspace' && tags.length) {
          e.preventDefault()
          onChange(tags.slice(0, -1))
        }
      }}
      placeholder={tags.length ? undefined : ' '}
      {...props}
    />
    {placeholder?.length ? (
      <Placeholder className='peer-placeholder-shown:left-2 peer-focus:left-2'>{placeholder}</Placeholder>
    ) : null}
  </div>
)

export default InputTags
