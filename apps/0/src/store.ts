import type { z } from 'zod/v4'

import { atomWithStorage as aT } from 'jotai/utils'

import type { message } from '~/schema'

export const messageAtom = aT<z.infer<typeof message>[]>('messages', []),
  jobIdsAtom = aT<string[]>('jobIds', [])
