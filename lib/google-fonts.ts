export type GoogleFont = { family: string; category: 'script' | 'serif' | 'display' | 'sans-serif' }

export const WEDDING_FONTS: GoogleFont[] = [
  // Script
  { family: 'Great Vibes', category: 'script' },
  { family: 'Dancing Script', category: 'script' },
  { family: 'Italianno', category: 'script' },
  { family: 'Sacramento', category: 'script' },
  { family: 'Alex Brush', category: 'script' },
  { family: 'Allura', category: 'script' },
  { family: 'Tangerine', category: 'script' },
  { family: 'Pinyon Script', category: 'script' },
  { family: 'Parisienne', category: 'script' },
  { family: 'Clicker Script', category: 'script' },
  { family: 'Sevillana', category: 'script' },
  // Serif
  { family: 'Cormorant Garamond', category: 'serif' },
  { family: 'EB Garamond', category: 'serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Libre Baskerville', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Crimson Text', category: 'serif' },
  { family: 'Gilda Display', category: 'serif' },
  { family: 'Sorts Mill Goudy', category: 'serif' },
  { family: 'Quattrocento', category: 'serif' },
  { family: 'Cardo', category: 'serif' },
  // Display
  { family: 'Cinzel', category: 'display' },
  { family: 'Cinzel Decorative', category: 'display' },
  { family: 'Marcellus SC', category: 'display' },
  { family: 'Josefin Slab', category: 'display' },
  { family: 'Poiret One', category: 'display' },
  { family: 'Spectral', category: 'display' },
  { family: 'Unna', category: 'display' },
  // Sans-serif
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Josefin Sans', category: 'sans-serif' },
  { family: 'Jost', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
]

export const FONT_CATEGORIES = ['script', 'serif', 'display', 'sans-serif'] as const

// Build a Google Fonts CSS2 URL loading all requested families at 300,400,700 normal+italic
export function buildGoogleFontsUrl(families: string[]): string {
  const unique = [...new Set(families.filter(Boolean))]
  if (!unique.length) return ''
  const params = unique
    .map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,700;1,300;1,400`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
