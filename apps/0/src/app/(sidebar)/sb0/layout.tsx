'use client'

import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import { PanelLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import ThemeToggle from '~/components/theme-toggle'

const Layout = ({ children }: { children: ReactNode }) => {
  const [expand, setExpand] = useState(true)
  return (
    <div className='relative flex w-full *:transition-all *:duration-500'>
      <PanelLeft
        className={cn(
          'absolute z-1 cursor-pointer rounded-md stroke-1 text-muted-foreground hover:stroke-2 hover:text-foreground',
          expand ? 'top-2 left-42 size-8 p-1.5 hover:bg-background' : 'top-1 left-1 size-6 p-1 hover:bg-input'
        )}
        onClick={() => setExpand(!expand)}
      />
      <div
        className={cn(
          'bg-linear-to-r from-background to-input p-1 *:transition-all *:duration-300',
          expand ? 'w-52 min-w-52' : 'w-0 min-w-0 p-0'
        )}>
        <Link className='ml-2 text-3xl font-medium tracking-tighter capitalize hover:font-bold' href='/'>
          awesome
        </Link>
        <p className='h-2' />
        {['home', 'about', 'contact'].map(i => (
          <Link
            className='-my-px block rounded-md border border-transparent px-2 py-0.5 font-light text-muted-foreground capitalize hover:border-border hover:bg-background hover:font-medium hover:text-foreground hover:drop-shadow-2xl'
            href={`/${i}`}
            key={i}>
            {i}
          </Link>
        ))}
      </div>
      <ThemeToggle className={cn('absolute bottom-1 delay-500', expand ? 'left-1' : '-left-10')} />
      <div className={cn('h-screen grow bg-input', expand && 'p-2 pl-0')}>
        <div
          className={cn(
            'h-full rounded-[1px] bg-background transition-all delay-200 duration-1000',
            expand && 'rounded-3xl'
          )}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
