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

function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const R = 36, C = 2 * Math.PI * R
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="80" height="80" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={R} fill="none" stroke="var(--color-border)" strokeWidth="3" />
        <circle
          cx="44" cy="44" r={R} fill="none"
          stroke="var(--color-primary)" strokeWidth="3"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="44" y="44" textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: '44px 44px', fontSize: 20, fontFamily: "'EB Garamond', serif", fill: 'var(--color-text)' }}
        >
          {String(value).padStart(2, '0')}
        </text>
      </svg>
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  )
}

export default function Circular({ targetDate, dict }: CountdownTemplateProps) {
  const [tl, setTl] = useState<TimeLeft | null>(null)
  const isPast = new Date(targetDate).getTime() < Date.now()

  useEffect(() => {
    setTl(getTimeLeft(targetDate))
    const id = setInterval(() => setTl(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <section style={{ padding: '4rem 1rem', textAlign: 'center', background: 'var(--color-background)' }}>
      {dict.message && <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{dict.message}</p>}
      <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '2.5rem' }}>{dict.label}</p>
      {isPast ? (
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)' }}>{dict.pastMessage}</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'nowrap' }}>
          <Ring value={tl?.days ?? 0} max={365} label={dict.days} />
          <Ring value={tl?.hours ?? 0} max={24} label={dict.hours} />
          <Ring value={tl?.minutes ?? 0} max={60} label={dict.minutes} />
          <Ring value={tl?.seconds ?? 0} max={60} label={dict.seconds} />
        </div>
      )}
    </section>
  )
}
