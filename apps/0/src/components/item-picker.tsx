import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { useState } from 'react'

const ItemPicker = ({ items, onSubmit }: { items: string[]; onSubmit: (item: string) => void }) => {
  const [select, setSelect] = useState<string | undefined>(),
    [other, setOther] = useState<string | undefined>()
  return (
    <>
      {items.map(i => (
        <button
          className={cn(
            'w-full rounded-lg border px-3 py-1.5 text-left transition-all hover:border-muted-foreground',
            select === i && 'border-green-500 hover:border-green-500'
          )}
          key={i}
          onClick={() => {
            if (select === i) setSelect(undefined)
            else {
              setSelect(i)
              setOther(undefined)
            }
          }}
          type='button'>
          {i}
        </button>
      ))}
      <button
        className={cn(
          'w-full rounded-lg border px-3 py-1.5 text-left transition-all hover:border-muted-foreground',
          other !== undefined && 'border-green-500 hover:border-green-500'
        )}
        onClick={() => {
          setSelect(undefined)
          setOther('')
        }}
        type='button'>
        Other
      </button>
      {other === undefined ? null : (
        <Input onChange={e => setOther(e.target.value)} placeholder='Type your choice...' value={other} />
      )}
      <Button
        disabled={!(select ?? other)}
        onClick={() => {
          if (select) onSubmit(select)
          if (other) onSubmit(other)
        }}>
        Submit
      </Button>
    </>
  )
}

export default ItemPicker
