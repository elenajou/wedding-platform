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

function Sprockets() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ width: 10, height: 14, background: 'var(--color-background)', borderRadius: 2, opacity: 0.6 }} />
      ))}
    </div>
  )
}

export default function Film({ targetDate, dict }: CountdownTemplateProps) {
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
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{dict.label}</p>

      {isPast ? (
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)' }}>{dict.pastMessage}</p>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
          background: '#1a1a1a', borderRadius: 4, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          maxWidth: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', background: '#111', flexShrink: 0 }}>
            <Sprockets />
          </div>

          {units.map(({ key, label }, i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.2rem 0.5rem', width: '100%' }}>
                <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '2.2rem', fontWeight: 300, lineHeight: 1, color: '#f4e9d0' }}>
                  {tl !== null ? String(tl[key]).padStart(2, '0') : '--'}
                </span>
                <span style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7a60', marginTop: 6 }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width: '0.5px', background: '#333', alignSelf: 'stretch', flexShrink: 0 }} />}
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', background: '#111' }}>
            <Sprockets />
          </div>
        </div>
      )}
    </section>
  )
}
