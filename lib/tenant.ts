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
  enabled_designs: Record<string, string[]> | null
}

function dbToConfig(row: DbWedding): WeddingConfig {
  return {
    id: row.id,
    slug: row.slug,
    domains: row.domains ?? [],
    defaultLocale: row.default_locale,
    locales: row.locales ?? [row.default_locale],
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
    },
    enabledDesigns: row.enabled_designs ?? {},
  }
}

let _cache: WeddingConfig[] | null = null
let _cacheExpiry = 0
const CACHE_TTL_MS = 5 * 60 * 1000

async function loadConfigs(): Promise<WeddingConfig[]> {
  const now = Date.now()
  if (_cache && now < _cacheExpiry) return _cache

  try {
    const rows = await sql`
      SELECT id, slug, domains, default_locale, locales,
             feature_rsvp, feature_countdown, feature_gallery, feature_guestbook,
             feature_maps, feature_qr_code, feature_video_section, feature_schedule,
             feature_faq, feature_seating_card, enabled_designs
      FROM weddings
      WHERE active = true
    `
    _cache = (rows as unknown as DbWedding[]).map(dbToConfig)
    _cacheExpiry = now + CACHE_TTL_MS
    return _cache
  } catch (err) {
    console.error('[tenant] failed to load configs:', err)
    return _cache ?? []
  }
}

export function invalidateTenantCache(): void {
  _cache = null
  _cacheExpiry = 0
}

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
