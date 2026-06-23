import type { ScheduleTemplateProps } from './types'

export default function Elegant({ dict }: ScheduleTemplateProps) {
  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '3rem' }}>{dict.sectionLabel}</p>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {dict.events.map((ev, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '100px 1fr',
            gap: '0 2rem', marginBottom: '2.5rem', alignItems: 'start',
          }}>
            <div style={{ textAlign: 'right', paddingTop: 3 }}>
              <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 300, color: 'var(--color-primary)' }}>{ev.time}</span>
            </div>
            <div style={{ borderLeft: '0.5px solid var(--color-border)', paddingLeft: '1.5rem' }}>
              <p style={{ fontSize: 19, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 4px' }}>{ev.name}</p>
              {ev.description && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
