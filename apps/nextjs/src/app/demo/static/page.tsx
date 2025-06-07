import { auth } from '@a/auth'

import PostCard from '~/common/post-card'
import { api } from '~/trpc/server'

const Page = async () => {
  const currentUserID = (await auth())?.user.id,
    posts = await api.post.all()
  return posts.length === 0 ? 'No post yet' : posts.map(p => <PostCard key={p.id} {...p} currentUserID={currentUserID} />)
}

export default Page
