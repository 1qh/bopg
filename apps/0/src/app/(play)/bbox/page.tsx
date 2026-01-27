'use client'

import type { Box } from '@a/db/schema'

import { Input } from '@a/ui/input'
import { useState } from 'react'

import { Annotator, BoxList } from '~/components/annotator'

const Page = () => {
  const [image, setImage] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1'),
    [boxes, setBoxes] = useState<Box[]>([]),
    insertBox = (box: Box) => setBoxes(p => [...p, box]),
    updateBox = (id: string, box: Partial<Box>) => setBoxes(p => p.map(b => (b.id === id ? { ...b, ...box } : b))),
    deleteBox = (id: string) => setBoxes(p => p.filter(b => b.id !== id)),
    tags = ['dog', 'cat', 'person', 'tree']
  return (
    <div className='flex gap-3 p-2'>
      <div className='max-w-5xl space-y-2'>
        <Input onChange={e => setImage(e.target.value)} placeholder='image URL' value={image} />
        <Annotator
          boxes={boxes}
          className=''
          deleteBox={deleteBox}
          insertBox={insertBox}
          src={image}
          tags={tags}
          updateBox={updateBox}
        />
      </div>
      <div className='w-full space-y-2'>
        <BoxList boxes={boxes} deleteBox={deleteBox} tags={tags} updateBox={updateBox} />
      </div>
    </div>
  )
}

export default Page
