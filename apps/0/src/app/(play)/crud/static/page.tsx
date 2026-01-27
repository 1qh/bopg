import { api } from '~/trpc/server'

import { List } from '../common'
import Create from '../create'

const Page = async () => {
  const blogs = await api.blog.all()
  return (
    <>
      <Create />
      <List blogs={blogs} />
    </>
  )
}

export default Page
