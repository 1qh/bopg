import { argv, file, write } from 'bun'
import { error } from 'node:console'
import { exit } from 'node:process'

interface CleanDocOptions {
  innerEnd: string
  innerStart: string
  outerEnd: string
  outerStart: string
  sep: string
  text: string
}

const esc = (s: string) => s.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`),
  inside = (s: string, e: string) => new RegExp(`${esc(s)}(.*?)${esc(e)}`, 'gsu'),
  clean = ({ innerEnd, innerStart, outerEnd, outerStart, sep, text }: CleanDocOptions) =>
    text
      .replace(inside(outerStart, outerEnd), (_, outer: string) =>
        [...outer.matchAll(inside(innerStart, innerEnd))].map(([, m]) => m).join(sep)
      )
      .split('\n')
      .map(l => l.trimEnd())
      .join('\n')
      .replaceAll(/\n{4,}/gu, '\n\n\n')

if (argv.length < 3 || !argv[2]?.length) {
  error('Usage: bun clean-doc.ts <file.txt>')
  exit(1)
}

const doc = clean({
  innerEnd: '</SyntaxTab>',
  innerStart: '<SyntaxTab string>',
  outerEnd: '</SyntaxTabs>',
  outerStart: '<SyntaxTabs>',
  sep: '\n',
  text: await file(argv[2]).text()
})

await write('doc.md', doc)
