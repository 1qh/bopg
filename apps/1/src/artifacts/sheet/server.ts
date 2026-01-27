/* eslint-disable max-statements, @typescript-eslint/no-deprecated */
import { streamObject } from 'ai'
import { object, string } from 'zod/v4'

import { sheetPrompt, updateDocumentPrompt } from '~/ai/prompts'
import { getArtifactModel } from '~/ai/providers'
import { createDocumentHandler } from '~/lib/artifact'

export default createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ dataStream, title }) => {
    let draftContent = ''
    const { fullStream } = streamObject({
      model: getArtifactModel(),
      prompt: title,
      schema: object({ csv: string().describe('CSV data') }),
      system: sheetPrompt
    })
    for await (const delta of fullStream) {
      const { type } = delta
      if (type === 'object') {
        const {
          object: { csv }
        } = delta
        if (csv) {
          dataStream.write({ data: csv, transient: true, type: 'data-sheetDelta' })
          draftContent = csv
        }
      }
    }
    dataStream.write({ data: draftContent, transient: true, type: 'data-sheetDelta' })
    return draftContent
  },
  onUpdateDocument: async ({ dataStream, description, document }) => {
    let draftContent = ''
    const { fullStream } = streamObject({
      model: getArtifactModel(),
      prompt: description,
      schema: object({ csv: string() }),
      system: updateDocumentPrompt(document.content ?? null, 'sheet')
    })
    for await (const delta of fullStream) {
      const { type } = delta
      if (type === 'object') {
        const {
          object: { csv }
        } = delta
        if (csv) {
          dataStream.write({ data: csv, transient: true, type: 'data-sheetDelta' })
          draftContent = csv
        }
      }
    }
    return draftContent
  }
})
