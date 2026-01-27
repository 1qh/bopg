import type { ReactNode } from 'react'

import { createPortal } from 'react-dom'

// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function CreatePortal({ children, id }: { children: ReactNode; id?: string }) {
  if (typeof globalThis !== 'undefined')
    /* oxlint-disable prefer-query-selector */
    return id ? createPortal(children, document.getElementById(id) ?? document.body) : children
}
