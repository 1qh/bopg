'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import PostCard from '~/common/post-card'
import { api } from '~/trpc/react'

const Page = () => {
  const session = useSession(),
    currentUserID = session.data?.user.id,
    { post } = api(),
    { inView, ref } = useInView(),
    { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(
      post.infinite.infiniteQueryOptions({ limit: 5 }, { getNextPageParam: p => p.next })
    ),
    posts = data?.pages.flatMap(page => page.items) ?? []

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [inView, fetchNextPage])

  return (
    <>
      {posts.length
        ? posts.map(p => <PostCard key={p.id} {...p} currentUserID={currentUserID} />)
        : !isFetching && 'No post yet'}
      {isFetching ? (
        <p className='mx-auto size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent' />
      ) : hasNextPage ? (
        <p className='h-8' ref={ref} />
      ) : null}
    </>
  )
}

export default Page
