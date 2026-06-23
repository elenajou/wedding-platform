'use client'
import Classic from './templates/Classic'
import Circular from './templates/Circular'
import Elegant from './templates/Elegant'
import Framed from './templates/Framed'
import Film from './templates/Film'
import type { CountdownTemplateProps } from './templates/types'

type Props = CountdownTemplateProps & { design?: string }

export default function CountdownTimer({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Circular': return <Circular {...rest} />
    case 'Elegant':  return <Elegant {...rest} />
    case 'Framed':   return <Framed {...rest} />
    case 'Film':     return <Film {...rest} />
    default:         return <Classic {...rest} />
  }
}
