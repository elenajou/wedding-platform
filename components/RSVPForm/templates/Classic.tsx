'use client'
import { t } from '@/lib/i18n'
import styles from '../RSVPForm.module.css'
import { useRSVP } from './shared'
import type { RSVPTemplateProps } from './types'

export default function Classic(props: RSVPTemplateProps) {
  const { members, displayName, answers, message, setMessage, submitted, anyAttending, loading, error, setAnswer, handleSubmit, key } = useRSVP(props)
  const { dict } = props
  const firstName = displayName.split(' ')[0] || 'you'

  if (submitted) {
    return (
      <section className={styles.section}>
        <div className={styles.success}>
          <p className={styles.successTitle}>{anyAttending ? t(dict.successYes, { name: firstName }) : t(dict.successNo, { name: firstName })}</p>
          <p className={styles.successSub}>{dict.successSub}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{dict.sectionLabel}</p>
      <p className={styles.deadline}>{t(dict.deadline, { deadline: dict.rsvpDeadline })}</p>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{dict.attendanceLabel}</label>
        <ul className={styles.partyList}>
          {members.map((m, i) => {
            const ans = answers[key(m)]
            return (
              <li key={i} className={styles.partyItem}>
                <span className={styles.partyName}>{m.name}</span>
                <div className={styles.partyBtns}>
                  <button type="button" className={`${styles.partyBtn} ${ans === true ? styles.partyYes : ''}`} onClick={() => setAnswer(m, true)}>{dict.accepts}</button>
                  <button type="button" className={`${styles.partyBtn} ${ans === false ? styles.partyNo : ''}`} onClick={() => setAnswer(m, false)}>{dict.declines}</button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{dict.messageLabel}</label>
        <textarea className={styles.textarea} placeholder={dict.messagePlaceholder} value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>{loading ? dict.sending : dict.sendReply}</button>
    </section>
  )
}
