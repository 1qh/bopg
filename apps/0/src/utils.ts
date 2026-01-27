/* eslint-disable max-statements */
/** biome-ignore-all lint/nursery/noForIn: x */

import type { Box } from '@a/db/schema'

import type { Stat } from './types'

const B64_REGEX = /^data:image\/[a-zA-Z]+;base64,/u,
  cleanUnknown = (v: unknown): unknown => {
    if (
      v === null ||
      v === undefined ||
      v === '' ||
      (typeof v === 'string' && ['nan', 'none', 'null'].includes(v.toLowerCase())) ||
      (Array.isArray(v) && v.length === 0)
    )
      return
    if (Array.isArray(v)) {
      const a = v.map(cleanUnknown).filter(Boolean)
      return a.length ? a : undefined
    }
    if (typeof v === 'object') {
      const o: Record<string, unknown> = {}
      let h = false
      for (const [k, val] of Object.entries(v)) {
        const c = cleanUnknown(val)
        if (c !== undefined) {
          o[k] = c
          h = true
        }
      }
      return h ? o : undefined
    }
    if (typeof v === 'string') {
      const s = v
        .trim()
        .replaceAll(/\n{3,}/gu, '\n\n')
        .replaceAll(/ {2,}/gu, ' ')
      return s.length ? s : undefined
    }
    return v
  }

export const isText = (type: string) => ['text', 'json', '=utf-8'].some(t => type.includes(t)),
  tagPredictPercent = (bs: Box[]) => {
    const correct = bs.filter(({ predict, tag }) => tag && predict && tag === predict).length,
      incorrect = bs.filter(({ predict, tag }) => tag && predict && tag !== predict).length,
      unpredicted = bs.filter(({ predict }) => !predict).length,
      untagged = bs.filter(({ tag }) => !tag).length
    return { correct, incorrect, unpredicted, untagged }
  },
  url2b64 = (url: string) => url.replace(B64_REGEX, ''),
  roundNums = <T>(obj: T, deci = 2): T => {
    if (obj === null || typeof obj !== 'object') {
      if (typeof obj === 'number') return Number((Math.round(obj * 100) / 100).toFixed(deci)) as T
      return obj
    }
    if (Array.isArray(obj)) return obj.map((item: unknown) => roundNums(item, deci)) as T
    const res: Record<string, unknown> = {}
    for (const k in obj) if (Object.hasOwn(obj, k)) res[k] = roundNums(obj[k], deci)
    return res as T
  },
  cleanObj = <T>(obj: T): T => cleanUnknown(obj) as T,
  sortKeysFromList = <T>(o: T, l: string[]): T => {
    if (typeof o !== 'object' || o === null) return o
    const keys = Object.keys(o),
      out: Record<string, unknown> = {}
    for (const k of [...l, ...keys]) if (keys.includes(k)) out[k] = o[k as keyof T]
    return out as T
  },
  removeKeys = <T extends Record<string, unknown>>(obj: T, keysToRemove: string[]) => {
    const res: Record<string, unknown> = {}
    for (const key in obj) if (Object.hasOwn(obj, key) && !keysToRemove.includes(key)) res[key] = obj[key]
    return res as T
  },
  renameKeys = <T extends Record<string, unknown>>(obj: T, keyMap: Record<string, string>) => {
    const res: Record<string, unknown> = {}
    for (const key in obj)
      if (Object.hasOwn(obj, key)) {
        const newKey = keyMap[key] ?? key
        res[newKey] = obj[key]
      }
    return res as T
  },
  boxesStat = (a: Box[]) => {
    const countMap: Record<string, number> = {},
      predMap: Record<string, number> = {},
      correctMap: Record<string, number> = {}
    for (const { predict, tag } of a)
      if (tag && predict) {
        countMap[tag] = (countMap[tag] ?? 0) + 1
        predMap[predict] = (predMap[predict] ?? 0) + 1
        if (tag === predict) correctMap[tag] = (correctMap[tag] ?? 0) + 1
      }
    const o: Record<string, Stat> = {}
    for (const k of new Set([...Object.keys(countMap), ...Object.keys(predMap)])) {
      const correct = correctMap[k] ?? 0,
        count = countMap[k] ?? 0,
        pred = predMap[k] ?? 0,
        precis = pred ? correct / pred : 0,
        recall = count ? correct / count : 0
      o[k] = {
        correct,
        count,
        f1: precis + recall ? (2 * precis * recall) / (precis + recall) : 0,
        precision: precis,
        recall
      }
    }
    return roundNums(o)
  }
