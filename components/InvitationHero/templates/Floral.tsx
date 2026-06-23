import React from 'react'
import { type HeroTemplateProps, extractFontFamily } from './types'

const GUEST_FONT = "'Italianno', cursive"

// Inline SVG corner floral (single sprig, rotated for each corner)
function FloralCorner({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" style={{ position: 'absolute', opacity: 0.45, ...style }}>
      <g stroke="var(--color-primary)" strokeWidth="1" fill="none">
        <path d="M8 72 Q20 52 40 40" />
        <path d="M8 72 Q28 68 40 40" />
        <circle cx="40" cy="40" r="3" fill="var(--color-primary)" />
        <circle cx="22" cy="58" r="2" fill="var(--color-primary)" opacity=".6" />
        <circle cx="14" cy="65" r="1.5" fill="var(--color-primary)" opacity=".4" />
        <path d="M20 60 Q18 52 22 48" />
        <path d="M14 66 Q10 58 14 54" />
        <circle cx="38" cy="26" r="2.5" fill="var(--color-primary)" opacity=".5" />
        <path d="M40 40 Q42 30 38 24" />
      </g>
    </svg>
  )
}

export default function Floral({
  groomName, brideName, guestName, groupName, namesFontUrl,
  heroTagline, heroEyebrow, heroGreeting, heroBodyText, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const fontFamily = namesFontUrl ? extractFontFamily(namesFontUrl) : null
  const guestNameStyle = { fontFamily: GUEST_FONT, fontSize: '1.5em' }

  const greeting = heroGreeting
    ? <>{heroGreeting}{firstName ? <> <span style={guestNameStyle}>{firstName}</span>,</> : ''}</>
    : firstName
    ? (() => { const [b, a] = dict.dearGreeting.split('{name}'); return <>{b}<span style={guestNameStyle}>{firstName}</span>{a}</> })()
    : dict.fallbackGreeting

  return (
    <section style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '5rem 2rem', textAlign: 'center',
      background: 'var(--color-background)', color: 'var(--color-text)',
      fontFamily: "'EB Garamond', serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" />
      {namesFontUrl && <link rel="stylesheet" href={namesFontUrl} />}

      {/* Corner florals */}
      <FloralCorner style={{ top: 0, left: 0 }} />
      <FloralCorner style={{ top: 0, right: 0, transform: 'scaleX(-1)' }} />
      <FloralCorner style={{ bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
      <FloralCorner style={{ bottom: 0, right: 0, transform: 'scale(-1,-1)' }} />

      <div style={{ position: 'relative', maxWidth: 480 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.8rem' }}>
          {heroEyebrow || dict.eyebrow}
        </p>

        <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{greeting}</p>
        {heroBodyText && (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>{heroBodyText}</p>
        )}

        {/* Ornamental top rule */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-primary)', fontSize: 18 }}>✦</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
        </div>

        <h1 style={{
          fontSize: 'clamp(2.6rem, 8vw, 5rem)', fontWeight: 300, lineHeight: 1.1,
          fontFamily: fontFamily ? `'${fontFamily}', serif` : "'EB Garamond', serif",
          color: 'var(--color-text)', margin: '0 0 0.6rem',
        }}>
          {brideName} &amp; {groomName}
        </h1>

        {/* Ornamental bottom rule */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0.8rem 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-primary)', fontSize: 10 }}>◆</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
        </div>

        <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          {heroTagline || dict.tagline}
        </p>
        <p style={{ marginTop: '0.8rem', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
          {dict.weddingDate}
        </p>
      </div>
    </section>
  )
}
