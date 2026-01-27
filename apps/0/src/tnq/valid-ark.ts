// oxlint-disable no-useless-undefined, require-hook
/* eslint-disable @typescript-eslint/no-unused-vars, max-depth */
/** biome-ignore-all lint/nursery/noUselessUndefined: x */
/** biome-ignore-all lint/correctness/noUnusedVariables: x */

import { type } from 'arktype'
import { argv, file, write } from 'bun'
import { log } from 'node:console'
import { parse } from 'node:path'
import { exit } from 'node:process'
import sortKeys from 'sort-keys'

import { cleanObj, roundNums, sortKeysFromList } from '~/utils'

import _schema from './scm'
import { md2html, percent, w } from './utils'

const errorTypes = [
    'wrongType',
    'missingValue',
    'outsideNumberRange',
    'otherValues',
    'isNull',
    'textCase',
    'redundantProperty',
    'redundantParameter',
    'other'
  ] as const,
  severityByErrorType: Record<ErrorType, Severity> = {
    isNull: 'error',
    missingValue: 'error',
    other: 'warn',
    otherValues: 'warn',
    outsideNumberRange: 'warn',
    redundantParameter: 'warn',
    redundantProperty: 'warn',
    textCase: 'warn',
    wrongType: 'error'
  },
  errorDescriptions: Record<ErrorType, string> = {
    isNull: 'The value is explicitly null, but a non-null value is expected',
    missingValue: 'The field exists, but some records have no value for it (partially missing)',
    other: 'An unspecified issue that does not fit into other categories',
    otherValues: 'The value is not one of the predefined options',
    outsideNumberRange: 'The numeric value is outside the expected range',
    redundantParameter: 'A parameter exists in raw data, but is not listed in the tracking file',
    redundantProperty: 'A property exists in raw data, but is not listed in the tracking file',
    textCase: 'The text uses the wrong letter casing (e.g., “apple” instead of “Apple”)',
    wrongType: 'The value’s data type is incorrect (e.g., string instead of number)'
  }

interface CountPercent {
  count: number
  percent?: string
}
type ErrorReport = CountPercent & {
  group: Record<ErrorType, CountPercent>
}
type ErrorType = (typeof errorTypes)[number]
type Severity = 'error' | 'warn'

const schema = _schema.merge({ '+': 'reject' }),
  errs = (o: unknown) => {
    const res = schema(o)
    return res instanceof type.errors ? res : []
  }

if (argv.length < 3 || !argv[2]?.length) {
  log('Usage: bun valid-ark.ts <file.json>')
  exit(1)
}

const out: Record<string, Record<ErrorType, unknown[]> & Record<string, string[]>> = {},
  userProps: string[] = [],
  eventNames: string[] = [],
  eventTotals: Record<string, number> = {},
  eventDataKeys: Record<string, string[]> = {},
  keyToEvents: Record<string, string[]> = {},
  countErrors: Record<Severity, Record<string, number>> = { error: {}, warn: {} },
  userPropErrors: Record<string, ErrorReport> = {},
  errorsByEvent: Record<string, Record<string, ErrorReport>> = {},
  pathByErrorType = {} as Record<ErrorType, Record<string, number>>,
  stripDoubleQuotes = (s: string) => (s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s),
  orRegex = / or |, /u,
  expect2arr = (expected: string) =>
    expected.split(orRegex).map(_v => {
      const v = _v.trim()
      if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1)
      const num = Number(v)
      if (!Number.isNaN(num)) return num
      if (v === 'true') return true
      if (v === 'false') return false
      if (v === 'null') return null
      if (v === 'undefined') return undefined
      return v
    })

for (const e of errs({ eventName: '' })) userProps.push(e.path.toString())
for (const e of errs({}))
  eventNames.push(...expect2arr(e.expected).filter((v): v is string => typeof v === 'string' && v.length > 0))

for (const en of eventNames) {
  const keys = (eventDataKeys[en] = []) as string[]
  for (const e of errs({ eventData: {}, eventName: en }))
    if (e.path.length > 1 && e.path[0] === 'eventData' && typeof e.path[1] === 'string' && e.path[1]) {
      const [, key] = e.path
      keys.push(key)
      const list = keyToEvents[key] ?? []
      if (!list.includes(en)) list.push(en)
    }
}

const input = (await file(argv[2]).json()) as object[],
  realEvents = [
    ...new Set(input.map(o => ('eventName' in o && typeof o.eventName === 'string' ? o.eventName : undefined)))
  ].filter(i => typeof i === 'string'),
  inSchemaButNotFound = eventNames.filter(en => !realEvents.includes(en)),
  notInSchema = realEvents.filter(en => !eventNames.includes(en)),
  mutualEvents = eventNames.filter(en => realEvents.includes(en)),
  todo = [...input]

