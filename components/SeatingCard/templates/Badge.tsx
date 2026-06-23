import type { SeatingTemplateProps } from './types'

export default function Badge({ guestName, groupName, tableName, allocatedSeats = 1, dict }: SeatingTemplateProps) {
  if (!tableName && !groupName) return null
  const displayName = guestName ?? groupName ?? ''

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '2rem' }}>{dict.sectionLabel}</p>

      <div style={{
        width: 260, padding: '2rem 1.6rem',
        background: 'var(--color-surface)', border: '3px solid var(--color-primary)',
        borderRadius: 8, textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {/* Badge top strip */}
        <div style={{ background: 'var(--color-primary)', margin: '-2rem -1.6rem 1.2rem', padding: '0.6rem 1rem', borderRadius: '4px 4px 0 0' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Guest</p>
        </div>

        <p style={{ fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 400, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: '0.8rem' }}>{displayName}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 0.8rem', width: 120 }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: 10, color: 'var(--color-primary)' }}>◆</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
        </div>

        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'var(--color-background)', padding: '0.5rem 1.2rem', borderRadius: 4, border: '0.5px solid var(--color-border)' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 2 }}>{dict.tableLabel}</p>
          <p style={{ fontSize: 22, fontWeight: 300, color: 'var(--color-primary)', lineHeight: 1 }}>{tableName ?? dict.tableTBC}</p>
        </div>

        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: '0.8rem' }}>
          {allocatedSeats} {allocatedSeats === 1 ? dict.seatSingular : dict.seatPlural}
        </p>
      </div>
    </section>
  )
}
