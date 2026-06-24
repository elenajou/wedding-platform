import 'server-only'
import { headers } from 'next/headers'
import { t } from '@/lib/i18n'
import {
  getWeddingDetails,
  getWeddingSchedule,
  getWeddingFAQ,
  getWeddingPhotos,
  getWeddingLocations,
  getSectionConfig,
  type WeddingDetails,
  type SectionConfigMap,
  type LocationItem,
} from '@/lib/wedding-data'

const dictionaries = {
  en: () => import('./en.json').then((m) => m.default),
  es: () => import('./es.json').then((m) => m.default),
  zh: () => import('./zh.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>

export type WeddingDetailsClient = {
  targetDate: string
  videoSource:
    | { type: 'youtube'; videoId: string }
    | { type: 'vimeo'; videoId: string }
    | { type: 'self'; src: string }
    | null
  posterUrl: string | null
  coordinatorName: string
  coordinatorEmail: string
  brideName: string
  groomName: string
  namesFontUrl: string | null
  heroTagline: string | null
  letterEyebrow: string | null
  letterGreeting: string | null
  letterBodyText: string | null
  sections: SectionConfigMap
  locations: LocationItem[]
}

export type LocaleLetterData = {
  envelopeDict: {
    eyebrow: string
    names: string
    dearGuest: string
    dearGuestFallback: string
    letterBody: string
    viewInvitation: string
    needHelp: string
    contactCoordinator: string
  }
  letterEyebrow: string | null
  letterGreeting: string | null
  letterBodyText: string | null
}

async function getWeddingId(): Promise<string> {
  const h = await headers()
  const id = h.get('x-wedding-id')
  if (!id) throw new Error('No wedding ID in request — is middleware configured?')
  return id
}

export async function getAllLocaleLetterData(): Promise<Record<string, LocaleLetterData>> {
  const weddingId = await getWeddingId()
  const [enDict, esDict, zhDict, details] = await Promise.all([
    getDictionary('en'),
    getDictionary('es'),
    getDictionary('zh'),
    getWeddingDetails(weddingId),
  ])

  const vars = { bride: details.bride_name, groom: details.groom_name }

  const build = (staticDict: Awaited<ReturnType<typeof getDictionary>>, d: WeddingDetails, localeKey: string): LocaleLetterData => {
    const lc = (d.locale_content?.[localeKey] ?? {}) as Record<string, string>
    return {
      envelopeDict: {
        eyebrow: staticDict.envelope.eyebrow,
        names: t(staticDict.envelope.names, vars),
        dearGuest: staticDict.envelope.dearGuest,
        dearGuestFallback: staticDict.envelope.dearGuestFallback,
        letterBody: staticDict.envelope.letterBody,
        viewInvitation: staticDict.envelope.viewInvitation,
        needHelp: staticDict.envelope.needHelp,
        contactCoordinator: staticDict.envelope.contactCoordinator,
      },
      letterEyebrow: lc.letter_eyebrow ?? d.letter_eyebrow ?? null,
      letterGreeting: lc.letter_greeting ?? d.letter_greeting ?? null,
      letterBodyText: lc.letter_body_text ?? d.letter_body_text ?? null,
    }
  }

  return {
    en: build(enDict, details, 'en'),
    es: build(esDict, details, 'es'),
    zh: build(zhDict, details, 'zh'),
  }
}

export async function getDictionaryWithData(locale: Locale): Promise<{
  dict: Dictionary
  weddingDetails: WeddingDetailsClient
}> {
  const weddingId = await getWeddingId()

  const [staticDict, details, schedule, faq, photos, locations, sections] = await Promise.all([
    getDictionary(locale),
    getWeddingDetails(weddingId),
    getWeddingSchedule(weddingId),
    getWeddingFAQ(weddingId),
    getWeddingPhotos(weddingId),
    getWeddingLocations(weddingId),
    getSectionConfig(weddingId),
  ])

  const brideName = details.bride_name
  const groomName = details.groom_name
  const vars = { bride: brideName, groom: groomName }
  const lc = (details.locale_content?.[locale] ?? {}) as Record<string, string>

  const dict = {
    ...staticDict,
    meta: { ...staticDict.meta, title: t(staticDict.meta.title, vars) },
    envelope: {
      ...staticDict.envelope,
      names: t(staticDict.envelope.names, vars),
      fromLine: t(staticDict.envelope.fromLine, vars),
      postmarkDate: details.wedding_date ?? '',
    },
    rsvp: { ...staticDict.rsvp, rsvpDeadline: details.rsvp_deadline ?? '' },
    schedule: { ...staticDict.schedule, events: schedule as unknown as never[] },
    faq: { ...staticDict.faq, items: faq as unknown as never[] },
    gallery: { ...staticDict.gallery, photos: photos as unknown as never[] },
  } as Dictionary

  const videoSource =
    details.video_source_type && details.video_source_id
      ? details.video_source_type === 'self'
        ? ({ type: 'self', src: details.video_source_id } as const)
        : ({ type: details.video_source_type, videoId: details.video_source_id } as const)
      : null

  const weddingDetails: WeddingDetailsClient = {
    targetDate: details.wedding_date ?? '',
    videoSource,
    posterUrl: details.video_poster_url ?? null,
    coordinatorName: details.coordinator_name ?? '',
    coordinatorEmail: details.coordinator_email ?? '',
    brideName,
    groomName,
    namesFontUrl: details.names_font_url ?? null,
    heroTagline: lc.hero_tagline ?? details.hero_tagline ?? null,
    letterEyebrow: lc.letter_eyebrow ?? details.letter_eyebrow ?? null,
    letterGreeting: lc.letter_greeting ?? details.letter_greeting ?? null,
    letterBodyText: lc.letter_body_text ?? details.letter_body_text ?? null,
    sections,
    locations,
  }

  return { dict, weddingDetails }
}
