'use client'
import { t } from '@/lib/i18n'
import { useRSVP } from './shared'
import type { RSVPTemplateProps } from './types'

export default function Card(props: RSVPTemplateProps) {
  const { members, displayName, answers, message, setMessage, submitted, anyAttending, loading, error, setAnswer, handleSubmit, key } = useRSVP(props)
  const { dict } = props
  const firstName = displayName.split(' ')[0] || 'you'

  const field: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#fff', border: '0.5px solid #d4c9b5', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, boxSizing: 'border-box' }

  if (submitted) {
    return (
      <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, textAlign: 'center', background: '#fffdf8', border: '0.5px solid var(--color-border)', padding: '3rem 2rem', fontFamily: "'EB Garamond', serif" }}>
          <p style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)', marginBottom: 8 }}>{anyAttending ? t(dict.successYes, { name: firstName }) : t(dict.successNo, { name: firstName })}</p>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{dict.successSub}</p>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', display: 'flex', justifyContent: 'center', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fffdf8', border: '0.5px solid var(--color-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* card header */}
        <div style={{ background: 'var(--color-primary)', padding: '1.2rem 1.6rem', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>Reply Card</p>
          <p style={{ fontSize: 18, fontStyle: 'italic', color: '#fff' }}>{dict.sectionLabel}</p>
        </div>

        <div style={{ padding: '1.6rem' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: '1.2rem', textAlign: 'center' }}>{t(dict.deadline, { deadline: dict.rsvpDeadline })}</p>

          <p style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>{dict.attendanceLabel}</p>
          {members.map((m, i) => {
            const ans = answers[key(m)]
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--color-border)' }}>
                <span style={{ fontSize: 16, color: 'var(--color-text)' }}>{m.name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setAnswer(m, true)} style={{ padding: '4px 12px', background: ans === true ? 'var(--color-primary)' : 'transparent', color: ans === true ? '#fff' : 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', fontFamily: "'EB Garamond', serif", fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>{dict.accepts}</button>
                  <button type="button" onClick={() => setAnswer(m, false)} style={{ padding: '4px 12px', background: ans === false ? '#c4614a' : 'transparent', color: ans === false ? '#fff' : 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', fontFamily: "'EB Garamond', serif", fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>{dict.declines}</button>
                </div>
              </div>
            )
          })}

          <div style={{ marginTop: '1.2rem' }}>
            <p style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>{dict.messageLabel}</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={dict.messagePlaceholder} style={{ ...field, minHeight: 72, resize: 'vertical' }} />
          </div>

          {error && <p style={{ fontSize: 13, color: '#c4614a', fontStyle: 'italic', marginTop: 8 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '1.4rem', padding: '11px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? dict.sending : dict.sendReply}
          </button>
        </div>
      </div>
    </section>
  )
}
