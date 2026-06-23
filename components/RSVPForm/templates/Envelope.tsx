'use client'
import { t } from '@/lib/i18n'
import { useRSVP } from './shared'
import type { RSVPTemplateProps } from './types'

export default function Envelope(props: RSVPTemplateProps) {
  const { members, displayName, answers, message, setMessage, submitted, anyAttending, loading, error, setAnswer, handleSubmit, key } = useRSVP(props)
  const { dict } = props
  const firstName = displayName.split(' ')[0] || 'you'

  if (submitted) {
    return (
      <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', justifyContent: 'center', fontFamily: "'EB Garamond', serif" }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: '1rem' }}>✉️</div>
          <p style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)' }}>{anyAttending ? t(dict.successYes, { name: firstName }) : t(dict.successNo, { name: firstName })}</p>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 8 }}>{dict.successSub}</p>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        {/* Envelope flap triangle */}
        <div style={{ width: '100%', position: 'relative', height: 40, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '230px solid transparent',
            borderRight: '230px solid transparent',
            borderTop: '40px solid var(--color-primary)',
            opacity: 0.15,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '225px solid transparent',
            borderRight: '225px solid transparent',
            borderTop: '38px solid var(--color-surface)',
          }} />
        </div>

        <div style={{ border: '0.5px solid var(--color-border)', borderTop: 'none', padding: '2rem 1.8rem', background: 'var(--color-surface)' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.4rem', textAlign: 'center' }}>{dict.sectionLabel}</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '1.8rem' }}>{t(dict.deadline, { deadline: dict.rsvpDeadline })}</p>

          {members.map((m, i) => {
            const ans = answers[key(m)]
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 17, color: 'var(--color-text)' }}>{m.name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setAnswer(m, true)} style={{ padding: '5px 14px', background: ans === true ? 'var(--color-primary)' : 'transparent', color: ans === true ? '#fff' : 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', fontFamily: "'EB Garamond', serif", fontSize: 13, cursor: 'pointer' }}>{dict.accepts}</button>
                  <button type="button" onClick={() => setAnswer(m, false)} style={{ padding: '5px 14px', background: ans === false ? '#c4614a' : 'transparent', color: ans === false ? '#fff' : 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', fontFamily: "'EB Garamond', serif", fontSize: 13, cursor: 'pointer' }}>{dict.declines}</button>
                </div>
              </div>
            )
          })}

          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={dict.messagePlaceholder} style={{ width: '100%', marginTop: '1rem', padding: '8px 10px', background: 'var(--color-background)', border: '0.5px solid var(--color-border)', fontFamily: "'EB Garamond', serif", fontSize: 15, color: 'var(--color-text)', outline: 'none', resize: 'vertical', minHeight: 64, boxSizing: 'border-box' }} />

          {error && <p style={{ fontSize: 13, color: '#c4614a', fontStyle: 'italic', marginTop: 6 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '1.2rem', padding: '11px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? dict.sending : dict.sendReply}
          </button>
        </div>
      </div>
    </section>
  )
}
