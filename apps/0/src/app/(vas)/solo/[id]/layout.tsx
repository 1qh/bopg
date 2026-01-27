'use client'

import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import Flag from '@svgr-iconkit/flag-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { lang2flag } from 'constant'
import { useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import NavActive from '~/components/nav-active'
import { api } from '~/trpc/react'

const Layout = ({ children }: { children: ReactNode }) => {
  const { id } = useParams<{ id: string }>(),
    { solo } = api(),
    { data } = useSuspenseQuery(solo.byId.queryOptions(id, { enabled: typeof id === 'string' })),
    prefix = `/solo/${id}`,
    pathname = usePathname(),
    p = pathname.replace(prefix, ''),
    ref = useRef<HTMLDivElement>(null),
    { scrollYProgress } = useScroll({ container: ref }),
    [down, setDown] = useState(true),
    [mouseY, setMouseY] = useState(0),
    hide = down && mouseY > 50

  useMotionValueEvent(scrollYProgress, 'change', v => {
    const prev = scrollYProgress.getPrevious()
    if (prev) setDown(v > prev)
  })
  useEffect(() => {
    const h = (e: MouseEvent) => setMouseY(e.clientY)
    globalThis.addEventListener('mousemove', h)
    return () => globalThis.removeEventListener('mousemove', h)
  }, [])
  return (
    <div className='relative h-screen overflow-auto pb-10' ref={ref}>
      <Link
        className='sticky top-2 left-1 flex w-fit items-center gap-2 rounded-full py-1 pr-2 pl-3 transition-all duration-200 hover:bg-muted'
        href={prefix}>
        {data?.title}
        <Flag className='size-5 rounded-full' name={lang2flag[data?.language ?? 'english']} variant='square' />
      </Link>
      <div
        className={cn(
          'fixed left-1/2 z-1 flex -translate-x-1/2 rounded-xl bg-background/50 text-center capitalize backdrop-blur-sm transition-all duration-300',
          hide ? '-top-12' : 'top-1'
        )}>
        {['agent', 'memory', 'voice', 'analysis', 'advanced'].map(s => {
          const active = p.endsWith(`/${s}`)
          return (
            <Link
              className={cn(
                'relative w-28 rounded-xl py-1.5 transition-all duration-200 hover:bg-muted',
                active && 'bg-background'
              )}
              href={`${prefix}/${s}`}
              key={s}>
              {s}
              <NavActive active={active} className='transition-none' vertical={false} />
            </Link>
          )
        })}
      </div>
      <div className='mx-auto max-w-5xl'>{children}</div>
    </div>
  )
}

export default Layout
