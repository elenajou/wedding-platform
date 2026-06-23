'use client'
import Classic from './templates/Classic'
import Masonry from './templates/Masonry'
import Carousel from './templates/Carousel'
import Film from './templates/Film'
import Polaroid from './templates/Polaroid'
import type { GalleryTemplateProps } from './templates/types'

export type { GalleryPhoto } from './templates/types'

type Props = GalleryTemplateProps & { design?: string }

export default function PhotoGallery({ design = 'Classic', ...rest }: Props) {
  switch (design) {
    case 'Masonry':  return <Masonry {...rest} />
    case 'Carousel': return <Carousel {...rest} />
    case 'Film':     return <Film {...rest} />
    case 'Polaroid': return <Polaroid {...rest} />
    default:         return <Classic {...rest} />
  }
}
