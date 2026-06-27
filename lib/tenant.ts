import { sql } from './db'

export type WeddingFeatures = {
  rsvp: boolean
  countdown: boolean
  gallery: boolean
  guestbook: boolean
  maps: boolean
  qrCode: boolean
  videoSection: boolean
  schedule: boolean
  faq: boolean
  seatingCard: boolean
  dressCode: boolean
}

export type WeddingConfig = {
  id: string
  slug: string
  domains: string[]
  defaultLocale: string
  locales: string[]
  features: WeddingFeatures
  // per-section enabled design keys; empty object means all designs are enabled
  enabledDesigns: Record<string, string[]>
  dashboardLocale: string
}

type DbWedding = {
  id: string
  slug: string
  domains: string[]
  default_locale: string
  locales: string[]
  feature_rsvp: boolean
  feature_countdown: boolean
  feature_gallery: boolean
  feature_guestbook: boolean
  feature_maps: boolean
  feature_qr_code: boolean
  feature_video_section: boolean
  feature_schedule: boolean
  feature_faq: boolean
  feature_seating_card: boolean
  feature_dress_code: boolean
  enabled_designs: Record<string, string[]> | null
  dashboard_locale: string
}

function parseArr(val: unknown, fallback: string[]): string[] {
  if (Array.isArray(val)) return val as string[]
  if (typeof val === 'string' && val.startsWith('{'))
    return val.replace(/^{|}$/g, '').split(',').filter(Boolean)
  return fallback
}

function dbToConfig(row: DbWedding): WeddingConfig {
  return {
    id: row.id,
    slug: row.slug,
    domains: parseArr(row.domains, []),
    defaultLocale: row.default_locale,
    locales: parseArr(row.locales, [row.default_locale]),
    features: {
      rsvp: row.feature_rsvp,
      countdown: row.feature_countdown,
      gallery: row.feature_gallery,
      guestbook: row.feature_guestbook,
      maps: row.feature_maps,
      qrCode: row.feature_qr_code,
      videoSection: row.feature_video_section,
      schedule: row.feature_schedule,
      faq: row.feature_faq,
      seatingCard: row.feature_seating_card,
      dressCode: row.feature_dress_code,
    },
    enabledDesigns: row.enabled_designs ?? {},
    dashboardLocale: row.dashboard_locale ?? 'es',
  }
}

async function loadConfigs(): Promise<WeddingConfig[]> {
  try {
    const rows = await sql`
      SELECT id, slug, domains, default_locale, locales,
             feature_rsvp, feature_countdown, feature_gallery, feature_guestbook,
             feature_maps, feature_qr_code, feature_video_section, feature_schedule,
             feature_faq, feature_seating_card, feature_dress_code, enabled_designs, dashboard_locale
      FROM weddings
      WHERE active = true
    `
    return (rows as unknown as DbWedding[]).map(dbToConfig)
  } catch (err) {
    console.error('[tenant] failed to load configs:', err)
    return []
  }
}

// No-op kept so API route callers don't need updating
export function invalidateTenantCache(): void {}

export async function resolveConfigByHost(host: string): Promise<WeddingConfig | null> {
  const cleanHost = host.split(':')[0].toLowerCase()
  const configs = await loadConfigs()

  const exact = configs.find((c) => c.domains.some((d) => d.toLowerCase() === cleanHost))
  if (exact) return exact

  const subdomain = cleanHost.split('.')[0]
  return configs.find((c) => c.slug === subdomain) ?? null
}

export async function getWeddingConfigById(id: string): Promise<WeddingConfig | null> {
  const configs = await loadConfigs()
  return configs.find((c) => c.id === id) ?? null
}

export async function resolveConfigBySlug(slug: string): Promise<WeddingConfig | null> {
  const configs = await loadConfigs()
  return configs.find((c) => c.slug === slug) ?? null
}

export async function getAllWeddingConfigs(): Promise<WeddingConfig[]> {
  return loadConfigs()
}
