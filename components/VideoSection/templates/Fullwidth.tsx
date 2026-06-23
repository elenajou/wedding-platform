'use client'
import { useState } from 'react'
import Image from 'next/image'
import { type VideoTemplateProps, getEmbedSrc } from './types'

export default function Fullwidth({ source, posterUrl, dict }: VideoTemplateProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section style={{ background: 'var(--color-background)', padding: '2rem 0' }}>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '1.5rem' }}>{dict.title}</p>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '52%', background: '#111', overflow: 'hidden' }}>
        {!playing ? (
          <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => setPlaying(true)}>
            {posterUrl && <Image src={posterUrl} alt="Video thumbnail" fill style={{ objectFit: 'cover', opacity: 0.85 }} sizes="100vw" priority={false} />}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.28)' }}>
              <div style={{ width: 70, height: 70, background: 'rgba(255,255,255,0.92)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '22px solid #201d19', marginLeft: 4 }} />
              </div>
            </div>
          </div>
        ) : source.type === 'self' ? (
          <video src={source.src} controls autoPlay preload="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <iframe src={getEmbedSrc(source)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen loading="lazy" />
        )}
      </div>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.8rem', fontStyle: 'italic' }}>
        {playing ? dict.dataNotePlaying : dict.dataNoteIdle}
      </p>
    </section>
  )
}
