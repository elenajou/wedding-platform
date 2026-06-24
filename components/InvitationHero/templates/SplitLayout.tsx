import React from 'react'
import { type HeroTemplateProps, elStyle, getContent, buildFontsUrl } from './types'

const GUEST_FONT = "'Italianno', cursive"

export default function SplitLayout({
  brideName, groomName, guestName, groupName,
  backgroundUrl, overlayOpacity = 0.32, elements, locale, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const guestNameStyle = { fontFamily: GUEST_FONT, fontSize: '1.5em' }
  const fontsUrl = buildFontsUrl(elements)
  const visible = [...elements].filter(e => e.visible !== false).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '90svh', fontFamily: "'EB Garamond', serif" }} className="hero-split">
      <style>{`@media(max-width:640px){.hero-split{grid-template-columns:1fr!important}.hero-split-img{min-height:240px!important}}`}</style>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" precedence="default" />
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} precedence="default" />}

      <div className="hero-split-img" style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundColor: backgroundUrl ? undefined : 'var(--color-border)',
        backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '40vh',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 2.5rem', background: 'var(--color-background)', color: 'var(--color-text)' }}>
        {visible.map(el => {
          switch (el.element_type) {
            case 'eyebrow':
              return (
                <p key={el.id} style={{ fontSize: 11, letterSpacing: '0.26em', color: 'var(--color-primary)', marginBottom: '0.8rem', ...elStyle(el) }}>
                  {getContent(el, locale, dict.eyebrow)}
                </p>
              )
            case 'names':
              return (
                <React.Fragment key={el.id}>
                  <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300, lineHeight: 1.1, fontFamily: "'EB Garamond', serif", color: 'var(--color-text)', margin: '0 0 0.8rem', ...elStyle(el) }}>
                    {brideName}<br />
                    <span style={{ fontSize: '0.7em', color: 'var(--color-primary)' }}>&amp;</span><br />
                    {groomName}
                  </h1>
                  <div style={{ width: 48, height: '0.5px', background: 'var(--color-border)', marginBottom: '1.2rem' }} />
                </React.Fragment>
              )
            case 'greeting': {
              const prefix = getContent(el, locale, '')
              let content: React.ReactNode
              if (prefix && firstName) {
                content = <>{prefix}{' '}<span style={guestNameStyle}>{firstName}</span>,</>
              } else if (prefix) {
                content = <>{prefix}</>
              } else if (firstName) {
                const [b, a] = dict.dearGreeting.split('{name}')
                content = <>{b}<span style={guestNameStyle}>{firstName}</span>{a}</>
              } else {
                content = <>{dict.fallbackGreeting}</>
              }
              return (
                <p key={el.id} style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--color-text-muted)', lineHeight: 1.5, ...elStyle(el) }}>
                  {content}
                </p>
              )
            }
            case 'body': {
              const body = getContent(el, locale, '')
              if (!body) return null
              return (
                <p key={el.id} style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: '0.8rem', lineHeight: 1.7, ...elStyle(el) }}>
                  {body}
                </p>
              )
            }
            case 'tagline':
              return (
                <p key={el.id} style={{ marginTop: '2rem', fontSize: 12, letterSpacing: '0.22em', color: 'var(--color-text-muted)', ...elStyle(el) }}>
                  {getContent(el, locale, dict.tagline)}
                </p>
              )
            case 'date':
              return (
                <p key={el.id} style={{ marginTop: '0.5rem', fontSize: 11, letterSpacing: '0.18em', color: 'var(--color-primary)', ...elStyle(el) }}>
                  {getContent(el, locale, dict.weddingDate)}
                </p>
              )
            default:
              return null
          }
        })}
      </div>
    </section>
  )
}
