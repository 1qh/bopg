'use client'

import { useState } from 'react'

import { Item, List } from '~/components/dnd-list'

const Page = () => {
  const [items, setItems] = useState([
    { id: 'Alice' },
    { id: 'Bob' },
    { id: 'Charlie' },
    { id: 'Christina' },
    { id: 'Daniel' },
    { id: 'Doe' },
    { id: 'Eve' },
    { id: 'Jane' },
    { id: 'John' },
    { id: 'Peggy' },
    { id: 'Trent' },
    { id: 'Victor' },
    { id: 'Walter' }
  ])

  return (
    <div className='m-2 space-y-2'>
      <List
        items={items}
        renderItem={i => (
          <Item className='w-36 rounded-xl border bg-background px-4 py-2 text-xl' id={i.id}>
            {i.id}
          </Item>
        )}
        setItems={setItems}
      />
    </div>
  )
}

export default Page
