import { crud } from '../f'
import t from '../t'

export const { create, my, pub, rm, update } = crud('message', t.message),
  { all, list, read } = pub
