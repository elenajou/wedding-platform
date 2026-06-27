'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Dictionary, WeddingDetailsClient } from '../dictionaries'
import type { WeddingFeatures } from '@/lib/tenant'
import SectionTheme from '@/components/SectionTheme'
import InvitationHero from '@/components/InvitationHero'
import CountdownTimer from '@/components/CountdownTimer'
import RSVPForm from '@/components/RSVPForm'
import SeatingCard from '@/components/SeatingCard'
import DaySchedule from '@/components/DaySchedule'
import VideoSection from '@/components/VideoSection'
import PhotoGallery from '@/components/PhotoGallery'
import FAQAccordion from '@/components/FAQAccordion'
import LocationSection from '@/components/LocationSection'
import DressCode from '@/components/DressCode'
import FadeIn from '@/components/FadeIn'

// Re-export WeddingFeatures so the type is available via this module
export type { WeddingFeatures }

const BYPASS_GATE = process.env.NODE_ENV === 'development'

type SectionCfg = {
  backgroundUrl: string
  backgroundColor: string
  fontColor: string
  sortOrder: number
  overlayOpacity: number
  design: string
  colorScheme: string
  visible?: boolean
}

type Props = {
  dict: Dictionary
  lang: string
  weddingDetails: WeddingDetailsClient
  features: WeddingFeatures
}

const DEFAULT_CFG: SectionCfg = {
  backgroundUrl: '',
  backgroundColor: '#faf7f2',
  fontColor: '',
  sortOrder: 99,
  overlayOpacity: 0.32,
  design: 'Classic',
  colorScheme: 'Gold',
}

export default function InvitationClient({ dict, lang, weddingDetails, features }: Props) {
  const [guest, setGuest] = useState<any>(null)
  const router = useRouter()
  const cfg = (key: string): SectionCfg =>
    (weddingDetails.sections[key] as SectionCfg | undefined) ?? DEFAULT_CFG

  useEffect(() => {
    const url = cfg('countdown').backgroundUrl
    if (url) { const img = new Image(); img.src = url }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const stored = sessionStorage.getItem('wedding_guest')
    if (stored) { setGuest(JSON.parse(stored)); return }

    if (BYPASS_GATE) {
      setGuest({
        guestName: 'Guest', groupId: 0, groupName: 'Group',
        tableName: 'Table #', allocatedSeats: 2,
        groupMembers: [{ id: 0, name: 'Guest 1' }, { id: 0, name: 'Guest 2' }],
      })
      return
    }
    router.push(`/${lang}`)
  }, [lang, router])

  const sectionMap: Record<string, ReactNode> = {
    hero: (
      <InvitationHero
        brideName={weddingDetails.brideName}
        groomName={weddingDetails.groomName}
        guestName={guest?.guestName ?? 'Guest'}
        groupName={guest?.groupName ?? 'Group'}
        backgroundUrl={cfg('hero').backgroundUrl || undefined}
        overlayOpacity={cfg('hero').overlayOpacity}
        elements={weddingDetails.heroElements}
        locale={lang}
        dict={dict.hero}
        design={cfg('hero').design}
      />
    ),
    ...(features.countdown && {
      countdown: (
        <CountdownTimer
          targetDate={weddingDetails.targetDate}
          dict={dict.countdown}
          design={cfg('countdown').design}
        />
      ),
    }),
    ...(features.seatingCard && {
      seating: (
        <SeatingCard
          guestName={guest?.guestName}
          groupName={guest?.groupName}
          tableName={guest?.tableName}
          allocatedSeats={guest?.allocatedSeats}
          groupMembers={guest?.groupMembers}
          dict={dict.seating}
          design={cfg('seating').design}
        />
      ),
    }),
    ...(features.rsvp && {
      rsvp: (
        <RSVPForm
          groupId={guest?.groupId}
          guestName={guest?.guestName}
          groupName={guest?.groupName}
          tableName={guest?.tableName}
          allocatedSeats={guest?.allocatedSeats}
          groupMembers={guest?.groupMembers}
          dict={dict.rsvp}
          design={cfg('rsvp').design}
        />
      ),
    }),
    ...(features.schedule && {
      schedule: <DaySchedule dict={dict.schedule} design={cfg('schedule').design} />,
    }),
    ...(features.videoSection && weddingDetails.videoSource && {
      video: (
        <VideoSection
          source={weddingDetails.videoSource}
          posterUrl={weddingDetails.posterUrl ?? undefined}
          dict={dict.video}
          design={cfg('video').design}
        />
      ),
    }),
    ...(features.gallery && {
      gallery: <PhotoGallery dict={dict.gallery} design={cfg('gallery').design} />,
    }),
    ...(features.faq && {
      faq: (
        <FAQAccordion
          coordinatorEmail={weddingDetails.coordinatorEmail}
          coordinatorName={weddingDetails.coordinatorName}
          lang={lang}
          dict={dict.faq}
          design={cfg('faq').design}
        />
      ),
    }),
    ...(features.maps && weddingDetails.locations.length > 0 && {
      location: (
        <LocationSection
          locations={weddingDetails.locations}
          dict={dict.location}
          design={cfg('location').design}
        />
      ),
    }),
    ...(features.dressCode && weddingDetails.dressCodeItems.length > 0 && {
      dresscode: (
        <DressCode
          items={weddingDetails.dressCodeItems}
          dict={dict.dresscode}
          locale={lang}
          design={cfg('dresscode').design}
        />
      ),
    }),
  }

  const orderedKeys = Object.keys(sectionMap)
    .filter(key => cfg(key).visible !== false)
    .sort((a, b) => cfg(a).sortOrder - cfg(b).sortOrder)

  return (
    <>
      <main>
        {orderedKeys.map((key) => (
          <SectionTheme key={key} sectionCfg={cfg(key)}>
            <FadeIn
              backgroundUrl={cfg(key).backgroundUrl}
              backgroundColor={cfg(key).backgroundColor}
              fontColor={cfg(key).fontColor}
              overlayOpacity={cfg(key).overlayOpacity}
              eagerBackground={key === 'countdown'}
              transitionDuration={key === 'countdown' ? 3 : undefined}
              backgroundDelay={key === 'countdown' ? 0.5 : undefined}
            >
              {sectionMap[key]}
            </FadeIn>
          </SectionTheme>
        ))}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '0.6rem',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        color: '#9a9080',
        fontFamily: "'EB Garamond', serif",
      }}>
        &copy; {new Date().getFullYear()} Elena Jou. All rights reserved.
      </footer>
    </>
  )
}
