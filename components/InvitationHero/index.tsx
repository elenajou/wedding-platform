import React from 'react'
import Classic from './templates/Classic'
import Minimal from './templates/Minimal'
import Fullscreen from './templates/Fullscreen'
import SplitLayout from './templates/SplitLayout'
import Floral from './templates/Floral'
import type { HeroTemplateProps } from './templates/types'

type Props = HeroTemplateProps & { design?: string }

export default function InvitationHero({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Minimal':     return <Minimal {...rest} />
    case 'Fullscreen':  return <Fullscreen {...rest} />
    case 'SplitLayout': return <SplitLayout {...rest} />
    case 'Floral':      return <Floral {...rest} />
    default:            return <Classic {...rest} />
  }
}
