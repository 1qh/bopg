import { api } from '~/trpc/server'

import { Author } from '../common'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params,
    blog = await api.blog.byId(Number(id))
  if (!blog) return 'Blog not found'
  const { content, title } = blog
  return (
    <div className='group'>
      <Author {...blog} />
      <p className='mt-4 mb-2 text-2xl font-medium'>{title}</p>
      <p className='whitespace-pre-line'>{content}</p>
    </div>
  )
}

export default Page
