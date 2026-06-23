import type { ScheduleTemplateProps } from './types'

const EVENT_ICONS: Record<string, string> = {
  arrival: '🌿', ceremony: '💍', cocktail: '🥂', dinner: '🍽️',
  dance: '💃', reception: '🎉', toast: '🥂', cake: '🎂',
  photo: '📷', music: '🎵', default: '✦',
}

function getIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(EVENT_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return EVENT_ICONS.default
}

export default function Illustrated({ dict }: ScheduleTemplateProps) {
  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2.5rem' }}>{dict.sectionLabel}</p>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {dict.events.map((ev, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '1.2rem',
            padding: '1rem 0', borderBottom: i < dict.events.length - 1 ? '0.5px solid var(--color-border)' : 'none',
          }}>
            <span style={{ fontSize: 22, lineHeight: 1, minWidth: 28, textAlign: 'center', marginTop: 2 }}>
              {getIcon(ev.name)}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, color: 'var(--color-text)', fontWeight: 400 }}>{ev.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-primary)', letterSpacing: '0.08em' }}>{ev.time}</span>
              </div>
              {ev.description && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.5 }}>{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
