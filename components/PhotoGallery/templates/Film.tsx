'use client'
import { useRef } from 'react'
import type { GalleryTemplateProps } from './types'

export default function Film({ dict }: GalleryTemplateProps) {
  const photos = dict.photos ?? []
  const trackRef = useRef<HTMLDivElement>(null)

  if (photos.length === 0) return null

  return (
    <section style={{ padding: '4rem 0', background: 'var(--color-background)', overflow: 'hidden' }}>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '1.5rem' }}>{dict.title}</p>

      <div style={{ background: '#1a1a1a', padding: '14px 0', position: 'relative' }}>
        {/* top sprocket row */}
        <div style={{ position: 'absolute', top: 5, left: 0, right: 0, display: 'flex', gap: 18, padding: '0 12px' }}>
          {[...Array(20)].map((_, i) => <div key={i} style={{ width: 14, height: 10, background: '#333', borderRadius: 2, flexShrink: 0 }} />)}
        </div>

        <div ref={trackRef} style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 1.5rem', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
          {photos.map((photo, i) => (
            <div key={i} style={{ flex: '0 0 220px', scrollSnapAlign: 'start' }}>
              <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: 148, objectFit: 'cover', display: 'block', filter: 'contrast(1.05) saturate(0.9)' }} loading="lazy" />
              {photo.caption && (
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, color: '#8a7a60', fontStyle: 'italic', marginTop: 4, textAlign: 'center' }}>{photo.caption}</p>
              )}
            </div>
          ))}
        </div>

        {/* bottom sprocket row */}
        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, display: 'flex', gap: 18, padding: '0 12px' }}>
          {[...Array(20)].map((_, i) => <div key={i} style={{ width: 14, height: 10, background: '#333', borderRadius: 2, flexShrink: 0 }} />)}
        </div>
      </div>

      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 14, fontStyle: 'italic', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1.2rem' }}>{dict.subtitle}</p>
    </section>
  )
}
