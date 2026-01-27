/* eslint-disable complexity, max-statements, no-continue */
/** biome-ignore-all lint/nursery/noForIn: x */
/** biome-ignore-all lint/nursery/noContinue: x */
// oxlint-disable require-hook

import { argv, file, write } from 'bun'
import { log } from 'node:console'
import { exit } from 'node:process'
import sortKeys from 'sort-keys'

import { removeKeys, renameKeys, roundNums, sortKeysFromList } from '~/utils'

import type { Metadata } from './constant'
import type { Constraint, SchemaType } from './gen'

import { autoCollect } from './constant'
import { constraintTable, md2html, percent, w } from './utils'

const eventNameKey = 'event_name',
  errorTypes = ['redundant', 'wrongType', 'missing', 'outsideNumberRange', 'otherValues', 'isNull', 'textCase'] as const,
  errorDescriptions: Record<ErrorType, string> = {
    isNull: 'The value is explicitly null, but a non-null value is expected',
    missing: 'The field exists, but some records have no value for it (partially missing)',
    otherValues: 'The value is not one of the predefined options',
    outsideNumberRange: 'The numeric value is outside the expected range',
    redundant: 'A property exists in raw data, but is not listed in the tracking file',
    textCase: 'The text uses the wrong letter casing (e.g., “apple” instead of “Apple”)',
    wrongType: 'The value’s data type is incorrect (e.g., string instead of number)'
  }

interface CountPercent {
  count: number
  percent?: string
}
interface ErrorItem {
  error: ErrorType
  eventName?: string
  expect?: number | number[] | string | string[]
  k: string
  v?: boolean | null | number | string
}
type ErrorReport = CountPercent & {
  group: Record<ErrorType, CountPercent>
}
type ErrorType = (typeof errorTypes)[number]

interface InputData {
  data: Record<string, unknown>[]
  metadata: Metadata
}

if (argv.length < 4) {
  log('Usage: bun valid.ts <schema.json> <data.json>')
  exit(1)
}
const [schemaFile, dataFile] = argv.slice(2)

if (!(schemaFile && dataFile)) {
  log('Error: Missing schema or data file path.')
  exit(1)
}

const { events, userProperties } = (await file(schemaFile).json()) as SchemaType,
  eventNames = events.map(({ eventName }) => eventName),
  userPropKeys = new Set(userProperties.map(({ key }) => key)),
  eventParamKeys = new Set(events.flatMap(({ eventData }) => eventData.map(({ key }) => key))),
  appropriateKeys = new Set<string>([eventNameKey, ...eventParamKeys, ...userPropKeys]),
  {
    data,
    metadata: {
      appVersion,
      db,
      sdk,
      time: { end, start }
    }
  } = (await file(dataFile).json()) as InputData,
  { events: sdkEvents, props: sdkProps } = autoCollect[sdk],
  input = data.map(r =>
    removeKeys(
      renameKeys(r, {
        'ev_params.level': 'level',
        'user_props.current_level': 'current_level'
      }),
      ['traffic']
    )
  ),
  keyCounts = {} as Record<string, number>

for (const record of input)
  for (const key in record)
    if (Object.hasOwn(record, key)) {
      if (!(key in keyCounts)) keyCounts[key] = 0
      keyCounts[key] = (keyCounts[key] ?? 0) + 1
    }

const keysInAllRecords = Object.entries(keyCounts)
    .filter(([, count]) => count === input.length)
    .map(([key]) => key),
  propsToClean = new Set<string>(sdkProps)

for (const key of keysInAllRecords) if (!appropriateKeys.has(key)) propsToClean.add(key)

const realEvents = [...new Set(input.map(o => (typeof o[eventNameKey] === 'string' ? o[eventNameKey] : undefined)))]
    .filter(i => typeof i === 'string')
    .toSorted(),
  autoCollectEvents = realEvents.filter(en => sdkEvents.includes(en)).toSorted(),
  missingEvents = eventNames.filter(en => !realEvents.includes(en)).toSorted(),
  matchedEvents = eventNames.filter(en => realEvents.includes(en)).toSorted(),
  invalidEvents = realEvents.filter(
    en => !(autoCollectEvents.includes(en) || matchedEvents.includes(en) || missingEvents.includes(en))
  ),
  realKeys = [...new Set<string>(input.flatMap(r => Object.keys(r)))].toSorted(),
  autoCollectKeys = realKeys.filter(k => sdkProps.includes(k)).toSorted(),
  matchedUserProps = [...userPropKeys].filter(k => realKeys.includes(k)).toSorted(),
  matchedEventParams = [...eventParamKeys].filter(k => realKeys.includes(k)).toSorted(),
  missingUserProps = new Set<string>(),
  missingEventParams = {} as Record<string, string[]>

for (const key of userPropKeys) if (keyCounts[key] === undefined) missingUserProps.add(key)

