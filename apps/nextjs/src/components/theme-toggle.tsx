'use client'

import { cn } from '@a/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@a/ui/dropdown-menu'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const ThemeToggle = ({ className }: { className?: string }) => {
  const { setTheme, theme, themes } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex h-10 gap-0 rounded-full p-1 whitespace-nowrap outline-hidden transition-all duration-300 *:size-8 *:stroke-1 *:text-muted-foreground *:transition-all *:duration-1000 *:hover:text-foreground hover:bg-background hover:font-medium hover:text-foreground hover:shadow-2xl hover:drop-shadow-xl focus-visible:ring-0',
          className
        )}>
        <Sun className='scale-110 rotate-0 dark:scale-0 dark:-rotate-180' />
        <Moon className='absolute scale-0 rotate-180 dark:scale-110 dark:rotate-0' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='mx-2 capitalize transition-all duration-500 hover:drop-shadow-xl' side='bottom'>
        <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
          {themes.map(t => (
            <DropdownMenuRadioItem key={t} value={t}>
              {t}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle
