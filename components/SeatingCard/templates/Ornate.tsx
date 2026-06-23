import type { SeatingTemplateProps } from './types'

export default function Ornate({ guestName, groupName, tableName, allocatedSeats = 1, groupMembers = [], dict }: SeatingTemplateProps) {
  if (!tableName && !groupName) return null

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '2rem' }}>{dict.sectionLabel}</p>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', padding: '2rem 2.4rem', border: '2px solid var(--color-primary)', background: 'var(--color-surface)' }}>
        {/* inner border */}
        <div style={{ position: 'absolute', inset: 6, border: '0.5px solid var(--color-primary)', pointerEvents: 'none' }} />
        {/* corner dots */}
        {[{top:3,left:3},{top:3,right:3},{bottom:3,left:3},{bottom:3,right:3}].map((pos,i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 6, height: 6, background: 'var(--color-primary)', borderRadius: '50%' }} />
        ))}

        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>{dict.tableLabel}</p>
          <p style={{ fontSize: 'clamp(2rem,8vw,3rem)', fontWeight: 300, color: 'var(--color-primary)', lineHeight: 1 }}>{tableName ?? dict.tableTBC}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0.8rem auto', width: 160 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
            <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>✦</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
          </div>
        </div>

        {groupName && <p style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-text)', textAlign: 'center', marginBottom: '0.8rem' }}>{groupName}</p>}
        {groupMembers.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
            {groupMembers.map((m, i) => {
              const name = typeof m === 'string' ? m : m.name
              const isYou = guestName && name.toLowerCase() === guestName.toLowerCase()
              return (
                <li key={i} style={{ fontSize: 15, color: isYou ? 'var(--color-primary)' : 'var(--color-text)', textAlign: 'center', padding: '3px 0', fontWeight: isYou ? 500 : 400 }}>
                  {name}{isYou ? ` — ${dict.youBadge}` : ''}
                </li>
              )
            })}
          </ul>
        )}
        <p style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {allocatedSeats} {allocatedSeats === 1 ? dict.seatSingular : dict.seatPlural}
        </p>
      </div>
    </section>
  )
}
