'use client'
import Classic from './templates/Classic'
import Cards from './templates/Cards'
import Compact from './templates/Compact'
import Elegant from './templates/Elegant'
import Illustrated from './templates/Illustrated'
import type { ScheduleTemplateProps } from './templates/types'

export type { ScheduleEvent } from './templates/types'

type Props = ScheduleTemplateProps & { design?: string }

export default function DaySchedule({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Cards':       return <Cards {...rest} />
    case 'Compact':     return <Compact {...rest} />
    case 'Elegant':     return <Elegant {...rest} />
    case 'Illustrated': return <Illustrated {...rest} />
    default:            return <Classic {...rest} />
  }
}
