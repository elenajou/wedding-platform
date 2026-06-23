export type GalleryPhoto = { src: string; alt: string; caption?: string }

export type GalleryTemplateProps = {
  dict: {
    title: string
    subtitle: string
    close: string
    previous: string
    next: string
    countOf: string
    photos: GalleryPhoto[]
  }
}
