/* eslint-disable @typescript-eslint/no-deprecated */
import { streamObject } from 'ai'
import { object, string } from 'zod/v4'

import { codePrompt, updateDocumentPrompt } from '~/ai/prompts'
import { getArtifactModel } from '~/ai/providers'
import { createDocumentHandler } from '~/lib/artifact'

export default createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ dataStream, title }) => {
    let draftContent = ''
    const { fullStream } = streamObject({
      model: getArtifactModel(),
      prompt: title,
      schema: object({ code: string() }),
      system: codePrompt
    })
    for await (const delta of fullStream) {
      const { type } = delta
      if (type === 'object') {
        const {
          object: { code }
        } = delta
        if (code) {
          dataStream.write({ data: code, transient: true, type: 'data-codeDelta' })
          draftContent = code
        }
      }
    }
    return draftContent
  },
  onUpdateDocument: async ({ dataStream, description, document }) => {
    let draftContent = ''
    const { fullStream } = streamObject({
      model: getArtifactModel(),
      prompt: description,
      schema: object({ code: string() }),
      system: updateDocumentPrompt(document.content ?? null, 'code')
    })
    for await (const delta of fullStream) {
      const { type } = delta
      if (type === 'object') {
        const {
          object: { code }
        } = delta
        if (code) {
          dataStream.write({ data: code, transient: true, type: 'data-codeDelta' })
          draftContent = code
        }
      }
    }
    return draftContent
  }
})
