'use client'

import { SquarePen } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NewChat = () =>
  usePathname() === '/chat' ? null : (
    <Link
      className='mx-auto mt-2 mb-3.5 flex h-12 items-center gap-2 rounded-full pr-4 pl-3 text-lg font-light tracking-tighter hover:bg-muted'
      href='/chat'>
      <SquarePen className='stroke-1' />
      New chat
    </Link>
  )

export default NewChat
