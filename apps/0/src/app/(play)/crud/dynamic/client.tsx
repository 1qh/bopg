'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { api } from '~/trpc/react'

import { List } from '../common'
import Create from '../create'

const Client = () => {
  const { blog } = api(),
    { data: blogs } = useSuspenseQuery(blog.all.queryOptions())
  return (
    <>
      <Create />
      <List blogs={blogs} />
    </>
  )
}

export default Client
