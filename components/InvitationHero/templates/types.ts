export type HeroTemplateProps = {
  groomName: string
  brideName: string
  guestName?: string | null
  groupName?: string
  namesFontUrl?: string | null
  heroTagline?: string | null
  heroEyebrow?: string | null
  heroGreeting?: string | null
  heroBodyText?: string | null
  backgroundUrl?: string
  dict: {
    eyebrow: string
    tagline: string
    weddingDate: string
    dearGreeting: string
    fallbackGreeting: string
  }
}

export function extractFontFamily(url: string): string | null {
  try {
    const family = new URL(url).searchParams.get('family')
    if (!family) return null
    return family.split(':')[0].replace(/\+/g, ' ')
  } catch { return null }
}
