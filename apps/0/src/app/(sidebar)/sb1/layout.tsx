'use client'

import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import { PanelLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useState } from 'react'

import ThemeToggle from '~/components/theme-toggle'
import Tutip from '~/components/tutip'

import { navGroups } from './nav'

const Layout = ({ children }: { children: ReactNode }) => {
  const p = usePathname(),
    [expand, setExpand] = useState(true)
  return (
    <div className='relative flex w-full *:transition-all *:duration-500'>
      <PanelLeft
        className={cn(
          'absolute z-1 size-8 cursor-pointer rounded-md bg-background stroke-1 p-2 text-muted-foreground hover:bg-input hover:stroke-2 hover:text-foreground',
          expand ? 'top-2 left-42' : 'top-0.5 left-0.75'
        )}
        onClick={() => setExpand(!expand)}
      />
      <div
        className={cn(
          'h-screen truncate overflow-auto border border-r p-1 pb-11 *:transition-all *:duration-500',
          expand
            ? 'w-52 min-w-52'
            : 'no-scrollbar w-9 min-w-9 border-transparent p-0.5 pr-0 *:m-0 *:text-[0px] *:text-background'
        )}>
        <Link className='ml-2 text-3xl font-medium tracking-tighter capitalize hover:font-bold' href='/'>
          awesome
        </Link>
        <p className={cn(expand ? 'h-0' : 'h-2')} />
        {navGroups.map(({ entries, groupName }) => (
          <Fragment key={groupName}>
            <p className='mt-5 mb-1.5 ml-2 text-xs font-semibold text-muted-foreground'>{groupName}</p>
            {entries.map(({ href, Icon, title }) => (
              <Link
                className={cn(
                  'flex items-center text-sm',
                  p.includes(href) && 'bg-muted text-blue-700 dark:text-blue-300',
                  expand ? 'rounded-sm hover:bg-muted' : 'rounded-md hover:bg-input'
                )}
                href={href}
                key={href}>
                <Tutip side='right' tooltip={expand ? undefined : title}>
                  <Icon className='size-8 shrink-0 stroke-[1.5] p-2 text-foreground!' />
                </Tutip>
                {title}
              </Link>
            ))}
          </Fragment>
        ))}
      </div>
      <ThemeToggle className={cn('absolute bottom-1 bg-background delay-500', expand ? 'left-1' : '-left-10')} />
      <div className='h-screen grow'>{children}</div>
    </div>
  )
}

export default Layout
