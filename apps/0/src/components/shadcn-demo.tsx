import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@a/ui/dropdown-menu'
import { Label } from '@a/ui/label'
import { RadioGroup, RadioGroupItem } from '@a/ui/radio-group'
import { Mails, Phone, Search, User2 } from 'lucide-react'

import MyInput from '~/components/input'

const buttonVariants = ['default', 'secondary', 'outline', 'destructive'] as const,
  inputs: InputConfig[] = [
    { Icon: User2, placeholder: 'name' },
    { Icon: Phone, placeholder: 'phone number' },
    { Icon: Mails, placeholder: 'email' },
    { Icon: Search, placeholder: 'search' }
  ],
  models = ['llama4', 'gemma3', 'qwen3', 'phi4', 'magistral']

interface InputConfig {
  Icon: LucideIcon
  placeholder: string
}

const ShadcnDemo = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex gap-3', className)} {...props}>
    <div className='flex w-24 flex-col gap-2'>
      {buttonVariants.map(v => (
        <Button className='capitalize' key={v} variant={v}>
          {v}
        </Button>
      ))}
    </div>
    <div className='w-48 space-y-2'>
      {inputs.map(({ Icon, placeholder }) => (
        <MyInput Icon={Icon} key={placeholder} placeholder={placeholder} />
      ))}
    </div>
    <div>
      <p className='my-2 text-sm text-muted-foreground'>Select a model</p>
      <RadioGroup defaultValue={models[0]}>
        {models.map(v => (
          <div className='flex items-center gap-3' key={v}>
            <RadioGroupItem id={v} value={v} />
            <Label htmlFor={v}>{v}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='-mt-1 ml-8'>
        <Button variant='outline'>Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Feedback</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

export default ShadcnDemo
