'use client'
import { useState } from 'react'
import type { GalleryTemplateProps } from './types'

export default function Masonry({ dict }: GalleryTemplateProps) {
  const photos = dict.photos ?? []
  const [selected, setSelected] = useState<number | null>(null)

  if (photos.length === 0) return null
  const active = selected !== null ? photos[selected] : null

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)' }}>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>{dict.title}</p>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 15, fontStyle: 'italic', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2rem' }}>{dict.subtitle}</p>

      {/* CSS columns masonry */}
      <div style={{ columns: '3 180px', gap: 10, maxWidth: 860, margin: '0 auto' }}>
        {photos.map((photo, i) => (
          <div key={i} style={{ breakInside: 'avoid', marginBottom: 10, cursor: 'pointer' }} onClick={() => setSelected(i)}>
            <img src={photo.src} alt={photo.alt} style={{ width: '100%', display: 'block', borderRadius: 2 }} loading="lazy" />
            {photo.caption && (
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px 2px' }}>{photo.caption}</p>
            )}
          </div>
        ))}
      </div>

      {active && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,12,0.94)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setSelected(null)}>
          <img src={active.src} alt={active.alt} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 2 }} onClick={e => e.stopPropagation()} />
          <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', opacity: 0.7 }} onClick={() => setSelected(null)}>{dict.close}</button>
        </div>
      )}
    </section>
  )
}
