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

export default function Elegant({ targetDate, dict }: CountdownTemplateProps) {
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
          {units.map(({ key, label }, i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
                <span style={{
                  fontFamily: "'EB Garamond', serif", fontSize: 'clamp(2.4rem,8vw,4rem)',
                  fontWeight: 300, lineHeight: 1, color: 'var(--color-text)',
                  transition: 'all 0.3s',
                }}>
                  {tl !== null ? String(tl[key]).padStart(2, '0') : '--'}
                </span>
                <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)', marginTop: 6 }}>{label}</span>
              </div>
              {i < 3 && (
                <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '2.4rem', color: 'var(--color-border)', lineHeight: 1, padding: '0 4px' }}>:</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