for (const [idx, item] of todo.entries()) {
  out[idx] = {
    isNull: [],
    missingValue: [],
    other: [],
    otherValues: [],
    outsideNumberRange: [],
    redundantParameter: [],
    redundantProperty: [],
    textCase: [],
    wrongType: []
  }
  const en = 'eventName' in item && typeof item.eventName === 'string' ? item.eventName : undefined
  if (en) eventTotals[en] = (eventTotals[en] ?? 0) + 1
  if (en && 'eventData' in item) {
    const ed = item.eventData
    out[idx][`eventName: ${en}`] = eventDataKeys[en] ?? []
    if (en in eventDataKeys && typeof ed === 'object' && ed)
      for (const k of Object.keys(ed))
        if (!eventDataKeys[en]?.includes(k)) {
          const others = (keyToEvents[k] ?? []).filter(e => e !== en)
          out[idx].redundantParameter.push({
            error: 'redundantParameter',
            path: ['eventData', k],
            severity: severityByErrorType.redundantProperty,
            why: `"${k}" should not be in event "${en}"${others.length ? ` (should be in ${others.map(e => `"${e}"`).join(', ')})` : ''}`
          })
        }
  }
  for (const e of errs(item)) {
    let errorType: ErrorType = 'other'
    const { code, expected, message } = e,
      path = e.path.toJSON(),
      data = typeof e.data === 'object' && e.data && Object.keys(e.data).length ? undefined : e.data,
      info: Record<string, unknown> = { code, data, expected, path }
    if (message !== expected) info.message = message

    switch (code) {
      case 'after':
      case 'before':
      case 'divisor':
      case 'exactLength':
      case 'intersection':
      case 'maxLength':
      case 'minLength':
      case 'pattern':
      case 'proto':
        break
      case 'domain':
        errorType = 'wrongType'
        break
      case 'max':
      case 'min':
        errorType = 'outsideNumberRange'
        break
      case 'predicate':
        if (expected === 'removed' && data === undefined) errorType = 'redundantProperty'
        else {
          const correct = expect2arr(expected)
          if (correct.length) {
            info.correct = correct
            const wrongCase = correct.some(v => typeof v === 'string' && v.toLowerCase() === String(data).toLowerCase())
            errorType = wrongCase ? 'textCase' : 'otherValues'
          }
          if ('eventName' in item && path.length === 1 && path[0] === 'eventName') {
            const { eventName, ...withoutEvent } = item,
              todoItem = { ...withoutEvent, eventName: '' }
            todo.push(todoItem)
          }
        }
        break
      case 'required':
        errorType = 'missingValue'
        break
      case 'union': {
        if (data === null) {
          errorType = 'isNull'
          break
        }
        if (expected.includes('must be matched')) {
          errorType = 'otherValues'
          break
        }
        const correct =
          expected
            .split('must be ')[1]
            ?.split(' (was')[0]
            ?.split(' or ')
            .map(s => stripDoubleQuotes(s)) ?? []
        if (correct.length && typeof data === 'string') {
          info.correct = correct
          const wrongCase = correct.some(v => typeof v === 'string' && v.toLowerCase() === data.toLowerCase())
          errorType = wrongCase ? 'textCase' : 'otherValues'
        }
        break
      }
      case 'unit':
        if (typeof data === typeof expected)
          errorType =
            typeof expected === 'string' &&
            typeof data === 'string' &&
            data.toLowerCase() === stripDoubleQuotes(expected).toLowerCase()
              ? 'textCase'
              : 'otherValues'
        else errorType = typeof expected === typeof data ? 'other' : 'wrongType'
        break
      default:
        log(info)
    }
    if (en) info.eventName = en
    info.error = errorType
    info.severity = severityByErrorType[errorType]
    out[idx][errorType].push(info)
  }
}

const flat = Object.values(out)
  .flatMap(v => Object.values(v).flat())
  .filter(v => typeof v === 'object') as object[]

for (const e of flat)
  if ('path' in e && Array.isArray(e.path) && 'error' in e && typeof e.error === 'string') {
    const p = e.path.join('.'),
      et = e.error as ErrorType,
      severity = severityByErrorType[et]
    countErrors[severity][et] = (countErrors[severity][et] ?? 0) + 1

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    pathByErrorType[et] ??= {}
    pathByErrorType[et][p] = (pathByErrorType[et][p] ?? 0) + 1

    if (e.path.length === 1) {
      userPropErrors[p] ??= { count: 0, group: {} as Record<ErrorType, CountPercent> }
      userPropErrors[p].count += 1
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      userPropErrors[p].group[et] ??= { count: 0 }
      userPropErrors[p].group[et].count += 1
    }

    if (e.path.length === 2 && e.path[0] === 'eventData' && 'eventName' in e && typeof e.eventName === 'string') {
      const { eventName: en } = e,
        [, key] = e.path as [string, string]
      errorsByEvent[en] ??= {}
      errorsByEvent[en][key] ??= { count: 0, group: {} as Record<ErrorType, CountPercent> }
      errorsByEvent[en][key].count += 1
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      errorsByEvent[en][key].group[et] ??= { count: 0 }
      errorsByEvent[en][key].group[et].count += 1
    }
  }

