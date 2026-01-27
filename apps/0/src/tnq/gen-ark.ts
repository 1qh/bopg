import { openai } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { argv, file, write } from 'bun'
import { error, log } from 'node:console'
import { exit } from 'node:process'
import { array, object, string } from 'zod/v4'

import { cleanObj } from '~/utils'

import { xlsx2html } from './utils'

const arktypeDoc = await file('doc.md').text()

if (!arktypeDoc.length) {
  error('doc.md is empty')
  exit(1)
}

if (argv.length < 3 || !argv[2]?.length) {
  error('Usage: bun gen-ark.ts <file.xlsx>')
  exit(1)
}

const html = await xlsx2html(argv[2])

await write('debug.html', html)
log('Sheet converted')

const model = openai('gpt-5-mini'),
  EventSchema = object({
    eventData: array(
      object({
        constraint: string().optional().describe('value constraints like min/max for number, or "number-like" for string'),
        name: string().describe('parameter/property name'),
        type: string().describe('"string" or "number"'),
        values: array(string()).optional().describe('predefined possible values')
      }).describe('parameter/property schema')
    ).describe('event data schema as an array of parameter/property schemas'),
    eventName: string().describe('event name')
  }).describe(
    'key is event name, value is event data schema as an array of objects representing Params/Properties types and constraints'
  ),
  UserPropertiesSchema = object({
    constraint: string().optional().describe('value constraints like min/max'),
    name: string().describe('user property name'),
    type: string().describe('"string" or "number"'),
    values: array(string()).optional().describe('predefined possible values')
  }).describe('user property schema'),
  ResponseSchema = object({
    events: array(EventSchema).describe('array of event schemas'),
    userProperties: array(UserPropertiesSchema).describe('array of user property schemas')
  }),
  { output: rawSummary } = await generateText({
    model,
    output: Output.object({ schema: ResponseSchema }),
    prompt: html,
    seed: 0,
    system: `
Given a table containing field definitions of user properties and events for a mobile game analytics platform, produce a concise schema that contains all the unique event names along with their associated Params/Properties, types, and any value constraints.

**INSTRUCTIONS:**
- Each event name has its own event data schema containing list of Params/Properties with specific types and value constraints.
- For string types:
  - if there are predefined possible values, list them under "values".
  - if it must only contain number-like strings, indicate that in "constraint".
  - if it can be comma separated values, leave "values" and "constraint" empty.
- For number types, if there are any constraints (like min/max), include them under "constraint".
- Ensure that each event name is unique in the output and in order as they appear in the input.

**TABLE COLUMNS:**
- ONLY care about the following columns: Event Name, Param/Property Name, Values, Data Type.
- IGNORE any other columns.

**NOTES:**
- Some event data params/properties name might be annotated with "eventData." prefix. ALWAYS REMOVE this prefix in the output.
`,
    temperature: 0
  }),
  summary = cleanObj(rawSummary)

await write('debug.json', JSON.stringify(summary, null, 2))
log('Summary generated')

const eventTemplate = `
{
${summary.userProperties.map(({ name }) => `  "${name}": ...`).join(',\n')}
  "eventName": ...,
  "eventData": {
     ...
  }
}`
await write('debug.txt', eventTemplate)

const { text } = await generateText({
  model,
  prompt: `
Event template:${eventTemplate}

Field definitions:
${JSON.stringify(summary, null, 2)}`,
  seed: 0,
  system: `
You are an typescript developer expert in arktype. Here is the most up-to-date docs for arktype:

=== START OF DOCUMENTATION ===
${arktypeDoc}
=== END OF DOCUMENTATION ===

**TASK:**
- Given the event data template and field definitions in json, use arktype to define a schema for an event
- DO NOT explain anything, ONLY return the code in typescript with no comments, export default the schema

**IMPORTANT:**
- \`eventData\` is the only nested attribute.
- Each \`eventName\` has its own \`eventData\` schema.
- There should be only 1 schema for user properties and 1 schema for each event type
- The final schema is the user properties schema merge with an union of all event type schemas
`,
  temperature: 0
})

await write('schema.ts', text)
