'use client'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { sleep } from 'utils'

import type { UISuggestion } from '~/lib/editor/suggestions'

import type { ArtifactKind } from './artifact'

interface SuggestionProps {
  artifactKind: ArtifactKind
  onApply: () => void
  suggestion: UISuggestion
}

const PreviewSuggestion = ({ artifactKind, onApply, suggestion }: SuggestionProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        asChild
        className={cn('cursor-pointer p-0.5 text-muted-foreground transition-all hover:p-0', {
          'absolute -right-8': artifactKind === 'text',
          'sticky top-0 right-4': artifactKind === 'code'
        })}>
        <MessageSquareText />
      </PopoverTrigger>
      <PopoverContent className='rounded-3xl' side='left'>
        {suggestion.description}
        <Button
          className='mt-2.5 ml-auto block rounded-full'
          // eslint-disable-next-line @typescript-eslint/strict-void-return
          onClick={async () => {
            setOpen(false)
            await sleep(300)
            onApply()
          }}>
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export default PreviewSuggestion
