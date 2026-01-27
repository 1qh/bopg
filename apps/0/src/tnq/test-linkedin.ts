import { write } from 'bun'

import getCompanyWebsites from './linkedin'

const res = await getCompanyWebsites(['https://linkedin.com/company/openai/', 'https://linkedin.com/company/nvidia/'])

await write('./linkedin-output.json', JSON.stringify(res, null, 2))
