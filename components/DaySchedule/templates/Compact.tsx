import type { ScheduleTemplateProps } from './types'

export default function Compact({ dict }: ScheduleTemplateProps) {
  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2rem' }}>{dict.sectionLabel}</p>
      <ol style={{ maxWidth: 480, margin: '0 auto', padding: 0, listStyle: 'none' }}>
        {dict.events.map((ev, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: '1rem',
            borderBottom: '0.5px solid var(--color-border)', padding: '0.75rem 0',
            color: 'var(--color-text)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--color-primary)', minWidth: 20, fontVariantNumeric: 'tabular-nums' }}>{i + 1}.</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', minWidth: 72, fontVariantNumeric: 'tabular-nums' }}>{ev.time}</span>
            <span style={{ fontSize: 16 }}>{ev.name}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
