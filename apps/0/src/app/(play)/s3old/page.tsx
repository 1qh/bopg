/* eslint-disable @typescript-eslint/no-unnecessary-type-conversion */

import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { format, formatDistance } from 'date-fns'
import { Trash } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import readable from 'pretty-bytes'

import { FORMDATA_ENTRY } from '~/constant'

import { s3 } from './s3'

const Page = async () => (
  <>
    <form
      action={async (formData: FormData) => {
        'use server'
        const files = formData.getAll(FORMDATA_ENTRY) as File[]
        await Promise.all(files.map(async f => s3.putObject(f.name, Buffer.from(await f.arrayBuffer()), f.type)))
        revalidatePath('/s3old')
      }}
      className='my-3 flex'>
      <Input className='w-fit' multiple name={FORMDATA_ENTRY} type='file' />
      <Button variant='ghost'>Upload</Button>
    </form>
    {(await s3.listObjects())?.map(({ Key, LastModified, Size }) => (
      <div
        className='group -my-1 mr-0.5 flex items-center gap-2 rounded-lg py-1 pr-1 pl-2.5 text-xs text-muted-foreground transition-all duration-300 select-none *:transition-all *:duration-300 hover:bg-muted'
        key={Key}>
        <Link className='grow text-base font-light text-foreground group-hover:font-medium' href={`/s3old/${Key}`}>
          {Key}
        </Link>
        <p className='group-hover:hidden'>
          {formatDistance(LastModified, new Date(), { addSuffix: true })} · {readable(Number(Size))}
        </p>
        <p className='hidden group-hover:block'>{format(LastModified, 'PPPPpp')}</p>
        <form
          action={async () => {
            'use server'
            await s3.deleteObject(Key)
            revalidatePath('/s3old')
          }}
          className='size-6 rounded-md hover:scale-110 hover:bg-destructive/20 hover:text-destructive active:scale-75'>
          <button type='submit'>
            <Trash className='stroke-1 p-1' />
          </button>
        </form>
      </div>
    ))}
  </>
)

export default Page
