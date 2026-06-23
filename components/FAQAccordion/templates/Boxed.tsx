'use client'
import { useRouter, usePathname } from 'next/navigation'
import type { FAQTemplateProps } from './types'

export default function Boxed({ lang, dict }: FAQTemplateProps) {
  const router = useRouter()
  const pathname = usePathname()
  function handleBack() {
    sessionStorage.removeItem('wedding_guest')
    router.push(pathname.endsWith('/invitation') ? pathname.slice(0, -'/invitation'.length) : `/${lang}`)
  }

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2.5rem' }}>{dict.sectionLabel}</p>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {dict.items.map((item, i) => (
          <div key={i} style={{ border: '1px solid var(--color-primary)', padding: '1.4rem 1.6rem' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 8 }}>
              {String(i + 1).padStart(2, '0')}
            </p>
            <p style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--color-text)', marginBottom: 10 }}>{item.question}</p>
            <div style={{ width: 32, height: '0.5px', background: 'var(--color-border)', marginBottom: 10 }} />
            <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{item.answer}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <button onClick={handleBack} style={{ padding: '10px 28px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
          {dict.close}
        </button>
      </div>
    </section>
  )
}
