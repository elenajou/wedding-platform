'use client'
import { useEffect, useState } from 'react'
import styles from '../DaySchedule.module.css'
import type { ScheduleTemplateProps } from './types'

export default function Classic({ dict }: ScheduleTemplateProps) {
  const events = dict.events
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    function calcActive() {
      const now = Date.now()
      let current = -1
      for (let i = 0; i < events.length; i++) {
        if (new Date(events[i].isoTime).getTime() <= now) current = i
      }
      if (current === -1 && events.length > 0) {
        const isWeddingDay = new Date().toDateString() === new Date(events[0].isoTime).toDateString()
        setActiveIndex(isWeddingDay ? 0 : null)
      } else {
        setActiveIndex(current)
      }
    }
    calcActive()
    const interval = setInterval(calcActive, 60000)
    return () => clearInterval(interval)
  }, [events])

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{dict.sectionLabel}</p>
      <div className={styles.timeline}>
        {events.map((event, i) => {
          const isActive = i === activeIndex
          return (
            <div key={i} className={styles.item}>
              <div className={`${styles.dot} ${isActive ? styles.active : ''}`} />
              <p className={styles.time}>{event.time}</p>
              <p className={styles.eventName}>{event.name}</p>
              {event.description && <p className={styles.eventDesc}>{event.description}</p>}
              {isActive && <span className={styles.nowBadge}>{dict.happeningNow}</span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
