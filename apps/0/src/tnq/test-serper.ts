import { write } from 'bun'

import search from '~/serper'

const res = await search(['openai', 'anthropic'])

console.log(res)
console.log(res.length)
await write('./serper-output.json', JSON.stringify(res, null, 2))
