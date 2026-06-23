'use client'
import { useEffect, useState } from 'react'
import type { CountdownTemplateProps, TimeLeft } from './types'

function getTimeLeft(t: string): TimeLeft {
  const diff = new Date(t).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function Framed({ targetDate, dict }: CountdownTemplateProps) {
  const [tl, setTl] = useState<TimeLeft | null>(null)
  const isPast = new Date(targetDate).getTime() < Date.now()

  useEffect(() => {
    setTl(getTimeLeft(targetDate))
    const id = setInterval(() => setTl(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const units = [
    { key: 'days' as const, label: dict.days },
    { key: 'hours' as const, label: dict.hours },
    { key: 'minutes' as const, label: dict.minutes },
    { key: 'seconds' as const, label: dict.seconds },
  ]

  return (
    <section style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--color-background)' }}>
      {dict.message && <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{dict.message}</p>}
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{dict.label}</p>

      {isPast ? (
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)' }}>{dict.pastMessage}</p>
      ) : (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {units.map(({ key, label }) => (
            <div key={key} style={{
              border: '1px solid var(--color-primary)',
              outline: '3px solid var(--color-border)',
              outlineOffset: -6,
              padding: '1.2rem 1.4rem',
              minWidth: 80,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: 'var(--color-surface)',
            }}>
              <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 300, lineHeight: 1, color: 'var(--color-primary)' }}>
                {tl !== null ? String(tl[key]).padStart(2, '0') : '--'}
              </span>
              <div style={{ width: 24, height: '0.5px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
