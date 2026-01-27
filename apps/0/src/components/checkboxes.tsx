'use client'

import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import { cn } from '@a/ui'
import { Checkbox } from '@a/ui/checkbox'
import Flag from '@svgr-iconkit/flag-icons'
import { lang2flag } from 'constant'

type CheckboxesProps = Omit<ComponentProps<'div'>, 'onChange' | 'value'> & {
  isFlag?: boolean
  onChange: Dispatch<SetStateAction<string[]>>
  options: string[]
  value: string[]
}

const Checkboxes = ({ className, isFlag, onChange, options, value, ...props }: CheckboxesProps) =>
  options.map(o => (
    <div
      className={cn('group flex items-center gap-1 text-sm capitalize', className)}
      key={o}
      onMouseDown={() => {
        if (value.includes(o)) onChange(value.filter(v => v !== o))
        else onChange([...value, o].toSorted())
      }}
      role='button'
      {...props}>
      <Checkbox
        checked={value.includes(o)}
        className='mx-1 transition-all duration-300 group-hover:scale-110 group-active:scale-75'
      />
      {isFlag ? (
        <Flag
          className='size-5 rounded-full shadow-sm drop-shadow-sm'
          name={lang2flag[o as keyof typeof lang2flag]}
          variant='square'
        />
      ) : null}
      {o}
    </div>
  ))

export default Checkboxes
