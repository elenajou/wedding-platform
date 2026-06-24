import React from 'react'
import { type HeroTemplateProps, elStyle, getContent, buildFontsUrl } from './types'

const GUEST_FONT = "'Italianno', cursive"

export default function Fullscreen({
  brideName, groomName, guestName, groupName,
  backgroundUrl, overlayOpacity = 0.52, elements, locale, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const guestNameStyle = { fontFamily: GUEST_FONT, fontSize: '1.5em' }
  const fontsUrl = buildFontsUrl(elements)
  const visible = [...elements].filter(e => e.visible !== false).sort((a, b) => a.sort_order - b.sort_order)

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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" precedence="default" />
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} precedence="default" />}

      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOpacity})`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {visible.map(el => {
          switch (el.element_type) {
            case 'eyebrow':
              return (
                <p key={el.id} style={{ fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.75)', marginBottom: '1rem', ...elStyle(el) }}>
                  {getContent(el, locale, dict.eyebrow)}
                </p>
              )
            case 'names':
              return (
                <React.Fragment key={el.id}>
                  <h1 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 300, lineHeight: 1.05, fontFamily: "'EB Garamond', serif", color: '#fff', margin: '0 0 0.8rem', textShadow: '0 2px 16px rgba(0,0,0,0.4)', ...elStyle(el) }}>
                    {brideName} &amp; {groomName}
                  </h1>
                  <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.5)', margin: '0 auto 1.2rem' }} />
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
                <p key={el.id} style={{ fontSize: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', maxWidth: 380, ...elStyle(el) }}>
                  {content}
                </p>
              )
            }
            case 'body': {
              const body = getContent(el, locale, '')
              if (!body) return null
              return (
                <p key={el.id} style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 360, marginTop: '0.8rem', lineHeight: 1.7, ...elStyle(el) }}>
                  {body}
                </p>
              )
            }
            case 'tagline':
              return (
                <p key={el.id} style={{ marginTop: '2rem', fontSize: 12, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.65)', ...elStyle(el) }}>
                  {getContent(el, locale, dict.tagline)}
                </p>
              )
            case 'date':
              return (
                <p key={el.id} style={{ marginTop: '0.8rem', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', ...elStyle(el) }}>
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
