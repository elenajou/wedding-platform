'use client'
import { useRouter, usePathname } from 'next/navigation'
import type { FAQTemplateProps } from './types'

export default function Minimal({ lang, dict }: FAQTemplateProps) {
  const router = useRouter()
  const pathname = usePathname()
  function handleBack() {
    sessionStorage.removeItem('wedding_guest')
    router.push(pathname.endsWith('/invitation') ? pathname.slice(0, -'/invitation'.length) : `/${lang}`)
  }

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2.5rem' }}>{dict.sectionLabel}</p>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {dict.items.map((item, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--color-border)', padding: '1.4rem 0' }}>
            <p style={{ fontSize: 17, color: 'var(--color-text)', marginBottom: 8 }}>{item.question}</p>
            <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, fontStyle: 'italic' }}>{item.answer}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <button onClick={handleBack} style={{ padding: '10px 28px', background: 'transparent', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary)', fontFamily: "'EB Garamond', serif", fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
          {dict.close}
        </button>
      </div>
    </section>
  )
}
