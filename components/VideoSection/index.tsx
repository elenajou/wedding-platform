'use client'
import Classic from './templates/Classic'
import Fullwidth from './templates/Fullwidth'
import Cinema from './templates/Cinema'
import Card from './templates/Card'
import Floating from './templates/Floating'
import type { VideoTemplateProps } from './templates/types'

type Props = VideoTemplateProps & { design?: string }

export default function VideoSection({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Fullwidth': return <Fullwidth {...rest} />
    case 'Cinema':    return <Cinema {...rest} />
    case 'Card':      return <Card {...rest} />
    case 'Floating':  return <Floating {...rest} />
    default:          return <Classic {...rest} />
  }
}
