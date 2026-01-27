'use client'

import type { Node } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'

import { defaultMarkdownSerializer } from 'prosemirror-markdown'
import { DOMParser } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { renderToString } from 'react-dom/server'
import { Streamdown } from 'streamdown'

import type { UISuggestion } from './suggestions'

import { documentSchema } from './config'
import { createSuggestionWidget } from './suggestions'

export const buildDocumentFromContent = (content: string) => {
    const parser = DOMParser.fromSchema(documentSchema),
      stringFromMarkdown = renderToString(<Streamdown>{content}</Streamdown>),
      tempContainer = document.createElement('div')
    tempContainer.innerHTML = stringFromMarkdown
    return parser.parse(tempContainer)
  },
  buildContentFromDocument = (document: Node) => defaultMarkdownSerializer.serialize(document),
  createDecorations = (suggestions: UISuggestion[], view: EditorView) => {
    const decorations: Decoration[] = []
    for (const s of suggestions) {
      decorations.push(
        Decoration.inline(
          s.selectionStart,
          s.selectionEnd,
          { class: 'suggestion-highlight' },
          { suggestionId: s.id, type: 'highlight' }
        )
      )
      decorations.push(
        Decoration.widget(
          s.selectionStart,
          currentView => {
            const { dom } = createSuggestionWidget(s, currentView)
            return dom
          },
          { suggestionId: s.id, type: 'widget' }
        )
      )
    }
    return DecorationSet.create(view.state.doc, decorations)
  }
