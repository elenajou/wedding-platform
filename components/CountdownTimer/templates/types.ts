export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

export type CountdownTemplateProps = {
  targetDate: string
  backgroundUrl?: string
  dict: {
    label: string
    pastMessage: string
    days: string
    hours: string
    minutes: string
    seconds: string
    message?: string
  }
}
