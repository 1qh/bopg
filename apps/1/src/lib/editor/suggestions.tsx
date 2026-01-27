import type { Suggestion } from '@a/db/schema'
import type { Node } from 'prosemirror-model'
import type { Decoration, EditorView } from 'prosemirror-view'

import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet } from 'prosemirror-view'
import { createRoot } from 'react-dom/client'

import type { ArtifactKind } from '~/components/artifact'

import PreviewSuggestion from '~/components/suggestion'

interface Position {
  end: number
  start: number
}

const findPositionsInDoc = (doc: Node, searchText: string): null | Position => {
  let positions: null | { end: number; start: number } = null
  doc.nodesBetween(0, doc.content.size, (node, pos) => {
    if (node.isText && node.text) {
      const index = node.text.indexOf(searchText)
      if (index !== -1) {
        positions = {
          end: pos + index + searchText.length,
          start: pos + index
        }
        return false
      }
    }
    return true
  })
  return positions
}

export const projectWithPositions = (doc: Node, suggestions: Suggestion[]): UISuggestion[] =>
  suggestions.map(suggestion => {
    const positions = findPositionsInDoc(doc, suggestion.originalText)
    if (!positions) return { ...suggestion, selectionEnd: 0, selectionStart: 0 }
    return { ...suggestion, selectionEnd: positions.end, selectionStart: positions.start }
  })

export const suggestionsPluginKey = new PluginKey('suggestions')

export const createSuggestionWidget = (
  suggestion: UISuggestion,
  view: EditorView,
  artifactKind: ArtifactKind = 'text'
): { destroy: () => void; dom: HTMLElement } => {
  const dom = document.createElement('span'),
    root = createRoot(dom)
  dom.addEventListener('mousedown', e => {
    e.preventDefault()
    view.dom.blur()
  })
  const onApply = () => {
    const { dispatch, state } = view,
      decorationTransaction = state.tr,
      currentState = suggestionsPluginKey.getState(state) as null | { decorations?: DecorationSet },
      currentDecorations = currentState?.decorations

    if (currentDecorations) {
      const newDecorations = DecorationSet.create(
        state.doc,
        currentDecorations
          .find()
          .filter((d: Decoration) => (d.spec as { suggestionId: string }).suggestionId !== suggestion.id)
      )
      decorationTransaction.setMeta(suggestionsPluginKey, {
        decorations: newDecorations,
        selected: null
      })
      dispatch(decorationTransaction)
    }
    const textTransaction = view.state.tr.replaceWith(
      suggestion.selectionStart,
      suggestion.selectionEnd,
      state.schema.text(suggestion.suggestedText)
    )
    textTransaction.setMeta('no-debounce', true)
    dispatch(textTransaction)
  }
  root.render(<PreviewSuggestion artifactKind={artifactKind} onApply={onApply} suggestion={suggestion} />)
  return {
    destroy: () => {
      setTimeout(() => {
        root.unmount()
      }, 0)
    },
    dom
  }
}

export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  props: {
    decorations(state) {
      return this.getState(state)?.decorations ?? DecorationSet.empty
    }
  },
  state: {
    apply: (tr, state) => {
      const newDecorations = tr.getMeta(suggestionsPluginKey) as undefined | { decorations: DecorationSet; selected: null }
      if (newDecorations) return newDecorations
      return {
        // oxlint-disable unicorn/no-array-method-this-argument
        decorations: state.decorations.map(tr.mapping, tr.doc),
        selected: state.selected
      }
    },
    init: () => ({ decorations: DecorationSet.empty, selected: null })
  }
})

export interface UISuggestion extends Suggestion {
  selectionEnd: number
  selectionStart: number
}
