'use client'

import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import { startCase } from 'es-toolkit/string'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

import NavActive from '~/components/nav-active'

const Layout = ({ children }: { children: ReactNode }) => {
  const { id } = useParams<{ id: string }>(),
    prefix = `/solo/${id}`,
    pathname = usePathname(),
    p = pathname.replace(prefix, '')
  return (
    <>
      <div className='static top-7 left-2 mt-5 grid grid-flow-col grid-rows-4 text-sm 2xl:absolute 2xl:grid-flow-row 2xl:grid-rows-1'>
        {[
          '/business-process',
          '/call-center',
          '/client-settings',
          '/conversation-summary',
          '/custom-tools',
          '/data-collection',
          '/dynamic-variables',
          '/home',
          '/initialize-lua',
          '/interruption',
          '/other',
          '/postprocess-lua',
          '/settings',
          '/system-tools',
          '/tts',
          '/vietnamese-dictionary'
        ].map(href => {
          const active = p === href
          return (
            <Link
              className={cn(
                'relative mt-0.5 flex w-fit items-center gap-2.5 rounded-lg px-3 py-1 transition-all duration-200 hover:bg-muted',
                active ? 'bg-muted font-semibold text-foreground' : 'bg-background font-normal text-foreground/70'
              )}
              href={`${prefix}${href}`}
              key={href}>
              <NavActive active={active} />
              {href.length ? startCase(href) : 'Home'}
            </Link>
          )
        })}
      </div>
      <p className='h-10' />
      {children}
    </>
  )
}

export default Layout
