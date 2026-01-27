/* eslint-disable perfectionist/sort-objects */
import type { z } from 'zod/v4'

import { openai } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { argv, write } from 'bun'
import { error } from 'node:console'
import { exit } from 'node:process'
import { array, literal, number, object, string, enum as zenum } from 'zod/v4'

import { xlsx2html } from './utils'

const model = openai('gpt-5.1-codex'),
  DataTypeSchema = zenum(['string', 'number']).describe('data type, can be either "string" or "number"'),
  EnumSchema = object({
    key: string().describe('key name'),
    type: DataTypeSchema,
    valueEnum: array(string())
      .or(array(number()))
      .describe(
        'possible values for the enum, it can only be enum of strings or enum of numbers (not mixed), if the document does not specify, leave it empty'
      )
  }).describe('enum schema'),
  NumberSchema = object({
    key: string().describe('key name'),
    type: literal('number'),
    number: number().describe('constraint number'),
    operator: zenum(['>', '>=']).describe('constraint operator')
  }).describe('number schema'),
  CsvSchema = object({
    key: string().describe('key name'),
    type: literal('string'),
    csvEnum: array(string()).describe(
      'all possible values for each item in the csv string, if the document does not specify, leave it empty'
    )
  }).describe('CSV schema'),
  ConstraintSchema = EnumSchema.or(NumberSchema).or(CsvSchema).describe('constraint schema'),
  EventSchema = object({
    eventName: string().describe('event name'),
    eventData: array(ConstraintSchema).describe('event data schema as an array of param schemas')
  }).describe('key is event name, value is event data schema as an array of objects representing Params constraints'),
  ResponseSchema = object({
    userProperties: array(ConstraintSchema).describe('array of user property schemas'),
    events: array(EventSchema).describe('array of event schemas')
  })

if (argv.length < 3 || !argv[2]?.length) {
  error('Usage: bun gen.ts <file.xlsx>')
  exit(1)
}

const xl = await xlsx2html(argv[2], 10)
if (!xl.length) {
  error('No content extracted from the Excel file.')
  exit(1)
}

const { output: summary } = await generateText({
  model,
  prompt: xl,
  output: Output.object({ schema: ResponseSchema }),
  system: `
Given a table containing field definitions of user properties and events for a mobile game analytics platform.
Each actual record is a JSON object with key and value pairs representing user properties and event parameters.

A value can be a string or a number:

- If the value is a string, it can be one of the following:
  - an enum of possible strings
  - a CSV string representing possible values in a comma-separated format.

- If the value is a number, it can be one of the following:
  - an enum of possible numbers
  - a number constraint with an operator.

Your task is to analyze the table and produce a concise schema that contains all user properties and all the unique events along with their constraints.

A constraint can be:
- an enum of possible values
- a number constraint with an operator
- a CSV enum representing possible values in a comma-separated string.

**INSTRUCTIONS:**
- Each event name has its own event data schema containing list of Params with specific constraints.
- For string enums or number enums, list all possible values under "valueEnum".
- For number constraints, specify the "number" and "operator".
- For CSV strings, list all possible values for each item under "csvEnum".
- If no constraints are specified in the document for a field, leave the corresponding constraint empty.
`
})

await write('schema.json', JSON.stringify(summary, null, 2))

type Constraint = z.infer<typeof ConstraintSchema>
type SchemaType = z.infer<typeof ResponseSchema>

export type { Constraint, SchemaType }
