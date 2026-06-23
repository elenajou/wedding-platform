'use client'
import { useState } from 'react'
import type { GalleryTemplateProps } from './types'

const ROTATIONS = [-2, 1.5, -1, 2.5, -1.8, 1.2, -2.2, 1.8, -0.8, 2, -1.5, 1]

export default function Polaroid({ dict }: GalleryTemplateProps) {
  const photos = dict.photos ?? []
  const [hovered, setHovered] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)' }}>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>{dict.title}</p>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 15, fontStyle: 'italic', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2.5rem' }}>{dict.subtitle}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', maxWidth: 860, margin: '0 auto' }}>
        {photos.map((photo, i) => {
          const rot = ROTATIONS[i % ROTATIONS.length]
          const isH = hovered === i
          return (
            <div key={i}
              style={{
                background: '#fff', padding: '10px 10px 36px',
                boxShadow: isH ? '0 12px 36px rgba(0,0,0,0.22)' : '0 4px 14px rgba(0,0,0,0.12)',
                transform: `rotate(${isH ? 0 : rot}deg) scale(${isH ? 1.04 : 1})`,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer', flex: '0 0 180px',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(i)}
            >
              <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: 148, objectFit: 'cover', display: 'block' }} loading="lazy" />
              <p style={{ fontFamily: "'Italianno', cursive", fontSize: 16, color: '#5a4e40', textAlign: 'center', marginTop: 8, lineHeight: 1.2 }}>
                {photo.caption || photo.alt}
              </p>
            </div>
          )
        })}
      </div>

      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" />

      {selected !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,12,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', padding: '14px 14px 52px', maxWidth: '80vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <img src={photos[selected].src} alt={photos[selected].alt} style={{ maxWidth: '70vw', maxHeight: '65vh', objectFit: 'contain', display: 'block' }} />
            <p style={{ fontFamily: "'Italianno', cursive", fontSize: 22, color: '#5a4e40', textAlign: 'center', marginTop: 10 }}>
              {photos[selected].caption || photos[selected].alt}
            </p>
          </div>
          <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', opacity: 0.7 }} onClick={() => setSelected(null)}>{dict.close}</button>
        </div>
      )}
    </section>
  )
}
