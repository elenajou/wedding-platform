import Classic from './templates/Classic'
import Ornate from './templates/Ornate'
import Postcard from './templates/Postcard'
import Badge from './templates/Badge'
import Formal from './templates/Formal'
import type { SeatingTemplateProps } from './templates/types'

type Props = SeatingTemplateProps & { design?: string }

export default function SeatingCard({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Ornate':   return <Ornate {...rest} />
    case 'Postcard': return <Postcard {...rest} />
    case 'Badge':    return <Badge {...rest} />
    case 'Formal':   return <Formal {...rest} />
    default:         return <Classic {...rest} />
  }
}
