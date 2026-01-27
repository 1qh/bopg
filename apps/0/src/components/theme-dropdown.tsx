'use client'

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@a/ui/dropdown-menu'
import { Check } from 'lucide-react'
import { useTheme } from 'next-themes'

const ThemeDropdown = () => {
  const { setTheme, theme, themes } = useTheme()
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className='min-w-24'>
          {themes.map(t => (
            <DropdownMenuItem className='justify-between capitalize' key={t} onSelect={() => setTheme(t)}>
              {t}
              {t === theme ? <Check /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

export default ThemeDropdown
