import type { Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { RefObject } from 'react'

import { textblockTypeInputRule } from 'prosemirror-inputrules'
import { NodeType, Schema } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'

import { buildContentFromDocument } from './functions'

export const documentSchema = new Schema({
    marks: schema.spec.marks,
    nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block')
  }),
  headingRule = (level: number) =>
    textblockTypeInputRule(
      new RegExp(`^(#{1,${level}})\\s$`, 'u'),
      documentSchema.nodes.heading ?? NodeType.prototype,
      () => ({ level })
    ),
  handleTransaction = ({
    editorRef,
    onSaveContent,
    transaction
  }: {
    editorRef: RefObject<EditorView | null>
    onSaveContent: (updatedContent: string, debounce: boolean) => void
    transaction: Transaction
  }) => {
    if (!editorRef.current) return
    const newState = editorRef.current.state.apply(transaction)
    editorRef.current.updateState(newState)
    if (transaction.docChanged && !transaction.getMeta('no-save')) {
      const updatedContent = buildContentFromDocument(newState.doc)
      if (transaction.getMeta('no-debounce')) onSaveContent(updatedContent, false)
      else onSaveContent(updatedContent, true)
    }
  }
