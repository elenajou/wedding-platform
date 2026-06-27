import 'server-only'
import { sql } from './db'

export type WeddingDetails = {
  id: string
  wedding_id: string
  bride_name: string
  groom_name: string
  wedding_date: string | null
  ceremony_time: string | null
  ceremony_location: string | null
  reception_time: string | null
  reception_location: string | null
  coordinator_email: string | null
  coordinator_name: string | null
  rsvp_deadline: string | null
  names_font_url: string | null
  hero_eyebrow: string | null
  hero_tagline: string | null
  hero_greeting: string | null
  hero_body_text: string | null
  letter_eyebrow: string | null
  letter_greeting: string | null
  letter_body_text: string | null
  video_source_type: 'youtube' | 'vimeo' | 'self' | null
  video_source_id: string | null
  video_poster_url: string | null
  locale_content: Record<string, Record<string, string>>
}

export type ScheduleEvent = {
  time: string
  isoTime: string
  name: string
  description: string
}

export type FAQItem = {
  question: string
  answer: string
}

export type PhotoItem = {
  src: string
  alt: string
  caption?: string
}

export type SectionConfig = {
  backgroundUrl: string
  backgroundColor: string
  fontColor: string
  sortOrder: number
  overlayOpacity: number
  design: string
  colorScheme: string
  visible: boolean
}

export type SectionConfigMap = Record<string, SectionConfig>

export async function getWeddingDetails(weddingId: string): Promise<WeddingDetails> {
  const rows = await sql`SELECT * FROM wedding_details WHERE wedding_id = ${weddingId} LIMIT 1`
  if (!rows[0]) throw new Error(`No wedding_details found for wedding ${weddingId}`)
  return rows[0] as unknown as WeddingDetails
}

export async function getWeddingSchedule(weddingId: string): Promise<ScheduleEvent[]> {
  const rows = await sql`
    SELECT time_label, iso_time, event_name, description
    FROM wedding_schedule
    WHERE wedding_id = ${weddingId}
    ORDER BY sort_order
  `
  return rows.map((row) => ({
    time: row.time_label as string,
    isoTime: row.iso_time as string,
    name: row.event_name as string,
    description: (row.description as string) ?? '',
  }))
}

export async function getWeddingFAQ(weddingId: string): Promise<FAQItem[]> {
  const rows = await sql`
    SELECT question, answer
    FROM wedding_faq
    WHERE wedding_id = ${weddingId}
    ORDER BY sort_order
  `
  return rows.map((row) => ({
    question: row.question as string,
    answer: row.answer as string,
  }))
}

export async function getSectionConfig(weddingId: string): Promise<SectionConfigMap> {
  const rows = await sql`
    SELECT section_key, design, color_scheme, background_url, background_color,
           font_color, overlay_opacity, sort_order, visible
    FROM section_config
    WHERE wedding_id = ${weddingId}
  `
  const map: SectionConfigMap = {}
  for (const row of rows) {
    map[row.section_key as string] = {
      backgroundUrl: (row.background_url as string) || '',
      backgroundColor: (row.background_color as string) || '#faf7f2',
      fontColor: (row.font_color as string) || '',
      sortOrder: (row.sort_order as number) ?? 0,
      overlayOpacity: (row.overlay_opacity as number) ?? 0.32,
      design: (row.design as string) || 'Classic',
      colorScheme: (row.color_scheme as string) || 'Gold',
      visible: (row.visible as boolean) !== false,
    }
  }
  return map
}

export type LocationItem = {
  id: string
  sort_order: number
  title: string
  address: string
  description: string
  image_url: string
  maps_link: string
  waze_link: string
  embed_url: string
  font_title: string
  font_description: string
  color_title: string
  color_description: string
  size_title: string
  size_description: string
  spacing_title: string
  spacing_description: string
  italic_title: boolean
  italic_description: boolean
  bold_title: boolean
  bold_description: boolean
}

export type DressCodeItem = {
  id: string
  sort_order: number
  title: string
  description: string
  image_urls: string[]
  locale_content: Record<string, { title?: string; description?: string }>
}

export async function getWeddingDressCode(weddingId: string): Promise<DressCodeItem[]> {
  const rows = await sql`
    SELECT id, sort_order, title, description, image_urls, locale_content
    FROM wedding_dress_code
    WHERE wedding_id = ${weddingId}
    ORDER BY sort_order
  `
  return rows as DressCodeItem[]
}

export async function getWeddingLocations(weddingId: string): Promise<LocationItem[]> {
  const rows = await sql`
    SELECT id, sort_order, title, address, description, image_url, maps_link, waze_link, embed_url, font_title, font_description, color_title, color_description, size_title, size_description, spacing_title, spacing_description, italic_title, italic_description, bold_title, bold_description
    FROM wedding_locations
    WHERE wedding_id = ${weddingId}
    ORDER BY sort_order
  `
  return rows as LocationItem[]
}

export type HeroElementType = 'eyebrow' | 'names' | 'greeting' | 'body' | 'tagline' | 'date' | 'spacer'

export type HeroElement = {
  id: string
  sort_order: number
  element_type: HeroElementType
  content: string
  locale_content: Record<string, string>  // locale → content string
  font_family: string
  font_style: 'normal' | 'italic'
  font_weight: string
  font_size: string       // CSS value e.g. "2rem", "24px", or "" for template default
  letter_spacing: string  // CSS value e.g. "0.1em", "2px", or "" for template default
  font_color: string      // CSS color value e.g. "#ffffff", or "" for template default
  visible: boolean
}

export async function getHeroElements(weddingId: string): Promise<HeroElement[]> {
  const rows = await sql`
    SELECT id, sort_order, element_type, content, locale_content, font_family, font_style, font_weight, font_size, letter_spacing, font_color, visible
    FROM hero_elements
    WHERE wedding_id = ${weddingId}
    ORDER BY sort_order
  `
  return rows.map(r => ({
    ...r,
    locale_content: (r.locale_content ?? {}) as Record<string, string>,
    visible: r.visible !== false,
  })) as HeroElement[]
}

export async function getWeddingPhotos(weddingId: string): Promise<PhotoItem[]> {
  const rows = await sql`
    SELECT src, alt, caption
    FROM wedding_photos
    WHERE wedding_id = ${weddingId}
    ORDER BY sort_order
  `
  return rows.map((row) => ({
    src: row.src as string,
    alt: (row.alt as string) || '',
    caption: (row.caption as string) || undefined,
  }))
}
