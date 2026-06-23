'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from '../FAQAccordion.module.css'
import rsvpStyles from '@/components/RSVPForm/RSVPForm.module.css'
import type { FAQTemplateProps } from './types'

export default function Classic({ coordinatorEmail = 'coordinator@example.com', coordinatorName = 'our wedding coordinator', lang, dict }: FAQTemplateProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  function handleBack() {
    sessionStorage.removeItem('wedding_guest')
    const backUrl = pathname.endsWith('/invitation') ? pathname.slice(0, -'/invitation'.length) : `/${lang}`
    router.push(backUrl)
  }

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{dict.sectionLabel}</p>
      {dict.items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className={styles.item}>
            <button className={styles.trigger} aria-expanded={isOpen} onClick={() => setOpenIndex(prev => prev === i ? null : i)}>
              <span className={styles.question}>{item.question}</span>
              <span className={styles.icon} aria-hidden="true" />
            </button>
            <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        )
      })}
      <button onClick={handleBack} className={rsvpStyles.submitBtn}>{dict.close}</button>
    </section>
  )
}
