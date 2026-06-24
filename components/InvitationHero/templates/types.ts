import React from 'react'
import type { HeroElement, HeroElementType } from '@/lib/wedding-data'

export type { HeroElement, HeroElementType }

export type HeroTemplateProps = {
  brideName: string
  groomName: string
  guestName?: string | null
  groupName?: string
  backgroundUrl?: string
  overlayOpacity?: number
  elements: HeroElement[]
  locale?: string
  dict: {
    eyebrow: string
    tagline: string
    weddingDate: string
    dearGreeting: string
    fallbackGreeting: string
  }
}

export function getEl(elements: HeroElement[], type: HeroElementType): HeroElement | undefined {
  return elements.find(e => e.element_type === type && e.visible !== false)
}

export function elStyle(el: HeroElement | undefined): React.CSSProperties {
  if (!el) return {}
  const s: React.CSSProperties = {}
  if (el.font_family) s.fontFamily = `'${el.font_family}', serif`
  if (el.font_style && el.font_style !== 'normal') s.fontStyle = el.font_style as React.CSSProperties['fontStyle']
  if (el.font_weight && el.font_weight !== '400') s.fontWeight = el.font_weight as React.CSSProperties['fontWeight']
  if (el.font_size) s.fontSize = el.font_size
  if (el.letter_spacing) s.letterSpacing = el.letter_spacing
  if (el.font_color) s.color = el.font_color
  return s
}

export function getContent(el: HeroElement | undefined, locale: string | undefined, fallback: string): string {
  if (!el) return fallback
  if (locale && el.locale_content?.[locale]) return el.locale_content[locale]
  return el.content || fallback
}

export function buildFontsUrl(elements: HeroElement[]): string {
  const families = [...new Set(elements.map(e => e.font_family).filter(Boolean))]
  if (!families.length) return ''
  return `https://fonts.googleapis.com/css2?${families.map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,700;1,300;1,400`).join('&')}&display=swap`
}
