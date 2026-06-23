'use client'
import { useRef } from 'react'
import type { GalleryTemplateProps } from './types'

export default function Carousel({ dict }: GalleryTemplateProps) {
  const photos = dict.photos ?? []
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'next' ? 280 : -280, behavior: 'smooth' })
  }

  if (photos.length === 0) return null

  return (
    <section style={{ padding: '4rem 0', background: 'var(--color-background)' }}>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>{dict.title}</p>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 15, fontStyle: 'italic', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>{dict.subtitle}</p>

      <div style={{ position: 'relative' }}>
        <div ref={trackRef} style={{
          display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory',
          padding: '0.5rem 2rem 1rem', scrollbarWidth: 'none',
        }}>
          {photos.map((photo, i) => (
            <div key={i} style={{ flex: '0 0 260px', scrollSnapAlign: 'start' }}>
              <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2, display: 'block' }} loading="lazy" />
              {photo.caption && (
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 6, paddingLeft: 2 }}>{photo.caption}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => scroll('prev')} style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--color-text)' }}>‹</button>
        <button onClick={() => scroll('next')} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--color-text)' }}>›</button>
      </div>
    </section>
  )
}
