'use client'

import type { Convo } from '@a/db/schema'

import { cn } from '@a/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ChatLink = ({ id, title }: Omit<Convo, 'messages'>) => (
  <Link
    className={cn('grow truncate rounded-lg py-2 pl-3 hover:bg-muted', usePathname().includes(id) && 'bg-muted')}
    href={`/chat/${id}`}>
    {title}
  </Link>
)

export default ChatLink