for (const { eventData, eventName } of events)
  for (const { key: k } of eventData)
    if (keyCounts[k] === undefined && matchedEvents.includes(eventName)) {
      if (!(eventName in missingEventParams)) missingEventParams[eventName] = []
      missingEventParams[eventName]?.push(k)
    }

const propSchema = userProperties.filter(up => !missingUserProps.has(up.key)),
  eventSchema = events
    .filter(e => matchedEvents.includes(e.eventName))
    .map(e => {
      if (e.eventName in missingEventParams && missingEventParams[e.eventName])
        return {
          ...e,
          eventData: e.eventData.filter(ed => !missingEventParams[e.eventName]?.includes(ed.key))
        }
      return e
    }),
  raw = input.map(r => {
    const newRecord = {} as Record<string, unknown>
    for (const key in r) if (!propsToClean.has(key)) newRecord[key] = r[key]
    return newRecord
  }) as Record<string, boolean | number | string>[],
  badRecords = raw.filter(
    r => !(eventNameKey in r) || (typeof r[eventNameKey] === 'string' && !eventNames.includes(r[eventNameKey]))
  ),
  goodRecords = raw.filter(r => typeof r[eventNameKey] === 'string' && eventNames.includes(r[eventNameKey]))

if (badRecords.length + goodRecords.length !== raw.length) throw new Error('Record counting error!')

await w('bad.json', badRecords)
await w('good.json', goodRecords)

const scan = (record: Record<string, boolean | null | number | string>, constraints: Constraint[]): ErrorItem[] => {
    const errors: ErrorItem[] = []
    for (const { key: k } of propSchema) if (!Object.hasOwn(record, k)) errors.push({ error: 'missing', k })
    for (const k in record)
      if (Object.hasOwn(record, k) && k !== eventNameKey) {
        const v = record[k]
        if (v === null) {
          errors.push({ error: 'isNull', k, v })
          continue
        }
        const schema = constraints.find(ps => ps.key === k)
        if (schema === undefined) {
          errors.push({ error: 'redundant', k })
          continue
        }
        const { type } = schema

        if (typeof v !== type) {
          errors.push({ error: 'wrongType', expect: type, k, v })
          continue
        }
        if ('number' in schema && 'operator' in schema && typeof v === 'number') {
          const { number, operator } = schema,
            error = 'outsideNumberRange'
          if (operator === '>' && !(v > number)) errors.push({ error, expect: `> ${number}`, k, v })
          else if (operator === '>=' && !(v >= number)) errors.push({ error, expect: `>= ${number}`, k, v })
        }
        if ('valueEnum' in schema) {
          const { valueEnum } = schema
          if (Array.isArray(valueEnum) && !(valueEnum as unknown[]).includes(v))
            if (
              typeof v === 'string' &&
              valueEnum.every(ve => typeof ve === 'string') &&
              valueEnum.some(ve => ve.toLowerCase() === v.toLowerCase())
            )
              errors.push({
                error: 'textCase',
                expect: valueEnum.find(ve => ve.toLowerCase() === v.toLowerCase()) ?? '',
                k,
                v
              })
            else errors.push({ error: 'otherValues', expect: valueEnum, k, v })
        }
        if ('csvEnum' in schema && typeof v === 'string') {
          const { csvEnum } = schema,
            values = v.split(',')
          if (!values.length) errors.push({ error: 'otherValues', expect: csvEnum, k, v })
          if (csvEnum.length) {
            for (const val of values)
              if (!csvEnum.includes(val)) errors.push({ error: 'otherValues', expect: csvEnum, k, v })
          } else {
            const allNumeric = values.every(val => !Number.isNaN(Number(val))),
              allNonNumeric = values.every(val => Number.isNaN(Number(val)))
            if (!(allNumeric || allNonNumeric)) errors.push({ error: 'wrongType', expect: 'mixed data types', k, v })
          }
        }
      }
    return errors
  },
  outBad: Record<string, ErrorItem[]> = {},
  outGood: Record<string, ErrorItem[]> = {},
  eventTotals: Record<string, number> = {}

for (const [idx, record] of badRecords.entries()) outBad[idx] = scan(record, propSchema)
for (const [idx, record] of goodRecords.entries()) {
  const en = record[eventNameKey],
    eventDef = events.find(e => e.eventName === en)
  if (!eventDef || typeof en !== 'string') throw new Error(`Event definition not found for event name: ${en}`)
  eventTotals[en] = (eventTotals[en] ?? 0) + 1
  const constraints = [...propSchema, ...eventDef.eventData]
  outGood[idx] = scan(record, constraints).map(e => ({ ...e, eventName: en }))
}

const flat = [
  ...Object.values(outBad).flatMap(v => Object.values(v).flat()),
  ...Object.values(outGood).flatMap(v => Object.values(v).flat())
]

