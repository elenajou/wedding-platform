import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'
import { resolveConfigByHost } from '@/lib/tenant'
import { GLOBAL_LOCALES } from '@/lib/i18n'

const DEFAULT_LOCALE = 'en'

function getLocale(request: NextRequest, supportedLocales: string[], defaultLocale: string): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && supportedLocales.includes(cookieLocale)) return cookieLocale

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => { headers[key] = value })
  const languages = new Negotiator({ headers }).languages()
  try {
    return match(languages, supportedLocales, defaultLocale)
  } catch {
    return defaultLocale
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // Resolve tenant and build augmented request headers
  const config = await resolveConfigByHost(host)
  const requestHeaders = new Headers(request.headers)
  if (config) {
    requestHeaders.set('x-wedding-id', config.id)
    requestHeaders.set('x-wedding-slug', config.slug)
  }

  // Skip lang redirect for dashboard, super-admin, and API paths
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const supportedLocales = config?.locales ?? Array.from(GLOBAL_LOCALES)
  const defaultLocale = config?.defaultLocale ?? DEFAULT_LOCALE

  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    const lang = pathname.split('/')[1]
    requestHeaders.set('x-lang', lang)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const locale = getLocale(request, supportedLocales, defaultLocale)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
}
