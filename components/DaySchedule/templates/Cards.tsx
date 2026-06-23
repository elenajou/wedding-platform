import type { ScheduleTemplateProps } from './types'

export default function Cards({ dict }: ScheduleTemplateProps) {
  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2.5rem' }}>{dict.sectionLabel}</p>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {dict.events.map((ev, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)', border: '0.5px solid var(--color-border)',
            borderRadius: 4, padding: '1.2rem 1.4rem',
            display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 1rem', alignItems: 'start',
          }}>
            <span style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums', paddingTop: 2 }}>
              {ev.time}
            </span>
            <div>
              <p style={{ fontSize: 17, fontWeight: 400, color: 'var(--color-text)', margin: 0 }}>{ev.name}</p>
              {ev.description && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.5 }}>{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
