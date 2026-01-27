import type { UniqueIdentifier } from '@dnd-kit/core'

interface BaseItem {
  id: UniqueIdentifier
}

interface ListProps<T extends BaseItem> {
  items: T[]
  setItems: (items: T[]) => void
}

export type { BaseItem, ListProps }
