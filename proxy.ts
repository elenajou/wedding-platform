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

  // Check against all globally-known locales, not just supported ones.
  // This handles the case where a path like /en/... exists but 'en' is no longer
  // a supported locale — without this, the middleware would prepend another locale
  // and produce /es/en/... (a 404) instead of /es/...
  const allLocales = Array.from(GLOBAL_LOCALES)
  const pathnameLocale = allLocales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length) || '/'
    : pathname

  if (pathnameLocale && supportedLocales.includes(pathnameLocale)) {
    requestHeaders.set('x-lang', pathnameLocale)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Either no locale prefix, or locale prefix is no longer supported → redirect
  const locale = getLocale(request, supportedLocales, defaultLocale)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
}
