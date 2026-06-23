export type ScheduleEvent = { time: string; isoTime: string; name: string; description?: string }

export type ScheduleTemplateProps = {
  dict: {
    sectionLabel: string
    happeningNow: string
    events: ScheduleEvent[]
  }
}
