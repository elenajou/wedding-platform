import type { SeatingTemplateProps } from './types'

export default function Formal({ guestName, groupName, tableName, allocatedSeats = 1, groupMembers = [], dict }: SeatingTemplateProps) {
  if (!tableName && !groupName) return null

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '2rem' }}>{dict.sectionLabel}</p>

      <div style={{
        width: 200, background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        padding: '2.5rem 1.8rem',
        textAlign: 'center',
        boxShadow: 'inset 0 0 0 6px var(--color-background)',
        outline: '1px solid var(--color-border)',
        outlineOffset: -10,
      }}>
        <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1.2rem' }}>
          {dict.tableLabel}
        </p>

        <p style={{ fontSize: 'clamp(2.2rem,6vw,3rem)', fontWeight: 300, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '0.8rem' }}>
          {tableName ?? dict.tableTBC}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto 1rem', width: '80%' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
          <div style={{ width: 4, height: 4, background: 'var(--color-primary)', borderRadius: '50%' }} />
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
        </div>

        {groupName && <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: 8 }}>{groupName}</p>}

        {groupMembers.length > 0 ? (
          groupMembers.map((m, i) => {
            const name = typeof m === 'string' ? m : m.name
            const isYou = guestName && name.toLowerCase() === guestName.toLowerCase()
            return (
              <p key={i} style={{ fontSize: 15, color: isYou ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 3, fontWeight: isYou ? 500 : 400 }}>
                {name}
              </p>
            )
          })
        ) : (
          <p style={{ fontSize: 16, color: 'var(--color-text)' }}>{guestName}</p>
        )}

        <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '1.2rem' }}>
          {allocatedSeats} {allocatedSeats === 1 ? dict.seatSingular : dict.seatPlural}
        </p>
      </div>
    </section>
  )
}
