'use client'

import { usePathname } from 'next/navigation'
import styles from './LanguageSwitcher.module.css'

const LOCALE_LABELS: Record<string, string> = {
  es: 'ES',
  en: 'EN',
  zh: '中文',
}

type Props = {
  lang: string
  availableLocales: string[]
  langIndex?: number
}

export default function LanguageSwitcher({ lang, availableLocales, langIndex = 1 }: Props) {
  const pathname = usePathname()

  if (availableLocales.length <= 1) return null

  function switchLocale(newLocale: string) {
    if (newLocale === lang) return
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    const segments = pathname.split('/')
    segments[langIndex] = newLocale
    window.location.href = segments.join('/')
  }

  return (
    <div className={styles.switcher}>
      {availableLocales.map((locale) => (
        <button
          key={locale}
          className={`${styles.btn} ${locale === lang ? styles.active : ''}`}
          onClick={() => switchLocale(locale)}
          aria-label={locale}
        >
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
