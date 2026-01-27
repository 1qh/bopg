import { Select, SelectContent, SelectItem, SelectValue } from '@a/ui/select'
import Flag from '@svgr-iconkit/flag-icons'
import iso from 'iso-639-1'
import { useLocale } from 'next-intl'
import { Select as SelectPrimitive } from 'radix-ui'

import type { Locale } from './config'

import { flag, locales } from './config'
import { set } from './locale'

const LangSwitch = () => (
  // eslint-disable-next-line @typescript-eslint/strict-void-return
  <Select defaultValue={useLocale()} onValueChange={set}>
    <SelectPrimitive.Trigger className='items-center px-1 font-light text-muted-foreground transition-all duration-300 outline-none *:flex *:items-center *:gap-1.5 *:truncate *:[&_svg]:size-8 *:[&_svg]:min-w-8'>
      <SelectValue />
    </SelectPrimitive.Trigger>
    <SelectContent>
      {locales.map(l => (
        <SelectItem key={l} value={l}>
          <Flag className='size-6 shrink-0 rounded-full' name={flag[l as Locale]} variant='square' />
          {iso.getNativeName(l)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default LangSwitch
