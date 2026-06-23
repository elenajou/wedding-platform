'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'
import type { LocaleLetterData } from '@/app/[lang]/dictionaries'
import styles from './EnvelopeGate.module.css'

type Stage = 'addressing' | 'sending' | 'flipping' | 'opening' | 'open' | 'submitting' | 'done'

const LANGUAGE_TO_LOCALE: Record<string, string> = {
  english: 'en',
  spanish: 'es',
  chinese: 'zh',
}

type LookupResult = {
  found: boolean
  guestName: string | null
  groupName: string
  tableName: string
  allocatedSeats: number
  groupMembers: string[]
  language?: string
}

type Props = {
  dict: {
    eyebrow: string
    names: string
    dearGuest: string
    dearGuestFallback: string
    letterBody: string
    viewInvitation: string
    needHelp: string
    contactCoordinator: string
    fromLine: string
    toPhone: string
    toCode: string
    phonePlaceholder: string
    codePlaceholder: string
    errorEmpty: string
    modePhone: string
    modeCode: string
    errorNotFound: string
    errorGeneric: string
    useInstead: string
    inviteCode: string
    phoneNumber: string
    hintSending: string
    hintDefault: string
    postmarkTop: string
    postmarkDate: string
  }
  lang: string
  backgroundUrl?: string
  backgroundColor?: string
  fontColor?: string
  namesFontUrl?: string | null
  coordinatorEmail?: string | null
  letterEyebrow?: string | null
  letterGreeting?: string | null
  letterBodyText?: string | null
  allLocaleLetterData?: Record<string, LocaleLetterData>
  prototype?: boolean
  design?: string
}

function extractFontFamily(url: string): string | null {
  try {
    const family = new URL(url).searchParams.get('family')
    if (!family) return null
    return family.split(':')[0].replace(/\+/g, ' ')
  } catch {
    return null
  }
}

const DEMO_GUEST = {
  found: true,
  guestName: 'Sofia Morales',
  groupName: 'Morales Family',
  tableName: 'Table 1',
  allocatedSeats: 3,
  groupMembers: [
    { id: 1, name: 'Sofia Morales' },
    { id: 2, name: 'Diego Morales' },
    { id: 3, name: 'Ana Morales' },
  ],
}

