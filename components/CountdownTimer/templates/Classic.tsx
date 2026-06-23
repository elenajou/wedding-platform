'use client'
import { useEffect, useState } from 'react'
import styles from '../CountdownTimer.module.css'
import type { CountdownTemplateProps, TimeLeft } from './types'

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function Classic({ targetDate, dict }: CountdownTemplateProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const isPast = new Date(targetDate).getTime() < Date.now()

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetDate))
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const units: { key: keyof TimeLeft; label: string }[] = [
    { key: 'days', label: dict.days },
    { key: 'hours', label: dict.hours },
    { key: 'minutes', label: dict.minutes },
    { key: 'seconds', label: dict.seconds },
  ]

  return (
    <div className={styles.wrapper}>
      <section className={styles.section} aria-hidden="true" />
      <div className={styles.countdown}>
        {dict.message && <p className={styles.message}>{dict.message}</p>}
        <p className={styles.label}>{dict.label}</p>
        {isPast ? (
          <p className={styles.pastMessage}>{dict.pastMessage}</p>
        ) : (
          <div className={styles.grid}>
            {units.map(({ key, label }) => (
              <div key={key} className={styles.card}>
                <span className={styles.number}>
                  {timeLeft !== null ? String(timeLeft[key]).padStart(2, '0') : '--'}
                </span>
                <span className={styles.unit}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
