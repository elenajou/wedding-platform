export type EnvelopeVariant = {
  rootBackground?: string
  rootBackgroundSize?: string
  rootBackgroundPosition?: string
  rootColor?: string
  decorations?: 'none' | 'floral' | 'corner-lines'
}

export const ENVELOPE_VARIANTS: Record<string, EnvelopeVariant> = {
  Classic: {},
  Minimal: {
    rootBackground: '#f7f4ef',
  },
  Floral: {
    decorations: 'floral',
  },
  Dark: {
    rootBackground: '#1a1510',
    rootColor: '#f4efe5',
  },
  Garden: {
    rootBackground: '#e8ede4',
    rootColor: '#2c3a28',
  },
}

export function getVariantStyle(variant: EnvelopeVariant, backgroundUrl?: string): React.CSSProperties & Record<string, string> {
  const style: Record<string, string> = {}
  if (backgroundUrl) {
    style.backgroundImage = `url(${backgroundUrl})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  } else if (variant.rootBackground) {
    style.background = variant.rootBackground
  }
  if (variant.rootColor) style['--section-color'] = variant.rootColor
  return style as React.CSSProperties & Record<string, string>
}
