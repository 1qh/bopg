import { getSession } from '~/auth/server'

import Delete from './delete'
import Update from './update'

const Page = async () => {
  const session = await getSession()
  return (
    <>
      <Update />
      <div className='mt-10 flex items-center justify-between rounded-lg border border-destructive bg-destructive/5 p-6'>
        <p className='ml-2 text-sm font-light text-destructive'>Danger Zone</p>
        <Delete disabled={!session} />
      </div>
    </>
  )
}

export default Page
