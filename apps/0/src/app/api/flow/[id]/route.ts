import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

import { api } from '~/trpc/server'

const GET = async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params,
    data = await api.flow.byId(id)
  if (!data) return new NextResponse('Flow not found', { status: 404 })
  const { edges, nodes } = data
  return new NextResponse(JSON.stringify({ edges, nodes }, null, 2))
}

export { GET }
