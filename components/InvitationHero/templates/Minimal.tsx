import React from 'react'
import { type HeroTemplateProps, extractFontFamily } from './types'

const GUEST_FONT = "'Italianno', cursive"

export default function Minimal({
  groomName, brideName, guestName, groupName, namesFontUrl,
  heroTagline, heroEyebrow, heroGreeting, heroBodyText, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const fontFamily = namesFontUrl ? extractFontFamily(namesFontUrl) : null
  const guestNameStyle = { fontFamily: GUEST_FONT, fontSize: '1.4em' }

  const greeting = heroGreeting
    ? <>{heroGreeting}{firstName ? <> <span style={guestNameStyle}>{firstName}</span>,</> : ''}</>
    : firstName
    ? (() => { const [b, a] = dict.dearGreeting.split('{name}'); return <>{b}<span style={guestNameStyle}>{firstName}</span>{a}</> })()
    : dict.fallbackGreeting

  return (
    <section style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '5rem 2rem', textAlign: 'center',
      background: 'var(--color-background)', color: 'var(--color-text)',
      fontFamily: "'EB Garamond', serif",
    }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" />
      {namesFontUrl && <link rel="stylesheet" href={namesFontUrl} />}

      <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>
        {dict.weddingDate}
      </p>

      <h1 style={{
        fontSize: 'clamp(2.6rem, 8vw, 5rem)', fontWeight: 300, lineHeight: 1.1,
        fontFamily: fontFamily ? `'${fontFamily}', serif` : "'EB Garamond', serif",
        color: 'var(--color-text)', margin: '0.5rem 0 1.5rem',
      }}>
        {brideName} &amp; {groomName}
      </h1>

      {(heroEyebrow || dict.eyebrow) && (
        <p style={{ fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
          {heroEyebrow || dict.eyebrow}
        </p>
      )}

      <p style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-text-muted)', maxWidth: 360 }}>{greeting}</p>
      {heroBodyText && (
        <p style={{ fontSize: 15, color: 'var(--color-text-muted)', maxWidth: 380, marginTop: '1rem', lineHeight: 1.7 }}>{heroBodyText}</p>
      )}

      <p style={{ marginTop: '2rem', fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
        {heroTagline || dict.tagline}
      </p>
    </section>
  )
}
