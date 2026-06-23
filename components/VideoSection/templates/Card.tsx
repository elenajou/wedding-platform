'use client'
import { useState } from 'react'
import Image from 'next/image'
import { type VideoTemplateProps, getEmbedSrc } from './types'

export default function Card({ source, posterUrl, dict }: VideoTemplateProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '1.5rem' }}>{dict.title}</p>

      <div style={{ maxWidth: 640, margin: '0 auto', borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '0.5px solid var(--color-border)' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#111' }}>
          {!playing ? (
            <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => setPlaying(true)}>
              {posterUrl && <Image src={posterUrl} alt="Video thumbnail" fill style={{ objectFit: 'cover' }} sizes="640px" priority={false} />}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid #fff', marginLeft: 3 }} />
                </div>
              </div>
            </div>
          ) : source.type === 'self' ? (
            <video src={source.src} controls autoPlay preload="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          ) : (
            <iframe src={getEmbedSrc(source)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen loading="lazy" />
          )}
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '0.9rem 1.2rem' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{playing ? dict.dataNotePlaying : dict.dataNoteIdle}</p>
        </div>
      </div>
    </section>
  )
}
