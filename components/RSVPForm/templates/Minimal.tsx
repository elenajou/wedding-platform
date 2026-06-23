'use client'
import { t } from '@/lib/i18n'
import { useRSVP } from './shared'
import type { RSVPTemplateProps } from './types'

export default function Minimal(props: RSVPTemplateProps) {
  const { members, displayName, answers, message, setMessage, submitted, anyAttending, loading, error, setAnswer, handleSubmit, key } = useRSVP(props)
  const { dict } = props
  const firstName = displayName.split(' ')[0] || 'you'

  if (submitted) {
    return (
      <section style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
        <p style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)' }}>{anyAttending ? t(dict.successYes, { name: firstName }) : t(dict.successNo, { name: firstName })}</p>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 8 }}>{dict.successSub}</p>
      </section>
    )
  }

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '0.4rem' }}>{dict.sectionLabel}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2.5rem' }}>{t(dict.deadline, { deadline: dict.rsvpDeadline })}</p>

      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        {members.map((m, i) => {
          const ans = answers[key(m)]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--color-border)', padding: '0.9rem 0' }}>
              <span style={{ fontSize: 17, color: 'var(--color-text)' }}>{m.name}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: true, label: dict.accepts }, { v: false, label: dict.declines }].map(({ v, label }) => (
                  <button key={String(v)} type="button" onClick={() => setAnswer(m, v)} style={{
                    padding: '3px 10px', background: 'none',
                    color: ans === v ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 14,
                    cursor: 'pointer', textDecoration: ans === v ? 'underline' : 'none',
                    textUnderlineOffset: 3,
                  }}>{label}</button>
                ))}
              </div>
            </div>
          )
        })}

        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={dict.messagePlaceholder} style={{ width: '100%', marginTop: '1.4rem', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid var(--color-border)', fontFamily: "'EB Garamond', serif", fontSize: 15, color: 'var(--color-text)', outline: 'none', resize: 'none', minHeight: 60, boxSizing: 'border-box' }} />

        {error && <p style={{ fontSize: 13, color: '#c4614a', fontStyle: 'italic', marginTop: 6 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ marginTop: '1.6rem', padding: '10px 0', background: 'none', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary)', width: '100%', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? dict.sending : dict.sendReply}
        </button>
      </div>
    </section>
  )
}
