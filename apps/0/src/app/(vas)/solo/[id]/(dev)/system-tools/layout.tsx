'use client'

import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

import NavActive from '~/components/nav-active'

const Layout = ({ children }: { children: ReactNode }) => {
  const { id } = useParams<{ id: string }>(),
    p = usePathname()
  return (
    <>
      <div className='mb-6 grid grid-cols-3 text-center font-mono text-lg tracking-tighter'>
        {['end_call', 'transfer_to_number', 'knowledge_retrieval'].map(tool => {
          const active = p.includes(tool)
          return (
            <Link
              className={cn(
                'relative rounded-full py-1.5 font-light transition-all duration-200 hover:bg-muted',
                active && 'bg-muted font-bold'
              )}
              href={`/solo/${id}/system-tools/${tool}`}
              key={tool}>
              <NavActive active={active} vertical={false} />
              {tool}
            </Link>
          )
        })}
      </div>
      {children}
    </>
  )
}

export default Layout
