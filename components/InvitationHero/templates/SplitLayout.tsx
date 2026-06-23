import React from 'react'
import { type HeroTemplateProps, extractFontFamily } from './types'

const GUEST_FONT = "'Italianno', cursive"

export default function SplitLayout({
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
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      minHeight: '90svh', fontFamily: "'EB Garamond', serif",
    }}
    className="hero-split"
    >
      <style>{`@media(max-width:640px){.hero-split{grid-template-columns:1fr!important}.hero-split-img{min-height:240px!important}}`}</style>

      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" />
      {namesFontUrl && <link rel="stylesheet" href={namesFontUrl} />}

      {/* Image panel */}
      <div className="hero-split-img" style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundColor: backgroundUrl ? undefined : 'var(--color-border)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        minHeight: '40vh',
      }} />

      {/* Text panel */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 2.5rem', background: 'var(--color-background)',
        color: 'var(--color-text)',
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.8rem' }}>
          {heroEyebrow || dict.eyebrow}
        </p>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300, lineHeight: 1.1,
          fontFamily: fontFamily ? `'${fontFamily}', serif` : "'EB Garamond', serif",
          color: 'var(--color-text)', margin: '0 0 0.8rem',
        }}>
          {brideName}<br />
          <span style={{ fontSize: '0.7em', color: 'var(--color-primary)' }}>&amp;</span><br />
          {groomName}
        </h1>

        <div style={{ width: 48, height: '0.5px', background: 'var(--color-border)', marginBottom: '1.2rem' }} />

        <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{greeting}</p>
        {heroBodyText && (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: '0.8rem', lineHeight: 1.7 }}>{heroBodyText}</p>
        )}

        <p style={{ marginTop: '2rem', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          {heroTagline || dict.tagline}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: 11, letterSpacing: '0.18em', color: 'var(--color-primary)' }}>
          {dict.weddingDate}
        </p>
      </div>
    </section>
  )
}
