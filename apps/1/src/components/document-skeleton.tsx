'use client'

import type { ArtifactKind } from './artifact'

export const DocumentSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) =>
  artifactKind === 'image' ? (
    <div className='flex h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-4'>
      <div className='size-96 animate-pulse rounded-lg bg-muted-foreground/20' />
    </div>
  ) : (
    <div className='flex w-full flex-col gap-4'>
      <div className='h-12 w-1/2 animate-pulse rounded-lg bg-muted-foreground/20' />
      <div className='h-5 w-full animate-pulse rounded-lg bg-muted-foreground/20' />
      <div className='h-5 w-full animate-pulse rounded-lg bg-muted-foreground/20' />
      <div className='h-5 w-1/3 animate-pulse rounded-lg bg-muted-foreground/20' />
      <div className='h-5 w-52 animate-pulse rounded-lg bg-transparent' />
      <div className='h-8 w-52 animate-pulse rounded-lg bg-muted-foreground/20' />
      <div className='h-5 w-2/3 animate-pulse rounded-lg bg-muted-foreground/20' />
    </div>
  )
