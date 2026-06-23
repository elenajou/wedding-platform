'use client'
import { t } from '@/lib/i18n'
import { useRSVP } from './shared'
import type { RSVPTemplateProps } from './types'

export default function Modern(props: RSVPTemplateProps) {
  const { members, displayName, answers, message, setMessage, submitted, anyAttending, loading, error, setAnswer, handleSubmit, key } = useRSVP(props)
  const { dict } = props
  const firstName = displayName.split(' ')[0] || 'you'
  const answeredCount = members.filter(m => answers[key(m)] !== null).length
  const progress = members.length > 0 ? answeredCount / members.length : 0

  if (submitted) {
    return (
      <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', textAlign: 'center', fontFamily: "'EB Garamond', serif" }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>{anyAttending ? '🎉' : '💌'}</div>
        <p style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--color-text)' }}>{anyAttending ? t(dict.successYes, { name: firstName }) : t(dict.successNo, { name: firstName })}</p>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 8 }}>{dict.successSub}</p>
      </section>
    )
  }

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '0.4rem' }}>{dict.sectionLabel}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2rem' }}>{t(dict.deadline, { deadline: dict.rsvpDeadline })}</p>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        {/* Progress bar */}
        {members.length > 1 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ height: 3, background: 'var(--color-border)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--color-primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, textAlign: 'right' }}>{answeredCount} / {members.length} confirmed</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {members.map((m, i) => {
            const ans = answers[key(m)]
            return (
              <div key={i} style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 17, color: 'var(--color-text)' }}>{m.name}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setAnswer(m, true)} style={{ width: 36, height: 36, borderRadius: '50%', background: ans === true ? '#2d6a40' : 'transparent', border: `1.5px solid ${ans === true ? '#2d6a40' : 'var(--color-border)'}`, fontSize: 16, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
                  <button type="button" onClick={() => setAnswer(m, false)} style={{ width: 36, height: 36, borderRadius: '50%', background: ans === false ? '#c4614a' : 'transparent', border: `1.5px solid ${ans === false ? '#c4614a' : 'var(--color-border)'}`, fontSize: 16, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>

        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={dict.messagePlaceholder} style={{ width: '100%', marginTop: '1.2rem', padding: '10px 12px', background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: 6, fontFamily: "'EB Garamond', serif", fontSize: 15, color: 'var(--color-text)', outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }} />

        {error && <p style={{ fontSize: 13, color: '#c4614a', fontStyle: 'italic', marginTop: 6 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '1.2rem', padding: '12px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: 6, fontFamily: "'EB Garamond', serif", fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? dict.sending : dict.sendReply}
        </button>
      </div>
    </section>
  )
}
