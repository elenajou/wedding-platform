export interface ColorScheme {
  name: string
  colorPrimary: string
  colorBackground: string
  colorSurface: string
  colorText: string
  colorTextMuted: string
  colorBorder: string
  colorAccent: string
  buttonBackground: string
  buttonText: string
  sealColor: string
}

export function getSectionCSSVars(scheme: ColorScheme): Record<string, string> {
  return {
    '--color-primary': scheme.colorPrimary,
    '--color-background': scheme.colorBackground,
    '--color-surface': scheme.colorSurface,
    '--color-text': scheme.colorText,
    '--color-text-muted': scheme.colorTextMuted,
    '--color-border': scheme.colorBorder,
    '--color-accent': scheme.colorAccent,
    '--btn-bg': scheme.buttonBackground,
    '--btn-text': scheme.buttonText,
    '--seal-color': scheme.sealColor,
  }
}

import { gold } from './gold'
import { blush } from './blush'
import { forest } from './forest'
import { navy } from './navy'

const SCHEMES: Record<string, ColorScheme> = { Gold: gold, Blush: blush, Forest: forest, Navy: navy }

export function getColorScheme(name: string): ColorScheme {
  return SCHEMES[name] ?? gold
}

export function getAllColorSchemes(): ColorScheme[] {
  return Object.values(SCHEMES)
}
