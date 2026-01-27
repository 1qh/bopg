'use client'

import { cn } from '@a/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@a/ui/dropdown-menu'
import { Bot, CircleUser, Cog, Workflow } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import authClient from '~/auth/client'
import ThemeDropdown from '~/components/theme-dropdown'

const Nav = ({ email, name }: { email?: string; name?: string }) => {
  const p = usePathname(),
    router = useRouter(),
    { refetch } = authClient.useSession(),
    logOut = async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            refetch()
            router.push('/login')
          }
        }
      })
    }

  return (
    <div className='group flex h-screen w-9 min-w-9 flex-col gap-0.5 truncate overflow-auto p-0.5 transition-all duration-500 *:w-full *:transition-all *:duration-500 hover:w-32 hover:min-w-32 hover:p-1.5'>
      {[
        { href: '/flow', Icon: Workflow },
        { href: '/solo', Icon: Bot },
        { href: '/settings', Icon: Cog }
      ].map(({ href, Icon }) => {
        const active = p.startsWith(href)
        return (
          <Link
            className={cn(
              'flex items-center rounded-md text-transparent capitalize hover:bg-muted',
              active
                ? 'bg-blue-700 group-hover:bg-muted group-hover:text-blue-700 dark:bg-blue-300'
                : 'group-hover:text-foreground'
            )}
            href={href}
            key={href}>
            <Icon
              className={cn(
                'size-8 min-w-8 stroke-[1.5] p-2 text-foreground',
                active && 'text-background group-hover:text-blue-700'
              )}
            />
            {href.slice(1)}
          </Link>
        )
      })}
      <p className='grow' />
      <DropdownMenu>
        <DropdownMenuTrigger className='flex w-full items-center rounded-md outline-0 hover:bg-muted'>
          <CircleUser className='size-8 shrink-0 stroke-[1.5] p-2 text-foreground' />
          {email ? (
            <div className='-space-y-1 text-left text-sm text-transparent *:transition-all *:duration-200'>
              <p className='font-medium group-hover:text-foreground'>{name}</p>
              <p className='text-xs group-hover:text-muted-foreground'>{email}</p>
            </div>
          ) : (
            <p className='text-xs text-transparent transition-all duration-200 group-hover:text-muted-foreground'>Guest</p>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {email ? (
            // eslint-disable-next-line @typescript-eslint/strict-void-return
            <DropdownMenuItem onClick={logOut}>Log out</DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href='/login'>Log in</Link>
            </DropdownMenuItem>
          )}
          <ThemeDropdown />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Nav
