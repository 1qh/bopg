'use client'

import { useState } from 'react'

import { Item, List } from '~/components/pangea-list'

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
    <List
      className='m-2 space-y-2'
      items={items}
      renderItem={(item, index) => (
        <Item className='w-36 rounded-xl border bg-background px-4 py-2 text-xl' id={item.id} index={index}>
          {item.id}
        </Item>
      )}
      setItems={setItems}
    />
  )
}

export default Page
