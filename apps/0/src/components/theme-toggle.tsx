'use client'

import { cn } from '@a/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const ThemeToggle = ({ className }: { className?: string }) => {
  const { setTheme, theme, themes } = useTheme()
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'flex size-10 items-center justify-center rounded-full text-muted-foreground outline-hidden transition-all duration-300 *:rotate-180 *:stroke-1 *:transition-all *:duration-1000 hover:bg-muted hover:text-foreground focus-visible:ring-0 *:dark:rotate-0',
          className
        )}>
        <Sun className='size-8 dark:size-0' />
        <Moon className='size-0 dark:size-8' />
      </PopoverTrigger>
      <PopoverContent className='my-1 w-fit -space-y-1 rounded-xl p-1' side='right'>
        {themes.map(t => (
          <button
            className='flex w-full items-center justify-between gap-1 rounded-lg p-1.5 pl-2 text-muted-foreground capitalize hover:bg-muted hover:text-foreground'
            key={t}
            onClick={() => setTheme(t)}
            type='button'
            value={t}>
            {t}
            {t === theme ? <Check className='stroke-1 text-green-500' /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export default ThemeToggle
