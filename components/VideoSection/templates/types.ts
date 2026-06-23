export type VideoSource =
  | { type: 'youtube'; videoId: string }
  | { type: 'vimeo'; videoId: string }
  | { type: 'self'; src: string }

export type VideoTemplateProps = {
  source: VideoSource
  posterUrl?: string
  dict: {
    title: string
    playLabel: string
    dataNotePlaying: string
    dataNoteIdle: string
  }
}

export function getEmbedSrc(source: VideoSource, autoplay = true): string {
  switch (source.type) {
    case 'youtube': return `https://www.youtube.com/embed/${source.videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`
    case 'vimeo':   return `https://player.vimeo.com/video/${source.videoId}?autoplay=${autoplay ? 1 : 0}`
    case 'self':    return source.src
  }
}
