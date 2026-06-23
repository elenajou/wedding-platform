'use client'
import Classic from './templates/Classic'
import Card from './templates/Card'
import Minimal from './templates/Minimal'
import Envelope from './templates/Envelope'
import Modern from './templates/Modern'
import type { RSVPTemplateProps } from './templates/types'

type Props = RSVPTemplateProps & { design?: string }

export default function RSVPForm({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Card':     return <Card {...rest} />
    case 'Minimal':  return <Minimal {...rest} />
    case 'Envelope': return <Envelope {...rest} />
    case 'Modern':   return <Modern {...rest} />
    default:         return <Classic {...rest} />
  }
}