await w('bad_errors.json', outBad)
await w('good_errors.json', outGood)
await w('flat.json', flat)

const keyByErrorType = {} as Record<ErrorType, Record<string, number>>,
  userPropErrors: Record<string, ErrorReport> = {},
  errorsByEvent: Record<string, Record<string, ErrorReport>> = {}

for (const e of flat) {
  const { error: et, k } = e
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  keyByErrorType[et] ??= {}
  keyByErrorType[et][k] = (keyByErrorType[et][k] ?? 0) + 1

  if (userPropKeys.has(e.k)) {
    userPropErrors[k] ??= { count: 0, group: {} as Record<ErrorType, CountPercent> }
    userPropErrors[k].count += 1
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    userPropErrors[k].group[et] ??= { count: 0 }
    userPropErrors[k].group[et].count += 1
  } else if ('eventName' in e && typeof e.eventName === 'string') {
    const { eventName: en } = e
    errorsByEvent[en] ??= {}
    errorsByEvent[en][k] ??= { count: 0, group: {} as Record<ErrorType, CountPercent> }
    errorsByEvent[en][k].count += 1
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    errorsByEvent[en][k].group[et] ??= { count: 0 }
    errorsByEvent[en][k].group[et].count += 1
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
await w('error-report.json', errorReport)

let debug = `
# User Props

${[...userPropKeys]
  .toSorted()
  .map(up => `1. \`${up}\``)
  .join('\n')}

# Event Data

|Event name|Event Params|
|-|-|
`

for (const { eventData, eventName } of events)
  debug += `| \`${eventName}\` | ${eventData.map(({ key }) => `\`${key}\``).join(' ⋅ ')} |\n`

debug += `

## Unique Params Keys

${[...eventParamKeys]
  .toSorted()
  .map(k => `1. \`${k}\``)
  .join('\n')}


# Schema

## User Props
${constraintTable(propSchema)}

## Event
${eventSchema.map(({ eventData, eventName }, i) => `### ${i + 1}. \`${eventName}\`\n${constraintTable(eventData)}`).join('\n\n')}
`

let md = `

- Database: ${db}
- App Version: ${appVersion}
- Time Range: ${start} to ${end}

|Event|Count|
|-|-|
|valid|${goodRecords.length}|
|by sdk|${badRecords.filter(r => typeof r[eventNameKey] === 'string' && sdkEvents.includes(r[eventNameKey])).length}|
|redundant|${badRecords.filter(r => typeof r[eventNameKey] === 'string' && !sdkEvents.includes(r[eventNameKey])).length}|
|Total|${input.length}|


# Event Coverage

Matched
${matchedEvents.map(en => `1. \`${en}\``).join('\n')}

Missing
${missingEvents.length ? missingEvents.map(en => `1. \`${en}\``).join('\n') : '- None'}

Other
${autoCollectEvents.length ? autoCollectEvents.map(en => `1. \`${en}\``).join('\n') : '- None'}

Redundant
${invalidEvents.length ? invalidEvents.map(en => `1. \`${en}\``).join('\n') : '- None'}

# Prop Coverage

Matched
${matchedUserProps.map(k => `1. \`${k}\``).join('\n')}

${
  missingUserProps.size
    ? `
Missing

${[...missingUserProps].map(k => `1. \`${k}\``).join('\n')}`
    : ''
}

Other
${autoCollectKeys.length ? autoCollectKeys.map(k => `1. \`${k}\``).join('\n') : '- None'}


# Param Coverage

Matched
${matchedEventParams.map(k => `1. \`${k}\``).join('\n')}

${
  Object.keys(missingEventParams).length
    ? `
Missing

|Event Name|Missing|
|-|-|
${Object.entries(missingEventParams)
  .map(([en, keys]) => `|\`${en}\`|${keys.map(k => `\`${k}\``).join(' ⋅ ')}|`)
  .join('\n')}`
    : ''
}
`
for (const [et, _keys] of Object.entries(sortKeysFromList(keyByErrorType, [...errorTypes]))) {
  const keys = Object.entries(_keys).toSorted((a, b) => b[1] - a[1])

  if (et === 'redundant') md += '# Redundant Property and Parameters'
  else md += `### ${et}`

  md += `
*${et in errorDescriptions ? errorDescriptions[et as ErrorType] : ''}*

|Field|Errors|
|-|-|
`
  for (const [k, count] of keys) md += `| ${k} | ${count} |\n`
  if (et === 'redundant')
    md += `
# By Error Type
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

|Error|Percentage|
|-|-|
`
    for (const [et, gr] of Object.entries(report.group)) md += `| ${et} | ${gr.percent} |\n`
  }
  md += isUserProp ? '# By Event\n' : ''
}

await write(
  'out/report.html',
  `<style>${await file('report.css').text()}</style>
${await md2html(md)}`
)

await write('out/debug.md', debug)
