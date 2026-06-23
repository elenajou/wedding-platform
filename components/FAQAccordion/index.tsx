'use client'
import Classic from './templates/Classic'
import Stacked from './templates/Stacked'
import Minimal from './templates/Minimal'
import Boxed from './templates/Boxed'
import Split from './templates/Split'
import type { FAQTemplateProps } from './templates/types'

export type { FAQItem } from './templates/types'

type Props = FAQTemplateProps & { design?: string }

export default function FAQAccordion({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Stacked': return <Stacked {...rest} />
    case 'Minimal': return <Minimal {...rest} />
    case 'Boxed':   return <Boxed {...rest} />
    case 'Split':   return <Split {...rest} />
    default:        return <Classic {...rest} />
  }
}
