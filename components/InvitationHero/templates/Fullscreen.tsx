import React from 'react'
import { type HeroTemplateProps, extractFontFamily } from './types'

const GUEST_FONT = "'Italianno', cursive"

export default function Fullscreen({
  groomName, brideName, guestName, groupName, namesFontUrl,
  heroTagline, heroEyebrow, heroGreeting, heroBodyText, backgroundUrl, dict,
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
      minHeight: '100svh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '4rem 2rem', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
      backgroundColor: backgroundUrl ? undefined : 'var(--color-primary)',
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" />
      {namesFontUrl && <link rel="stylesheet" href={namesFontUrl} />}

      {/* dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: backgroundUrl ? 'rgba(20,16,12,0.52)' : 'rgba(0,0,0,0.18)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>
          {heroEyebrow || dict.eyebrow}
        </p>

        <h1 style={{
          fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 300, lineHeight: 1.05,
          fontFamily: fontFamily ? `'${fontFamily}', serif` : "'EB Garamond', serif",
          color: '#fff', margin: '0 0 0.8rem', textShadow: '0 2px 16px rgba(0,0,0,0.4)',
        }}>
          {brideName} &amp; {groomName}
        </h1>

        <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.5)', margin: '0 auto 1.2rem' }} />

        <p style={{ fontSize: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', maxWidth: 380 }}>{greeting}</p>
        {heroBodyText && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 360, marginTop: '0.8rem', lineHeight: 1.7 }}>{heroBodyText}</p>
        )}

        <p style={{ marginTop: '2rem', fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
          {heroTagline || dict.tagline}
        </p>

        <p style={{ marginTop: '0.8rem', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>
          {dict.weddingDate}
        </p>
      </div>
    </section>
  )
}
