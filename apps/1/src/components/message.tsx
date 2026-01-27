/* eslint-disable complexity */
/* eslint-disable max-statements */
'use client'
import type { Vote } from '@a/db/schema'
import type { UseChatHelpers } from '@ai-sdk/react'

import { cn } from '@a/ui'
import { Message, MessageResponse } from '@a/ui/ai-elements/message'
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@a/ui/ai-elements/tool'

import type { ChatMessage } from '~/types'

import { sanitizeText } from '~/utils'

import { useDataStream } from './data-stream-provider'
import { DocumentToolResult } from './document'
import DocumentPreview from './document-preview'
import MessageActions from './message-actions'
import MessageReasoning from './message-reasoning'
import PreviewAttachment from './preview-attachment'
import Weather from './weather'

const PreviewMessage = ({
  addToolApprovalResponse,
  chatId,
  isLoading,
  isReadonly,
  message,
  vote
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  chatId: string
  isLoading: boolean
  isReadonly: boolean
  message: ChatMessage
  vote?: Vote
}) => {
  const attachmentsFromMessage = message.parts.filter(p => p.type === 'file')
  useDataStream()
  return (
    <>
      {attachmentsFromMessage.length > 0 && (
        <div className='flex justify-end gap-2'>
          {attachmentsFromMessage.map(a => (
            <PreviewAttachment
              attachment={{
                contentType: a.mediaType,
                name: a.filename ?? 'file',
                url: a.url
              }}
              key={a.url}
            />
          ))}
        </div>
      )}
      {message.parts.map((part, index) => {
        const { type } = part,
          key = `message-${message.id}-part-${index}`
        if (type === 'reasoning' && part.text.trim().length > 0)
          return <MessageReasoning isLoading={isLoading} key={key} reasoning={part.text} />
        if (type === 'text')
          return (
            <Message
              className={cn('p-0', message.role === 'user' && 'mb-3 ml-auto w-fit max-w-lg text-pretty')}
              from={message.role}
              key={key}>
              <MessageResponse>{sanitizeText(part.text)}</MessageResponse>
            </Message>
          )
        if (type === 'tool-getWeather') {
          const { state, toolCallId } = part,
            approvalId = (part as { approval?: { id: string } }).approval?.id,
            isDenied =
              state === 'output-denied' ||
              (state === 'approval-responded' &&
                (part as { approval?: { approved?: boolean } }).approval?.approved === false),
            widthClass = 'w-[min(100%,450px)]'
          if (state === 'output-available' && !('error' in part.output))
            return (
              <div className={widthClass} key={toolCallId}>
                <Weather weatherAtLocation={part.output} />
              </div>
            )
          if (isDenied)
            return (
              <div className={widthClass} key={toolCallId}>
                <Tool className='w-full' defaultOpen>
                  <ToolHeader state='output-denied' type='tool-getWeather' />
                  <ToolContent>
                    <div className='px-4 py-3 text-sm text-muted-foreground'>Weather lookup was denied.</div>
                  </ToolContent>
                </Tool>
              </div>
            )
          if (state === 'approval-responded')
            return (
              <div className={widthClass} key={toolCallId}>
                <Tool className='w-full' defaultOpen>
                  <ToolHeader state={state} type='tool-getWeather' />
                  <ToolContent>
                    <ToolInput input={part.input} />
                  </ToolContent>
                </Tool>
              </div>
            )
          return (
            <div className={widthClass} key={toolCallId}>
              <Tool className='w-full' defaultOpen>
                <ToolHeader state={state} type='tool-getWeather' />
                <ToolContent>
                  {(state === 'input-available' || state === 'approval-requested') && <ToolInput input={part.input} />}
                  {state === 'approval-requested' && approvalId ? (
                    <div className='flex items-center justify-end gap-2 border-t px-4 py-3'>
                      <button
                        className='rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                        onClick={() => {
                          addToolApprovalResponse({
                            approved: false,
                            id: approvalId,
                            reason: 'User denied weather lookup'
                          })
                        }}
                        type='button'>
                        Deny
                      </button>
                      <button
                        className='rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90'
                        onClick={() => {
                          addToolApprovalResponse({
                            approved: true,
                            id: approvalId
                          })
                        }}
                        type='button'>
                        Allow
                      </button>
                    </div>
                  ) : null}
                </ToolContent>
              </Tool>
            </div>
          )
        }
        if (type === 'tool-createDocument') {
          const { toolCallId } = part
          if (part.output && 'error' in part.output)
            return (
              <div
                className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50'
                key={toolCallId}>
                Error creating document: {String(part.output.error)}
              </div>
            )
          return <DocumentPreview isReadonly={isReadonly} key={toolCallId} result={part.output} />
        }
        if (type === 'tool-updateDocument') {
          const { toolCallId } = part
          if (part.output && 'error' in part.output)
            return (
              <div
                className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50'
                key={toolCallId}>
                Error updating document: {String(part.output.error)}
              </div>
            )
          return (
            <div className='relative' key={toolCallId}>
              <DocumentPreview args={{ ...part.output, isUpdate: true }} isReadonly={isReadonly} result={part.output} />
            </div>
          )
        }
        if (type === 'tool-requestSuggestions') {
          const { state, toolCallId } = part
          return (
            <Tool defaultOpen key={toolCallId}>
              <ToolHeader state={state} type='tool-requestSuggestions' />
              <ToolContent>
                {state === 'input-available' && <ToolInput input={part.input} />}
                {state === 'output-available' && (
                  <ToolOutput
                    errorText={undefined}
                    output={
                      'error' in part.output ? (
                        <div className='rounded-sm border p-2 text-red-500'>Error: {String(part.output.error)}</div>
                      ) : (
                        <DocumentToolResult isReadonly={isReadonly} result={part.output} type='request-suggestions' />
                      )
                    }
                  />
                )}
              </ToolContent>
            </Tool>
          )
        }
        return null
      })}
      {!isReadonly && message.role !== 'user' && (
        <MessageActions chatId={chatId} isLoading={isLoading} key={`action-${message.id}`} message={message} vote={vote} />
      )}
    </>
  )
}

export default PreviewMessage
