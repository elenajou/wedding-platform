export type SectionKey =
  | 'envelope'
  | 'hero'
  | 'countdown'
  | 'seating'
  | 'rsvp'
  | 'schedule'
  | 'video'
  | 'gallery'
  | 'faq'
  | 'location'

export type DesignMeta = {
  key: string
  label: string
  description: string
  supportsBackgroundImage: boolean
}

export const SECTION_DESIGNS: Record<SectionKey, DesignMeta[]> = {
  envelope: [
    { key: 'Classic',  label: 'Classic',  description: 'Envelope with wax seal and paper background',    supportsBackgroundImage: true },
    { key: 'Minimal',  label: 'Minimal',  description: 'Clean cream background, no decoration',          supportsBackgroundImage: false },
    { key: 'Floral',   label: 'Floral',   description: 'Botanical corner accents around the envelope',   supportsBackgroundImage: true },
    { key: 'Dark',     label: 'Dark',     description: 'Deep charcoal background, gold details',         supportsBackgroundImage: true },
    { key: 'Garden',   label: 'Garden',   description: 'Soft sage green, airy and light',                supportsBackgroundImage: true },
  ],
  hero: [
    { key: 'Classic',     label: 'Classic',      description: 'Centered names with ornament divider',             supportsBackgroundImage: false },
    { key: 'Minimal',     label: 'Minimal',      description: 'Clean typography, generous whitespace',            supportsBackgroundImage: false },
    { key: 'Fullscreen',  label: 'Fullscreen',   description: 'Full-viewport background image with text overlay', supportsBackgroundImage: true },
    { key: 'SplitLayout', label: 'Split Layout', description: 'Image left, couple text right',                   supportsBackgroundImage: true },
    { key: 'Floral',      label: 'Floral',       description: 'Decorative floral corners framing the names',      supportsBackgroundImage: false },
  ],
  countdown: [
    { key: 'Classic',  label: 'Classic',  description: 'Card grid with gold numbers',                     supportsBackgroundImage: false },
    { key: 'Circular', label: 'Circular', description: 'Circular ring progress for each unit',            supportsBackgroundImage: false },
    { key: 'Elegant',  label: 'Elegant',  description: 'Large serif numbers on a single line',            supportsBackgroundImage: false },
    { key: 'Framed',   label: 'Framed',   description: 'Each unit inside an ornate bordered frame',       supportsBackgroundImage: false },
    { key: 'Film',     label: 'Film',     description: 'Film strip aesthetic with sprocket holes',        supportsBackgroundImage: true },
  ],
  seating: [
    { key: 'Classic',  label: 'Classic',  description: 'Clean card with header and member list',          supportsBackgroundImage: false },
    { key: 'Ornate',   label: 'Ornate',   description: 'Decorative double border, formal feel',           supportsBackgroundImage: false },
    { key: 'Postcard', label: 'Postcard', description: 'Horizontal postcard-style layout',                supportsBackgroundImage: true },
    { key: 'Badge',    label: 'Badge',    description: 'Name badge inspired, bold table number',          supportsBackgroundImage: false },
    { key: 'Formal',   label: 'Formal',   description: 'Vertical place card, embossed look',              supportsBackgroundImage: false },
  ],
  rsvp: [
    { key: 'Classic',  label: 'Classic',  description: 'Clean form with soft borders',                    supportsBackgroundImage: false },
    { key: 'Card',     label: 'Card',     description: 'Response card aesthetic, cream paper feel',       supportsBackgroundImage: false },
    { key: 'Minimal',  label: 'Minimal',  description: 'Stripped back, only the essentials',              supportsBackgroundImage: false },
    { key: 'Envelope', label: 'Envelope', description: 'Letterhead with envelope-flap top decoration',    supportsBackgroundImage: false },
    { key: 'Modern',   label: 'Modern',   description: 'Warm, friendly, card-based per-guest layout',     supportsBackgroundImage: false },
  ],
  schedule: [
    { key: 'Classic',     label: 'Classic',     description: 'Vertical timeline with animated dots',      supportsBackgroundImage: false },
    { key: 'Cards',       label: 'Cards',       description: 'Each event as a floating card',             supportsBackgroundImage: false },
    { key: 'Compact',     label: 'Compact',     description: 'Numbered list, minimal spacing',            supportsBackgroundImage: false },
    { key: 'Elegant',     label: 'Elegant',     description: 'Large time on left, event name on right',   supportsBackgroundImage: false },
    { key: 'Illustrated', label: 'Illustrated', description: 'Emoji icon per event type',                 supportsBackgroundImage: false },
  ],
  video: [
    { key: 'Classic',   label: 'Classic',    description: 'Centered player with title',                   supportsBackgroundImage: false },
    { key: 'Fullwidth', label: 'Full Width', description: 'Edge-to-edge wide player',                     supportsBackgroundImage: false },
    { key: 'Cinema',    label: 'Cinema',     description: 'Cinematic curtain framing',                    supportsBackgroundImage: false },
    { key: 'Card',      label: 'Card',       description: 'Rounded card with drop shadow',                supportsBackgroundImage: false },
    { key: 'Floating',  label: 'Floating',   description: 'Thumbnail beside text, side by side',          supportsBackgroundImage: false },
  ],
  gallery: [
    { key: 'Classic',  label: 'Classic',  description: 'Equal 3-column grid',                             supportsBackgroundImage: false },
    { key: 'Masonry',  label: 'Masonry',  description: 'Variable-height Pinterest-style columns',         supportsBackgroundImage: false },
    { key: 'Carousel', label: 'Carousel', description: 'Horizontal scroll with snap',                     supportsBackgroundImage: false },
    { key: 'Film',     label: 'Film',     description: 'Film strip with sprocket decoration',             supportsBackgroundImage: false },
    { key: 'Polaroid', label: 'Polaroid', description: 'White-framed polaroids with caption',             supportsBackgroundImage: false },
  ],
  faq: [
    { key: 'Classic', label: 'Classic', description: 'Expand / collapse accordion',                       supportsBackgroundImage: false },
    { key: 'Stacked', label: 'Stacked', description: 'All items visible as cards',                        supportsBackgroundImage: false },
    { key: 'Minimal', label: 'Minimal', description: 'Simple list with thin dividers',                    supportsBackgroundImage: false },
    { key: 'Boxed',   label: 'Boxed',   description: 'Each Q&A in a bordered box',                        supportsBackgroundImage: false },
    { key: 'Split',   label: 'Split',   description: 'Question left, answer right two-column',            supportsBackgroundImage: false },
  ],
  location: [
    { key: 'Classic', label: 'Classic', description: 'Centered cards with map embed',                     supportsBackgroundImage: false },
  ],
}

export function getAvailableDesigns(sectionKey: string): DesignMeta[] {
  return SECTION_DESIGNS[sectionKey as SectionKey] ?? SECTION_DESIGNS.hero
}

export function getDesignKeys(sectionKey: string): string[] {
  return getAvailableDesigns(sectionKey).map(d => d.key)
}
