'use client'

import type { ComponentProps } from 'react'

import { Textarea } from '@a/ui/textarea'

const Submit = (props: ComponentProps<'textarea'>) => (
  <Textarea
    onKeyDown={e => {
      const { key, shiftKey, target: t } = e
      if (key === 'Enter' && !shiftKey && 'form' in t) {
        e.preventDefault()
        ;(t.form as HTMLFormElement).requestSubmit()
      }
    }}
    {...props}
  />
)
export default Submit
