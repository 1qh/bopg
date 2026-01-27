import type { ComponentProps } from 'react'

import Input from './input'

const NumberInput = ({
  onChange,
  value,
  ...props
}: Omit<ComponentProps<typeof Input>, 'onChange' | 'type' | 'value'> & {
  onChange: (value: null | number) => void
  value: null | number | undefined
}) => (
  <Input
    {...props}
    onChange={e => {
      const number = e.target.valueAsNumber
      onChange(Number.isNaN(number) ? null : number)
    }}
    type='number'
    value={value ?? ''}
  />
)

export default NumberInput
