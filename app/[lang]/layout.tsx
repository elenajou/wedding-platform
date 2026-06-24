import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getWeddingConfigById } from '@/lib/tenant'
import { getDictionaryWithData, hasLocale } from './dictionaries'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import '../globals.css'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  try {
    const { dict } = await getDictionaryWithData(lang)
    return { title: dict.meta.title, description: dict.meta.description }
  } catch {
    return {}
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const h = await headers()
  const weddingId = h.get('x-wedding-id')
  const config = weddingId ? await getWeddingConfigById(weddingId) : null
  const availableLocales = config?.locales ?? ['en', 'es', 'zh']

  // If this wedding doesn't support the requested locale, redirect to its default
  if (config && !config.locales.includes(lang)) {
    redirect(`/${config.defaultLocale}`)
  }

  return (
    <>
      <link rel="preload" href="/assets/paper-background.png" as="image" />
      <link rel="preload" href="/assets/letter-lacing.svg" as="image" type="image/svg+xml" />
      <link rel="preload" href="/assets/flower-border.svg" as="image" type="image/svg+xml" />
      {children}
      <LanguageSwitcher lang={lang} availableLocales={availableLocales} />
    </>
  )
}
