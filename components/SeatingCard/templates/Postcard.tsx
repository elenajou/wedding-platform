import type { SeatingTemplateProps } from './types'

export default function Postcard({ guestName, groupName, tableName, allocatedSeats = 1, groupMembers = [], dict }: SeatingTemplateProps) {
  if (!tableName && !groupName) return null

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '2rem' }}>{dict.sectionLabel}</p>

      <div style={{
        width: '100%', maxWidth: 520, background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        display: 'grid', gridTemplateColumns: '1fr 0.5px 180px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}>
        {/* Left: member list */}
        <div style={{ padding: '1.6rem' }}>
          {groupName && <p style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--color-text)', marginBottom: '0.8rem' }}>{groupName}</p>}
          {groupMembers.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {groupMembers.map((m, i) => {
                const name = typeof m === 'string' ? m : m.name
                const isYou = guestName && name.toLowerCase() === guestName.toLowerCase()
                return (
                  <li key={i} style={{ fontSize: 15, color: isYou ? 'var(--color-primary)' : 'var(--color-text)', padding: '3px 0', fontStyle: isYou ? 'italic' : 'normal' }}>
                    {name}{isYou ? ` (${dict.youBadge})` : ''}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p style={{ fontSize: 15, color: 'var(--color-text)' }}>{guestName}</p>
          )}
          <p style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            {allocatedSeats} {allocatedSeats === 1 ? dict.seatSingular : dict.seatPlural}
          </p>
        </div>

        {/* Divider */}
        <div style={{ background: 'var(--color-border)' }} />

        {/* Right: table */}
        <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{dict.tableLabel}</p>
          <p style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 300, color: '#fff', lineHeight: 1 }}>{tableName ?? dict.tableTBC}</p>
        </div>
      </div>
    </section>
  )
}
