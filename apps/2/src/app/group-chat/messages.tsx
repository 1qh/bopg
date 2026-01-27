'use client'

import { api } from '@a/cv'
import { cn } from '@a/ui'
import { ConversationContent } from '@a/ui/ai-elements/conversation'
import { Spinner } from '@a/ui/spinner'
import { useMutation, usePaginatedQuery } from 'convex/react'
import { Check, Pencil, Trash, X } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

const Messages = ({ userId }: { userId: string }) => {
  const rm = useMutation(api.message.rm),
    edit = useMutation(api.message.update),
    [activeEdit, setActiveEdit] = useState<null | string>(null),
    { loadMore, results, status } = usePaginatedQuery(api.message.list, {}, { initialNumItems: 5 }),
    { inView, ref } = useInView({ delay: 1000, threshold: 1 }),
    mess = results.toReversed()

  useEffect(() => {
    if (inView) loadMore(5)
  }, [inView, loadMore])

  return (
    <ConversationContent className='gap-px'>
      {status === 'LoadingMore' ? (
        <Spinner className='m-auto' />
      ) : status === 'CanLoadMore' ? (
        <p className='h-8' ref={ref} />
      ) : status === 'Exhausted' ? (
        <Check className='m-auto animate-[fadeOut_2s_forwards] text-green-500' />
      ) : null}
      {mess.map(({ _id: id, author, body, userId: authorId }, i) => {
        const me = authorId === userId,
          next = mess[i + 1],
          prev = mess[i - 1],
          nextSame = next?.userId === authorId,
          prevSame = prev?.userId === authorId,
          isEditing = activeEdit === id
        return (
          <Fragment key={id}>
            {author && !prevSame ? (
              <p className={cn('mx-1 text-xs text-muted-foreground', me ? 'text-right' : 'text-left')}>
                {author.name ?? author.email}
              </p>
            ) : null}
            {/** biome-ignore lint/a11y/noStaticElementInteractions: x */}
            {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: x */}
            <div
              className={cn(
                'group relative rounded-2xl px-3 py-1 transition-all duration-500',
                isEditing && 'rounded-4xl px-5 py-2 text-xl',
                me ? 'self-end bg-foreground text-background' : 'self-start border',
                activeEdit && activeEdit !== id && 'bg-border',
                nextSame && (me ? 'rounded-br-none' : 'rounded-bl-none'),
                prevSame && (me ? 'rounded-tr-none' : 'rounded-tl-none')
              )}
              contentEditable={isEditing}
              // eslint-disable-next-line @typescript-eslint/strict-void-return
              onBlur={async e => {
                if (isEditing) {
                  const { textContent } = e.currentTarget
                  if (textContent && textContent !== body) await edit({ body: textContent, id })
                  setActiveEdit(null)
                }
              }}
              suppressContentEditableWarning>
              {body}
              <div
                className={cn(
                  'absolute top-1/2 -left-16 flex -translate-y-1/2 cursor-pointer flex-row-reverse items-center pr-3 transition-all *:size-7 *:rounded-md *:stroke-1 *:p-1 *:transition-all *:duration-300 group-hover:opacity-100 *:hover:scale-105',
                  !isEditing && 'gap-px opacity-0 group-hover:opacity-100'
                )}>
                {me ? (
                  isEditing ? (
                    <>
                      <Check
                        className='text-green-500 hover:bg-green-500/20'
                        onClick={() => {
                          const el = document.querySelector(`[contenteditable="true"]`)
                          if (el) (el as HTMLElement).blur()
                        }}
                      />
                      <X
                        className='text-destructive hover:bg-destructive/20'
                        onClick={() => {
                          setActiveEdit(null)
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Pencil
                        className='text-muted-foreground hover:bg-muted hover:text-foreground'
                        // eslint-disable-next-line @typescript-eslint/strict-void-return
                        onClick={async () => {
                          setActiveEdit(id)
                          await Promise.resolve()
                          const el = document.querySelector(`[contenteditable="true"]`)
                          if (el) (el as HTMLElement).focus()
                        }}
                      />
                      <Trash
                        className='text-muted-foreground hover:bg-destructive/20 hover:text-destructive'
                        onClick={() => {
                          rm({ id })
                        }}
                      />
                    </>
                  )
                ) : null}
              </div>
            </div>
          </Fragment>
        )
      })}
    </ConversationContent>
  )
}

export default Messages
