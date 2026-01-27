import Flag from '@svgr-iconkit/flag-icons'
import { lang2flag } from 'constant'

const TdLang = ({ language }: { language: string }) => (
  <td>
    <Flag
      className='size-6 rounded-full shadow-sm drop-shadow-sm'
      name={lang2flag[language as keyof typeof lang2flag]}
      variant='square'
    />
  </td>
)

export default TdLang
