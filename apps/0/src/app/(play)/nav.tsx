'use client'

import { cn } from '@a/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import ThemeToggle from '~/components/theme-toggle'
import { links } from '~/constant'
import LangSwitch from '~/i18n/switch'

const Nav = () => {
  const [hover, setHover] = useState(false),
    h = {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false)
    },
    p = usePathname()
  return (
    <div
      className={cn(
        'group z-1 flex max-h-screen w-13 min-w-13 flex-col gap-1.5 rounded-r-lg bg-background p-1.5 capitalize transition-all delay-500 duration-500 select-none hover:min-w-40 hover:gap-2 hover:rounded-r-2xl hover:pr-2 hover:shadow-2xl hover:drop-shadow-2xl',
        hover && 'delay-0 hover:shadow-none hover:drop-shadow-none'
      )}>
      {links.map(({ href, Icon, title }) => (
        <div className='group/item' key={href}>
          <Link
            {...h}
            className={cn(
              (href === '/' ? p === href : p.startsWith(href)) ? 'bg-foreground text-background' : 'hover:bg-background',
              'inline-flex h-10 w-full items-center justify-start gap-0 truncate rounded-3xl px-1.5 text-[0px] font-light transition-all duration-500 group-hover:h-12 group-hover:gap-1.5 group-hover:rounded-xl group-hover:pl-2.5 group-hover:text-base hover:translate-x-3 hover:scale-105 hover:font-semibold hover:shadow-2xl hover:drop-shadow-2xl active:scale-95 [&_img]:rounded-full [&_img]:transition-all [&_img]:duration-500 [&_img]:group-hover:scale-110 [&_svg]:size-7 [&_svg]:min-w-7 [&_svg]:stroke-1 [&_svg]:p-0.5 [&_svg]:transition-all [&_svg]:duration-500 [&_svg]:group-hover/item:stroke-2 [&_svg]:group-hover/item:p-0'
            )}
            href={href}>
            <Icon />
            {title}
          </Link>
        </div>
      ))}
      <p className='grow' />
      <LangSwitch />
      <ThemeToggle />
    </div>
  )
}

export default Nav
