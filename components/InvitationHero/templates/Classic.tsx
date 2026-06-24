import React from 'react'
import styles from '../InvitationHero.module.css'
import { type HeroTemplateProps, getEl, elStyle, getContent, buildFontsUrl } from './types'

const GUEST_FONT = "'Italianno', cursive"
const GUEST_FONT_URL = 'https://fonts.googleapis.com/css2?family=Italianno&display=swap'

export default function Classic({
  brideName, groomName, guestName, groupName,
  elements, locale, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const guestStyle: React.CSSProperties = { fontFamily: GUEST_FONT, fontSize: '1.6em' }

  const fontsUrl = buildFontsUrl(elements)
  const visibleElements = [...elements].filter(e => e.visible !== false).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section className={styles.hero}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={GUEST_FONT_URL} precedence="default" />
      {fontsUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontsUrl} precedence="default" />
      )}

      {visibleElements.map(el => {
        switch (el.element_type) {
          case 'eyebrow':
            return (
              <p key={el.id} className={styles.eyebrow} style={elStyle(el)}>
                {getContent(el, locale, dict.eyebrow)}
              </p>
            )
          case 'names':
            return (
              <div key={el.id} className={styles.namesWrap}>
                <h1 className={styles.names} style={elStyle(el)}>
                  {brideName} <span className={styles.amp}>&amp;</span> {groomName}
                </h1>
              </div>
            )
          case 'greeting': {
            const prefix = getContent(el, locale, '')
            let greetingContent: React.ReactNode
            if (prefix && firstName) {
              greetingContent = <>{prefix}{' '}<span style={guestStyle}>{firstName}</span>,</>
            } else if (prefix) {
              greetingContent = <>{prefix}</>
            } else if (firstName) {
              const [before, after] = dict.dearGreeting.split('{name}')
              greetingContent = <>{before}<span style={guestStyle}>{firstName}</span>{after}</>
            } else {
              greetingContent = <>{dict.fallbackGreeting}</>
            }
            return (
              <p key={el.id} className={styles.greeting} style={elStyle(el)}>
                {greetingContent}
              </p>
            )
          }
          case 'body': {
            const bodyContent = getContent(el, locale, '')
            if (!bodyContent) return null
            return (
              <p key={el.id} className={styles.heroBody} style={elStyle(el)}>
                {bodyContent}
              </p>
            )
          }
          case 'tagline':
            return (
              <p key={el.id} className={styles.tagline} style={elStyle(el)}>
                {getContent(el, locale, dict.tagline)}
              </p>
            )
          case 'date':
            return (
              <div key={el.id} className={styles.dateBadge} style={elStyle(el)}>
                {getContent(el, locale, dict.weddingDate)}
              </div>
            )
          default:
            return null
        }
      })}

      <div className={styles.ornament}>
        <div className={styles.ornamentLine} />
        <div className={styles.ornamentDiamond} />
        <div className={styles.ornamentLine} />
      </div>
    </section>
  )
}
