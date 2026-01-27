import { type } from 'arktype'

// oxlint-disable-next-line no-promise-executor-return, avoid-new
export const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms)),
  s = (max?: number) => type('string.trim').to(max ? `0 < string <= ${max}` : 'string > 0')
