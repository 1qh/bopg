import type { ReactNode } from 'react'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@a/ui/resizable'
import { format, formatDistance } from 'date-fns'
import { Trash } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import readable from 'pretty-bytes'

import Uploader from '~/components/img-uploader'
import { s3 } from '~/s3'

const Layout = async ({ children }: { children: ReactNode }) => (
  <ResizablePanelGroup orientation='horizontal'>
    <ResizablePanel className='overflow-auto! p-1.5' defaultSize={30} maxSize={80} minSize={10}>
      <Uploader />
      {(await s3.list()).contents?.map(({ key, lastModified, size }) => (
        <div
          className='group -my-0.5 flex items-center gap-2 rounded-lg py-1 pr-1 pl-2.5 text-xs font-light text-muted-foreground transition-all duration-300 select-none hover:bg-muted'
          key={key}>
          <Link className='flex grow items-center justify-between gap-1 overflow-hidden' href={`/gallery/${key}`}>
            <p className='text-base text-foreground transition-all duration-300 group-hover:font-medium'>{key}</p>
            {lastModified?.length ? (
              <>
                <p className='truncate group-hover:hidden'>
                  {formatDistance(lastModified, new Date(), { addSuffix: true })} · {readable(size ?? 0)}
                </p>
                <p className='hidden truncate group-hover:block'>{format(lastModified, 'PPPPpp')}</p>
              </>
            ) : null}
          </Link>
          <form
            action={async () => {
              'use server'
              await s3.delete(key)
              revalidatePath('/gallery')
            }}
            className='size-6 rounded-md transition-all duration-300 hover:scale-110 hover:bg-destructive/20 hover:text-destructive active:scale-75'>
            <button type='submit'>
              <Trash className='stroke-1 p-1' />
            </button>
          </form>
        </div>
      ))}
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel className='relative'>{children}</ResizablePanel>
  </ResizablePanelGroup>
)

export default Layout
