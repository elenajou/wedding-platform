'use client'
import { useState } from 'react'
import Image from 'next/image'
import { type VideoTemplateProps, getEmbedSrc } from './types'

export default function Cinema({ source, posterUrl, dict }: VideoTemplateProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section style={{ background: '#0d0d0d', padding: '4rem 2rem', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8a7a60', textAlign: 'center', marginBottom: '2rem' }}>{dict.title}</p>

      {/* Cinema curtains */}
      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
        {/* left curtain */}
        <div style={{ position: 'absolute', left: -8, top: -8, bottom: 0, width: 32, background: 'linear-gradient(to right, #2a0a0a, transparent)', zIndex: 1, pointerEvents: 'none' }} />
        {/* right curtain */}
        <div style={{ position: 'absolute', right: -8, top: -8, bottom: 0, width: 32, background: 'linear-gradient(to left, #2a0a0a, transparent)', zIndex: 1, pointerEvents: 'none' }} />
        {/* top valance */}
        <div style={{ position: 'absolute', top: -8, left: 0, right: 0, height: 18, background: '#3a1010', zIndex: 2, borderRadius: '2px 2px 0 0' }} />

        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', border: '2px solid #2a2a2a' }}>
          {!playing ? (
            <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => setPlaying(true)}>
              {posterUrl && <Image src={posterUrl} alt="Video thumbnail" fill style={{ objectFit: 'cover', opacity: 0.7 }} sizes="720px" priority={false} />}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(176,141,87,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 3 }} />
                </div>
              </div>
              <p style={{ position: 'absolute', bottom: '1rem', width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.2em' }}>{dict.playLabel}</p>
            </div>
          ) : source.type === 'self' ? (
            <video src={source.src} controls autoPlay preload="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          ) : (
            <iframe src={getEmbedSrc(source)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen loading="lazy" />
          )}
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#6a5a48', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>
        {playing ? dict.dataNotePlaying : dict.dataNoteIdle}
      </p>
    </section>
  )
}