for (const [k, v] of Object.entries(userPropErrors))
  if (userPropErrors[k]) {
    userPropErrors[k].percent = percent(v.count, input.length)
    for (const [et, obj] of Object.entries(v.group))
      userPropErrors[k].group[et as ErrorType].percent = percent(obj.count, input.length)
  }

for (const [en, edkCounts] of Object.entries(errorsByEvent)) {
  const curr = eventTotals[en]
  if (curr)
    for (const [edk, obj] of Object.entries(edkCounts))
      if (errorsByEvent[en]?.[edk]) {
        errorsByEvent[en][edk].percent = percent(obj.count, curr)
        for (const [et, gr] of Object.entries(obj.group))
          errorsByEvent[en][edk].group[et as ErrorType].percent = percent(gr.count, curr)
      }
}

const errorReport = { userPropErrors, ...roundNums(sortKeys(errorsByEvent)) }

await w('valid-raw.json', flat)
await w('count-report.json', { count: countErrors, total: flat.length })
await w('error-report.json', errorReport)
await w('by-error-type.json', pathByErrorType)

for (const v of Object.values(out))
  for (const et of errorTypes)
    if (['missingValue', 'redundantProperty'].includes(et))
      v[et] = (
        v[et].map(e => typeof e === 'object' && e && 'path' in e && Array.isArray(e.path) && e.path.join('.')) as string[]
      ).toSorted()
    else
      v[et] = v[et].map(e => {
        if (typeof e === 'object') {
          // @ts-expect-error - x
          const { code, correct, error, expected, message, path, severity, ...rest } = e,
            why = (message ?? expected) as string | undefined
          return { path: Array.isArray(path) ? path.join('.') : undefined, why, ...rest }
        }
        return e
      })

await w('valid.json', cleanObj(out))

log(notInSchema.length, 'found events but not in schema', notInSchema)

const dbName = parse(argv[2]).name

let md = `
- Number of Records: ${input.length}

# User Props

${userProps.length} user properties
${userProps.map(up => `- \`${up}\``).join('\n')}

# Event Data

${eventNames.length} events

|Event name|Event Params|
|-|-|
`

for (const [k, events] of Object.entries(eventDataKeys))
  md += `| \`${k}\` | ${events.map(en => `\`${en}\``).join(' ⋅ ')} |\n`

md += `

# Event Coverage

${realEvents.length} found events
${realEvents.map(en => `- \`${en}\``).join('\n')}

${inSchemaButNotFound.length} events in schema but not found
${inSchemaButNotFound.length ? inSchemaButNotFound.map(en => `- \`${en}\``).join('\n') : '- None'}

${mutualEvents.length} mutual events
${mutualEvents.map(en => `- \`${en}\``).join('\n')}
`

md += '# By Error Type\n'

for (const [et, _paths] of Object.entries(sortKeysFromList(pathByErrorType, [...errorTypes]))) {
  const paths = Object.entries(_paths).toSorted((a, b) => b[1] - a[1])
  md += `### ${et}
*${et in errorDescriptions ? errorDescriptions[et as ErrorType] : ''}*

|Field|Errors|
|-|-|
`
  for (const [path, count] of paths) md += `| ${path} | ${count} |\n`

  md += `
\`\`\`mermaid
---
config:
  xyChart:
    width: 1234
    height: ${80 + paths.length * 36}
---
xychart horizontal
x-axis [${paths.map(([path]) => `"${path}"`).join(', ')}]
bar [${paths.map(([, count]) => count).join(', ')}]
\`\`\`
`
}

for (const [eventType, prop] of Object.entries(errorReport)) {
  const isUserProp = eventType === 'userPropErrors'
  md += isUserProp ? '# By Property' : `## \`${eventType}\` (${eventTotals[eventType] ?? 0} records)`
  for (const [propName, report] of Object.entries(prop)) {
    md += `
### \`${propName}\`
- ${report.count} errors
- ${report.percent}

\`\`\`mermaid
---
config:
 xyChart:
   width: 1234
   height: ${80 + Object.keys(report.group).length * 36}
---
xychart horizontal
x-axis [${Object.keys(report.group)
      .map(et => `"${et}"`)
      .join(', ')}]
bar [${Object.values(report.group)
      .map(g => g.count)
      .join(', ')}]
\`\`\`

|Error|Percentage|
|-|-|
`
    for (const [et, gr] of Object.entries(report.group)) md += `| ${et} | ${gr.percent} |\n`
  }
  md += isUserProp ? '# By Event\n' : ''
}

await write(
  `out/${dbName}/report.html`,
  `<style>${await file('report.css').text()}</style>
${await md2html(md)}`
)
