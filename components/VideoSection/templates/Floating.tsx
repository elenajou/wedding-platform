'use client'
import { useState } from 'react'
import Image from 'next/image'
import { type VideoTemplateProps, getEmbedSrc } from './types'

export default function Floating({ source, posterUrl, dict }: VideoTemplateProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section style={{ padding: '4rem 2rem', background: 'var(--color-background)', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}
        className="video-floating"
      >
        <style>{`@media(max-width:580px){.video-floating{grid-template-columns:1fr!important}}`}</style>

        {/* Text side */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.8rem' }}>{dict.title}</p>
          <div style={{ width: 40, height: '0.5px', background: 'var(--color-border)', marginBottom: '1.2rem' }} />
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.65 }}>
            {playing ? dict.dataNotePlaying : dict.dataNoteIdle}
          </p>
          {!playing && (
            <button onClick={() => setPlaying(true)} style={{ marginTop: '1.2rem', padding: '8px 20px', background: 'transparent', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary)', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {dict.playLabel}
            </button>
          )}
        </div>

        {/* Video side */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.12)' }}>
          {!playing ? (
            <div style={{ position: 'absolute', inset: 0, cursor: 'pointer', background: 'var(--color-border)' }} onClick={() => setPlaying(true)}>
              {posterUrl && <Image src={posterUrl} alt="Video thumbnail" fill style={{ objectFit: 'cover' }} sizes="360px" priority={false} />}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid #201d19', marginLeft: 3 }} />
                </div>
              </div>
            </div>
          ) : source.type === 'self' ? (
            <video src={source.src} controls autoPlay preload="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          ) : (
            <iframe src={getEmbedSrc(source)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen loading="lazy" />
          )}
        </div>
      </div>
    </section>
  )
}
