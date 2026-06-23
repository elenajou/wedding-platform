import React from 'react'
import styles from '../InvitationHero.module.css'
import { type HeroTemplateProps, extractFontFamily } from './types'

function buildGreeting(
  guestName: string | null | undefined,
  groupName: string | undefined,
  dict: HeroTemplateProps['dict'],
  nameStyle?: React.CSSProperties
): React.ReactNode {
  const renderName = (name: string) => {
    const [before, after] = dict.dearGreeting.split('{name}')
    return <>{before}<span style={nameStyle}>{name}</span>{after}</>
  }
  if (guestName) return renderName(guestName.split(' ')[0])
  if (groupName) return renderName(groupName)
  return dict.fallbackGreeting
}

const GUEST_FONT = "'Italianno', cursive"
const GUEST_FONT_URL = 'https://fonts.googleapis.com/css2?family=Italianno&display=swap'

export default function Classic({
  groomName, brideName, guestName, groupName, namesFontUrl,
  heroTagline, heroEyebrow, heroGreeting, heroBodyText, dict,
}: HeroTemplateProps) {
  const firstName = guestName?.split(' ')[0] ?? groupName ?? ''
  const fontFamily = namesFontUrl ? extractFontFamily(namesFontUrl) : null
  const guestNameStyle = { fontFamily: GUEST_FONT, fontSize: '1.6em' }

  return (
    <section className={styles.hero}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={GUEST_FONT_URL} />
      {namesFontUrl && <link rel="stylesheet" href={namesFontUrl} />}

      <p className={styles.eyebrow}>{heroEyebrow || dict.eyebrow}</p>

      {heroGreeting ? (
        <>
          <p className={styles.greeting}>
            {heroGreeting}{firstName ? <> <span style={guestNameStyle}>{firstName}</span>,</> : ''}
          </p>
          {heroBodyText && <p className={styles.heroBody}>{heroBodyText}</p>}
        </>
      ) : (
        <>
          {buildGreeting(guestName, groupName, dict, guestNameStyle) && (
            <p className={styles.greeting}>{buildGreeting(guestName, groupName, dict, guestNameStyle)}</p>
          )}
          {heroBodyText && <p className={styles.heroBody}>{heroBodyText}</p>}
        </>
      )}

      <div className={styles.namesWrap}>
        <h1 className={styles.names} style={fontFamily ? { fontFamily: `'${fontFamily}', serif` } : undefined}>
          {brideName}
          <span className={styles.amp}>&amp;</span>
          {groomName}
        </h1>
      </div>

      <div className={styles.ornament}>
        <div className={styles.ornamentLine} />
        <div className={styles.ornamentDiamond} />
        <div className={styles.ornamentLine} />
      </div>

      <p className={styles.tagline}>{heroTagline || dict.tagline}</p>
      <div className={styles.dateBadge}>{dict.weddingDate}</div>
    </section>
  )
}
