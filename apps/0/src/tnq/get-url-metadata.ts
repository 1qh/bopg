import { argv, write } from 'bun'
import urlMetadata from 'url-metadata'

if (argv.length < 3 || !argv[2]) {
  console.error('no url provided')
  process.exit(1)
}

const res = await urlMetadata(argv[2])

await write('output.json', JSON.stringify(res, null, 2))
