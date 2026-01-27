'use client'

import type { ReactNode } from 'react'

import { cn } from '@a/ui'
import { AudioLines, BookOpen, Brain } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { Tab } from '~/types'

const tabs: Tab[] = [
  { href: 'llm', Icon: Brain },
  { href: 'tts', Icon: AudioLines },
  { href: 'ke', Icon: BookOpen }
]

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [hoverHref, setHoverHref] = useState<null | string>(null),
    p = usePathname()
  return (
    <>
      <div className='mt-2 mr-2 mb-1 ml-4 flex items-center gap-2' id='top-nav'>
        {tabs.map(({ href, Icon, text }) => (
          <div className='group -mx-2 *:transition-all *:duration-300' key={href}>
            <Link
              className='relative flex h-10 w-22 items-center justify-center gap-1.5 text-muted-foreground hover:font-medium hover:text-foreground'
              href={`/settings/${href}`}
              key={href}
              onMouseEnter={() => setHoverHref(href)}
              onMouseLeave={() => setHoverHref(null)}>
              <AnimatePresence>
                {hoverHref === href && (
                  <motion.span
                    animate={{ opacity: 1, transition: { duration: 1 } }}
                    className='absolute inset-0 -z-1 block rounded-lg bg-input'
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    initial={{ opacity: 0 }}
                    layoutId='hoverBackground'
                  />
                )}
              </AnimatePresence>
              <Icon className='size-5 stroke-1 transition-all duration-300 group-hover:stroke-[1.5]' />
              {text ?? href.toUpperCase()}
            </Link>
            <hr
              className={cn(
                'mx-auto -mt-0.5 h-0.5 w-0',
                p.endsWith(`/${href}`) && 'w-12 bg-muted-foreground group-hover:w-15 group-hover:bg-foreground'
              )}
            />
          </div>
        ))}
        <p />
      </div>
      {children}
    </>
  )
}
export default Layout
