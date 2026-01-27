/* eslint-disable no-continue */
/* eslint-disable max-statements */
/** biome-ignore-all lint/nursery/noContinue: x */
import type { Session, Suggestion } from '@a/db/schema'
import type { UIMessageStreamWriter } from 'ai'

import { Output, streamText, tool } from 'ai'
import { z } from 'zod'
import { object, string } from 'zod/v4'

import type { ChatMessage } from '~/types'

import { getDocumentById, saveSuggestions } from '~/lib/db'
import { randomId } from '~/utils'

import { getArtifactModel } from '../providers'

interface RequestSuggestionsProps {
  dataStream: UIMessageStreamWriter<ChatMessage>
  session: Session
}

const requestSuggestions = ({ dataStream, session }: RequestSuggestionsProps) =>
  tool({
    description:
      'Request writing suggestions for an existing document artifact. Only use this when the user explicitly asks to improve or get suggestions for a document they have already created. Never use for general questions.',
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId })

      if (!document?.content)
        return {
          error: 'Document not found'
        }

      const suggestions: Omit<Suggestion, 'createdAt' | 'documentCreatedAt' | 'userId'>[] = [],
        { partialOutputStream } = streamText({
          model: getArtifactModel(),
          output: Output.array({
            element: object({
              description: string().describe('The description of the suggestion'),
              originalSentence: string().describe('The original sentence'),
              suggestedSentence: string().describe('The suggested sentence')
            })
          }),
          prompt: document.content,
          system:
            'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.'
        })

      let processedCount = 0
      for await (const partialOutput of partialOutputStream) {
        if (!partialOutput.length) continue

        for (let i = processedCount; i < partialOutput.length; i += 1) {
          const element = partialOutput[i]
          if (!(element?.originalSentence && element.suggestedSentence && element.description)) continue

          const suggestion = {
            description: element.description,
            documentId,
            id: randomId(),
            isResolved: false,
            originalText: element.originalSentence,
            suggestedText: element.suggestedSentence
          }

          dataStream.write({
            data: suggestion as Suggestion,
            transient: true,
            type: 'data-suggestion'
          })

          suggestions.push(suggestion)
          processedCount += 1
        }
      }

      if (session.userId) {
        const { userId } = session

        await saveSuggestions({
          suggestions: suggestions.map(suggestion => ({
            ...suggestion,
            documentCreatedAt: document.createdAt,
            userId
          }))
        })
      }

      return {
        id: documentId,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
        title: document.title
      }
    },
    inputSchema: object({
      documentId: z
        .string()
        .describe('The UUID of an existing document artifact that was previously created with createDocument')
    })
  })

export default requestSuggestions
