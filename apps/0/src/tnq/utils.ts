/** biome-ignore-all lint/nursery/noForIn: x */
import { read, utils as xl } from '@e965/xlsx'
import { file, write } from 'bun'
import { load } from 'cheerio'
import pretty from 'json-stringify-pretty-compact'
import { format } from 'prettier'
import rm from 'rehype-mermaid'
import rs from 'rehype-stringify'
import rg from 'remark-gfm'
import rp from 'remark-parse'
import rr from 'remark-rehype'
import { unified } from 'unified'

import type { Constraint } from './gen'

export const tableOnly = async (s: string, attributes: string[]) => {
    const $ = load(s)
    $('*').each((_, e) => {
      for (const a of attributes) $(e).removeAttr(a)
    })
    const res = await format($.html($('table')), { parser: 'html' })
    return res
  },
  // eslint-disable-next-line max-statements
  xlsx2html = async (path: string, tilCol?: number) => {
    const wb = read(await file(path).arrayBuffer()),
      sheetNames = wb.SheetNames
    if (!(sheetNames.length && sheetNames[0])) throw new Error('No sheets found in the Excel file.')
    const sheet = wb.Sheets[sheetNames[0]]
    if (!sheet) throw new Error('No first sheet found in the Excel file.')
    if (tilCol && sheet['!ref']) {
      const range = xl.decode_range(sheet['!ref'])
      range.e.c = tilCol
      sheet['!ref'] = xl.encode_range(range)
    }
    const html = await tableOnly(xl.sheet_to_html(sheet), ['data-v', 'data-t', 'id', 'style'])
    await write('debug.html', `<style>\n${await file('debug.css').text()}</style>\n\n${html}`)
    return html
  },
  percent = (count: number, total: number) => `${((total ? count / total : 0) * 100).toFixed(2)}% (${count}/${total})`,
  w = async (path: string, data: unknown, prefix = 'out/') => write(prefix ? `${prefix}${path}` : path, pretty(data)),
  md2html = async (md: string) => {
    const { value } = await unified().use(rp).use(rg).use(rr).use(rm).use(rs).process(md)
    return value as string
  },
  constraintTable = (constraints: Constraint[]) =>
    `|key|type|condition|\n|-|-|-|\n${constraints
      .map(({ key, type, ...rest }) => {
        const col1 = `\`${key}\``,
          col2 = type === 'number' ? 'number' : 'csvEnum' in rest ? 'csv' : 'string',
          col3 =
            'number' in rest
              ? `${rest.operator} ${rest.number}`
              : 'valueEnum' in rest
                ? rest.valueEnum.join(' ⋅ ')
                : rest.csvEnum.join(' ⋅ ')
        return `|${col1}|${col2}|${col3.includes('⋅') ? `\`${col3}\`` : col3}|`
      })
      .join('\n')}|`