export default function EnvelopeGate({ dict, lang, design, backgroundUrl, backgroundColor, fontColor, namesFontUrl, coordinatorEmail, letterEyebrow, letterGreeting, letterBodyText, allLocaleLetterData, prototype = false }: Props) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('addressing')
  const [mode, setMode] = useState<'phone' | 'passcode'>('phone')
  const [input, setInput] = useState('+')
  const [error, setError] = useState('')
  const [letterVisible, setLetterVisible] = useState(false)
  const [slideDownActive, setSlideDownActive] = useState(false)
  const [guestFirstName, setGuestFirstName] = useState('')
  const [guestGroupName, setGuestGroupName] = useState('')
  const [guestLocale, setGuestLocale] = useState(lang)
  const [envelopeFading, setEnvelopeFading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSend() {
    const value = input.trim()
    if (!value) {
      setError(t(dict.errorEmpty, { mode: mode === 'phone' ? dict.modePhone : dict.modeCode }))
      return
    }
    setError('')
    setStage('sending')

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'phone' ? { phone: value, lang } : { passcode: value.toUpperCase(), lang }
        ),
      })
      const data: LookupResult = await res.json()

      if (!data.found) {
        setError(dict.errorNotFound)
        setStage('addressing')
        return
      }

      sessionStorage.setItem('wedding_guest', JSON.stringify(data))

      const firstName = data.guestName?.split(' ')[0] ?? ''
      setGuestFirstName(firstName)
      setGuestGroupName(data.groupName ?? '')
      const resolvedLocale = LANGUAGE_TO_LOCALE[data.language?.toLowerCase() ?? ''] ?? lang
      setGuestLocale(resolvedLocale)

      setTimeout(() => {
        setStage('flipping')
        setTimeout(() => {
          setStage('opening')
          setTimeout(() => {
            setStage('open')
            setTimeout(() => {
              setLetterVisible(true)
              requestAnimationFrame(() => requestAnimationFrame(() => setSlideDownActive(true)))
            }, 200)
          }, 950)
        }, 900)
      }, 600)
    } catch {
      setError(dict.errorGeneric)
      setStage('addressing')
    }
  }

  function handleViewInvitation() {
    setEnvelopeFading(true)
    setTimeout(() => setStage('done'), 500)
    setTimeout(() => router.push(`/${guestLocale}/invitation`), 1200)
  }

  function handlePrototypeEnter() {
    sessionStorage.setItem('wedding_guest', JSON.stringify(DEMO_GUEST))
    setGuestFirstName(DEMO_GUEST.guestName.split(' ')[0])
    setGuestGroupName(DEMO_GUEST.groupName)
    setStage('flipping')
    setTimeout(() => {
      setStage('opening')
      setTimeout(() => {
        setStage('open')
        setTimeout(() => {
          setLetterVisible(true)
          requestAnimationFrame(() => requestAnimationFrame(() => setSlideDownActive(true)))
        }, 200)
      }, 950)
    }, 900)
  }

  if (!mounted) return null

  const flapOpen = stage === 'opening' || stage === 'open' || stage === 'submitting' || stage === 'done'
  const isAddressing = stage === 'addressing' || stage === 'sending'
  const isFlipped = stage !== 'addressing' && stage !== 'sending'

  const effectiveName = guestFirstName || guestGroupName
  const fontFamily = namesFontUrl ? extractFontFamily(namesFontUrl) : null
  const guestNameStyle: React.CSSProperties = { fontFamily: "'Italianno', cursive", fontSize: '1.6em' }

  const localeData = allLocaleLetterData?.[guestLocale]
  const ld = localeData?.envelopeDict ?? dict
  const activeLetterEyebrow = localeData?.letterEyebrow ?? letterEyebrow
  const activeLetterGreeting = localeData?.letterGreeting ?? letterGreeting
  const activeLetterBodyText = localeData?.letterBodyText ?? letterBodyText

  // Design variant style overrides (applied to root before explicit props)
  const designVariants: Record<string, React.CSSProperties & Record<string, string>> = {
    Minimal: { background: '#f7f4ef' },
    Dark:    { background: '#1a1510', '--section-color': '#f4efe5' },
    Garden:  { background: '#e8ede4', '--section-color': '#2c3a28' },
  }
  const variantStyle = designVariants[design ?? ''] ?? {}

  const rootStyle: React.CSSProperties & Record<string, string> = { ...variantStyle }
  if (backgroundUrl) {
    rootStyle.backgroundImage = `url(${backgroundUrl})`
    rootStyle.backgroundSize = 'cover'
    rootStyle.backgroundPosition = 'center'
  }
  if (backgroundColor) rootStyle['--root-bg'] = backgroundColor
  if (fontColor) rootStyle['--section-color'] = fontColor

  // Floral corner decorations for 'Floral' variant
  const showFloral = (design ?? 'Classic') === 'Floral'

  return (
    <div className={`${styles.root} ${stage === 'done' ? styles.fading : ''}`} style={{ ...rootStyle, position: 'relative' }}>
      {showFloral && (
        <>
          {[
            { top: 0, left: 0, transform: 'none' },
            { top: 0, right: 0, transform: 'scaleX(-1)' },
            { bottom: 0, left: 0, transform: 'scaleY(-1)' },
            { bottom: 0, right: 0, transform: 'scale(-1,-1)' },
          ].map((pos, i) => (
            <svg key={i} viewBox="0 0 80 80" width="80" height="80" style={{ position: 'absolute', opacity: 0.35, pointerEvents: 'none', zIndex: 0, ...pos }}>
              <g stroke="#b08d57" strokeWidth="1" fill="none">
                <path d="M8 72 Q20 52 40 40" /><path d="M8 72 Q28 68 40 40" />
                <circle cx="40" cy="40" r="3" fill="#b08d57" />
                <circle cx="22" cy="58" r="2" fill="#b08d57" opacity=".6" />
                <circle cx="14" cy="65" r="1.5" fill="#b08d57" opacity=".4" />
                <path d="M20 60 Q18 52 22 48" /><path d="M14 66 Q10 58 14 54" />
                <circle cx="38" cy="26" r="2.5" fill="#b08d57" opacity=".5" />
                <path d="M40 40 Q42 30 38 24" />
              </g>
            </svg>
          ))}
        </>
      )}
      <div className={`${styles.scene} ${envelopeFading ? styles.fadingOut : ''}`} style={{ position: 'relative', zIndex: 1 }}>

        {/* Letter: hidden inside, rises after open */}
        <div
          className={[
            styles.letter,
            letterVisible ? (stage === 'done' ? styles.sent : styles.risen) : '',
          ].join(' ')}
        >
          <div className={`${styles.letterContent} ${letterVisible ? styles.visible : ''}`}>

            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italianno&display=swap" />
            {namesFontUrl && (
              // eslint-disable-next-line @next/next/no-page-custom-font
              <link rel="stylesheet" href={namesFontUrl} />
            )}

            <p className={styles.letterGreeting}>
              {(() => {
                if (activeLetterGreeting) {
                  return <>{activeLetterGreeting}{effectiveName ? <> <span style={guestNameStyle}>{effectiveName}</span>,</> : ''}</>
                }
                if (effectiveName) {
                  const [before, after] = ld.dearGuest.split('{name}')
                  return <>{before}<span style={guestNameStyle}>{effectiveName}</span>{after}</>
                }
                return <>{ld.dearGuestFallback}</>
              })()}{' '}
              <br />
              {activeLetterBodyText
                ? t(activeLetterBodyText, { name: effectiveName })
                : ld.letterBody}
            </p>

            <div className={styles.letterHead}>
              <p
                className={styles.letterNames}
                style={fontFamily ? { fontFamily: `'${fontFamily}', serif` } : undefined}
              >
                {(() => {
                  const parts = ld.names.split('&')
                  if (parts.length === 2) {
                    return <>{parts[0].trim()} <span className={styles.letterNamesAmp}>&amp;</span> {parts[1].trim()}</>
                  }
                  return <>{ld.names}</>
                })()}
              </p>
              <div className={styles.ornament}>
                <div className={styles.ornamentLine} />
                <div className={styles.ornamentDiamond} />
                <div className={styles.ornamentLine} />
              </div>
            </div>

            <button
              className={styles.submitBtn}
              onClick={handleViewInvitation}
            >
              {ld.viewInvitation}
            </button>

            <p className={styles.contact}>
              {ld.needHelp}{' '}
              <a href={`mailto:${coordinatorEmail ?? ''}`}>
                {ld.contactCoordinator}
              </a>
            </p>

          </div>
        </div>

        {/* Envelope flipper */}
        <div className={`${styles.flipper} ${isFlipped ? styles.flipped : ''} ${slideDownActive ? styles.slideDown : ''}`}>

          {/* Back face (address side, visible first) */}
          <div className={`${styles.envelope} ${styles.envBackFace}`}>
            <div className={styles.envBack} />

            <div className={`${styles.stamp} ${isFlipped ? styles.stampHidden : ''}`}>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.518 3.322 1 6.781 1 9.64 1 11.271 2.791 12 3.315 12.729 2.791 14.359 1 17.219 1 20.678 1 23 3.518 23 7.191c0 4.105-5.37 8.863-11 14.402z"
                  stroke="#6b6046"
                  strokeWidth="0.6"
                  fill="none"
                />
              </svg>
            </div>

            <div
              className={styles.addressArea}
              style={{ opacity: isAddressing ? 1 : 0, transition: 'opacity 0.4s' }}
            >
              <p className={styles.fromLine}>{dict.fromLine}</p>

              {prototype ? (
                <button className={styles.previewBtn} onClick={handlePrototypeEnter}>
                  Preview Invitation
                </button>
              ) : (
                <>
                  <label className={styles.toLabel}>
                    {mode === 'phone' ? dict.toPhone : dict.toCode}
                  </label>
                  <input
                    className={styles.toInput}
                    type={mode === 'phone' ? 'tel' : 'text'}
                    placeholder={mode === 'phone' ? dict.phonePlaceholder : dict.codePlaceholder}
                    value={input}
                    onChange={e => { setInput(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && isAddressing && handleSend()}
                    disabled={!isAddressing}
                    autoFocus
                  />
                  {error && <p className={styles.envError}>{error}</p>}
                </>
              )}
            </div>
          </div>

          {/* Front face (flap side, revealed after flip) */}
          <div className={`${styles.envelope} ${styles.envFrontFace}`}>
            <div className={styles.envBack} />
            <div className={styles.envBottom} />
            <div className={styles.envLeftFold} />
            <div className={styles.envRightFold} />

            <div className={`${styles.flapWrap} ${flapOpen ? styles.open : ''}`}>
              <div className={styles.flapFace}>
                <div className={styles.seal} style={{ opacity: flapOpen ? 0 : 1 }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#6b6046" strokeWidth="0.75" />
                    <path
                      d="M8.5 12l2.5 2.5 4.5-4.5"
                      stroke="#6b6046"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {!prototype && (
        <div className={styles.belowEnvelope}>
          {stage === 'sending' ? (
            <p className={styles.hint}>{dict.hintSending}</p>
          ) : isAddressing ? (
            <button className={styles.sendBtn} onClick={handleSend}>
              →
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
