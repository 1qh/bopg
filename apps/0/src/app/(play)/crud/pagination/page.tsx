'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { api } from '~/trpc/react'

import { List } from '../common'
import Create from '../create'

const Page = () => {
  const { blog } = api(),
    { inView, ref } = useInView(),
    { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(
      blog.infinite.infiniteQueryOptions({ limit: 5 }, { getNextPageParam: p => p.next })
    ),
    blogs = data?.pages.flatMap(page => page.items) ?? []

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [inView, fetchNextPage])

  return (
    <>
      <Create />
      <List blogs={blogs} />
      {isFetching ? (
        <p className='mx-auto size-8 animate-spin rounded-full border-2 border-t-transparent' />
      ) : hasNextPage ? (
        <p className='h-8' ref={ref} />
      ) : null}
    </>
  )
}

export default Page
