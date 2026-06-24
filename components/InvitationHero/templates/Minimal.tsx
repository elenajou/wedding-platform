import React from 'react'
import { type HeroTemplateProps, elStyle, getContent, buildFontsUrl } from './types'

const GUEST_FONT = "'Italianno', cursive"

export default function Minimal({
  brideName, groomName, guestName, groupName,
  elements, locale, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const guestNameStyle = { fontFamily: GUEST_FONT, fontSize: '1.4em' }
  const fontsUrl = buildFontsUrl(elements)
  const visible = [...elements].filter(e => e.visible !== false).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '5rem 2rem', textAlign: 'center',
      background: 'var(--color-background)', color: 'var(--color-text)',
      fontFamily: "'EB Garamond', serif",
    }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" precedence="default" />
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} precedence="default" />}

      {visible.map(el => {
        switch (el.element_type) {
          case 'date':
            return (
              <p key={el.id} style={{ fontSize: 11, letterSpacing: '0.28em', color: 'var(--color-text-muted)', marginBottom: '0.6rem', ...elStyle(el) }}>
                {getContent(el, locale, dict.weddingDate)}
              </p>
            )
          case 'names':
            return (
              <h1 key={el.id} style={{ fontSize: 'clamp(2.6rem, 8vw, 5rem)', fontWeight: 300, lineHeight: 1.1, fontFamily: "'EB Garamond', serif", color: 'var(--color-text)', margin: '0.5rem 0 1.5rem', ...elStyle(el) }}>
                {brideName} &amp; {groomName}
              </h1>
            )
          case 'eyebrow':
            return (
              <p key={el.id} style={{ fontSize: 14, letterSpacing: '0.18em', color: 'var(--color-primary)', marginBottom: '1.5rem', ...elStyle(el) }}>
                {getContent(el, locale, dict.eyebrow)}
              </p>
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
              <p key={el.id} style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-text-muted)', maxWidth: 360, ...elStyle(el) }}>
                {content}
              </p>
            )
          }
          case 'body': {
            const body = getContent(el, locale, '')
            if (!body) return null
            return (
              <p key={el.id} style={{ fontSize: 15, color: 'var(--color-text-muted)', maxWidth: 380, marginTop: '1rem', lineHeight: 1.7, ...elStyle(el) }}>
                {body}
              </p>
            )
          }
          case 'tagline':
            return (
              <p key={el.id} style={{ marginTop: '2rem', fontSize: 13, letterSpacing: '0.22em', color: 'var(--color-text-muted)', ...elStyle(el) }}>
                {getContent(el, locale, dict.tagline)}
              </p>
            )
          default:
            return null
        }
      })}
    </section>
  )
}
