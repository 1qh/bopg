import { crud } from '../f'
import t from '../t'

export const { create, my, pub, rm, update } = crud('blog', t.blog),
  { all, list, read } = pub
