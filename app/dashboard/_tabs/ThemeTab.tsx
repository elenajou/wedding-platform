'use client'

import React, { useState, useRef, useEffect } from 'react'
import { dt } from '@/lib/dashboard-i18n'
import { SECTION_DESIGNS, type SectionKey } from '@/themes/section-designs'
import { getAllColorSchemes, getColorScheme } from '@/themes/color-schemes'
import type { HeroElement, HeroElementType } from '@/lib/wedding-data'
import FontPicker from '@/app/dashboard/_FontPicker'
import ImageUploader from '@/app/dashboard/_ImageUploader'
import TemplatePreview from './_TemplatePreview'
import SectionTheme from '@/components/SectionTheme'
import InvitationHero from '@/components/InvitationHero'
import CountdownTimer from '@/components/CountdownTimer'
import SeatingCard from '@/components/SeatingCard'
import RSVPForm from '@/components/RSVPForm'
import DaySchedule from '@/components/DaySchedule'
import VideoSection from '@/components/VideoSection'
import PhotoGallery from '@/components/PhotoGallery'
import FAQAccordion from '@/components/FAQAccordion'
import EnvelopeGate from '@/components/EnvelopeGate'
import DressCode from '@/components/DressCode'

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionRow = {
  id: string | null
  section_key: string
  design: string
  color_scheme: string
  background_url: string | null
  background_color: string | null
  font_color: string | null
  overlay_opacity: number
  contrast: number
  sort_order: number
  visible: boolean
}

type ScheduleEvent = {
  id: string
  sort_order: number
  time_label: string
  iso_time: string
  event_name: string
  description: string | null
  locale_content?: Record<string, any>
}
type Props = {
  initialSections: SectionRow[]
  enabledDesigns: Record<string, string[]>
  activeSectionKeys: string[]
  initialWeddingDetails?: Record<string, unknown> | null
  locale?: string
  initialHeroElements: HeroElement[]
  locales?: string[]
  defaultLocale?: string
  initialScheduleItems?: ScheduleEvent[]
}

const LOCALE_NAMES: Record<string, string> = { en: 'English', es: 'Español', zh: '中文' }

// ── Preview dimensions (iPhone 14 Pro Max logical pixels) ────────────────────

const PHONE_W = 450
const PHONE_H = 1000
const PREVIEW_W = 200
const SCALE = PREVIEW_W / PHONE_W
const PREVIEW_H = Math.round(PHONE_H * SCALE)

// ── Preview FadeIn (no animations — shows immediately for the live panel) ────

// heroManagesOwnBg: designs that render backgroundUrl internally as a CSS background-image.
// For these, PreviewFadeIn must NOT add its own background layer (it would be hidden anyway
// since the component's section element is opaque, but skipping it avoids any contrast/overlay
// double-application on the rare case the layout changes).
// Only Fullscreen and SplitLayout render backgroundUrl as a CSS background-image on their root
// element (solid-color fallback otherwise). Classic/Minimal/Floral are transparent or use
// var(--color-background), so PreviewFadeIn's absolute <img> layer shows through them.
const HERO_MANAGES_BG = new Set(['Fullscreen', 'SplitLayout'])

function PreviewFadeIn({ section, children }: { section: SectionRow; children: React.ReactNode }) {
  // Hero templates own their background — skip the layer entirely for hero.
  const skipBgLayer = section.section_key === 'hero' && HERO_MANAGES_BG.has(section.design)
  const hasBg = !skipBgLayer && !!section.background_url
  const cssVars = section.font_color ? { '--section-color': section.font_color } as React.CSSProperties : {}
  return (
    <div style={{
      width: '100%', position: hasBg ? 'relative' : undefined,
      backgroundColor: skipBgLayer ? undefined : (section.background_color ?? 'var(--color-background)'),
      ...cssVars,
    }}>
      {hasBg && <>
        <img
          src={section.background_url!}
          aria-hidden
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', display: 'block', zIndex: 0,
            filter: `contrast(${section.contrast ?? 100}%)`,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: section.overlay_opacity >= 0
            ? `rgba(0,0,0,${section.overlay_opacity})`
            : `rgba(255,255,255,${Math.abs(section.overlay_opacity)})`,
        }} />
      </>}
      <div style={hasBg ? { position: 'relative', zIndex: 2, width: '100%' } : { width: '100%' }}>
        {children}
      </div>
    </div>
  )
}

// ── Preview dict (static English copy + sample data) ─────────────────────────

const PREVIEW_DICT = {
  envelope: {
    eyebrow: 'You are cordially invited',
    names: 'Sofia & Marco',
    dearGuest: 'Dear {name},',
    dearGuestFallback: 'Dear Guest,',
    letterBody: 'your invitation awaits inside.',
    viewInvitation: 'View your invitation',
    needHelp: 'Need help?',
    contactCoordinator: 'Contact our coordinator',
    fromLine: 'From: Sofia & Marco',
    toPhone: 'To (phone number)',
    toCode: 'To (invite code)',
    phonePlaceholder: '+1 416 555 0123',
    codePlaceholder: 'e.g. JOHN24',
    errorEmpty: 'Please enter your {mode}',
    modePhone: 'phone number',
    modeCode: 'invitation code',
    errorNotFound: 'We couldn\'t find your invitation.',
    errorGeneric: 'Something went wrong.',
    useInstead: 'Use instead:',
    inviteCode: 'invite code',
    phoneNumber: 'phone number',
    hintSending: 'Sending your details...',
    hintDefault: 'Fill in your details, then tap the seal',
    postmarkTop: 'Wedding',
    postmarkDate: '',
  },
  hero: {
    eyebrow: 'Together with their families',
    tagline: 'request the honour of your presence',
    weddingDate: 'On our special date',
    dearGreeting: 'Dear {name},<br/>we joyfully invite you to celebrate the wedding of',
    fallbackGreeting: 'We joyfully invite you to celebrate the wedding of',
  },
  countdown: {
    label: 'Counting down',
    pastMessage: 'Today we celebrate',
    days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds',
    message: '',
  },
  seating: {
    sectionLabel: 'Your seating',
    tableLabel: 'You are seated at',
    tableTBC: 'To be confirmed',
    table: 'Table',
    membersLabel: 'In your party',
    youBadge: 'You',
    seatsTextSingular: 'This invitation is for <strong>{count}</strong> guest total',
    seatsTextPlural: 'This invitation is for <strong>{count}</strong> guests total',
    seatSingular: 'seat',
    seatPlural: 'seats',
    guestSingular: 'guest',
    guestPlural: 'guests',
  },
  rsvp: {
    sectionLabel: 'Kindly reply',
    deadline: 'By the {deadline}',
    nameLabel: 'Your full name',
    namePlaceholder: 'Your name',
    attendanceLabel: 'Attendance',
    accepts: 'Accepts',
    declines: 'Declines',
    guestCountLabel: 'Number of guests attending (max {max})',
    messageLabel: 'Message to the couple',
    messagePlaceholder: 'Share your wishes...',
    errorName: 'Please enter your name.',
    errorAttendance: 'Please indicate whether you will attend.',
    errorGeneric: 'Something went wrong.',
    sending: 'Sending...',
    sendReply: 'Send reply',
    successYes: 'Thank you, {name} — we cannot wait to celebrate with you.',
    successNo: 'We will miss you, {name}.',
    successSub: 'Your RSVP has been received',
    rsvpDeadline: '',
  },
  schedule: {
    sectionLabel: 'Schedule of the day',
    happeningNow: 'Happening now',
    events: [
      { time: '4:00 PM', isoTime: '', name: 'Guests Arrive', description: 'Welcome cocktails on the terrace' },
      { time: '4:30 PM', isoTime: '', name: 'Ceremony', description: 'Exchange of vows in the garden chapel' },
      { time: '6:00 PM', isoTime: '', name: 'Cocktail Hour', description: 'Canapes and live music' },
      { time: '7:30 PM', isoTime: '', name: 'Reception Dinner', description: 'Seated dinner in the grand ballroom' },
      { time: '9:00 PM', isoTime: '', name: 'First Dance', description: 'Dancing until midnight' },
    ],
  },
  video: {
    title: 'Our story',
    playLabel: 'Play video',
    dataNotePlaying: 'Video is now playing.',
    dataNoteIdle: 'Video loads only when you tap play.',
  },
  gallery: {
    title: 'Before the big day',
    subtitle: 'A few moments from our journey together',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    countOf: '{current} of {total}',
    photos: [
      { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70', alt: 'Couple', caption: 'Our story begins' },
      { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=70', alt: 'Celebration', caption: 'Together' },
      { src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=70', alt: 'Flowers', caption: 'In bloom' },
      { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=70', alt: 'Rings', caption: 'For ever' },
      { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c0?w=600&q=70', alt: 'Venue', caption: 'Our venue' },
      { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=70', alt: 'Ceremony', caption: 'The ceremony' },
    ],
  },
  faq: {
    sectionLabel: 'Frequently asked',
    contactLabel: 'Still have questions?',
    contactText: 'Please reach out to our coordinator rather than contacting the couple directly.',
    items: [
      { question: 'What is the dress code?', answer: 'Formal attire — black tie optional. We love to see you dressed up for the occasion.' },
      { question: 'Are children welcome?', answer: 'The ceremony and reception are adults-only. We hope you can still join us for the celebration.' },
      { question: 'Is there parking at the venue?', answer: 'Complimentary valet parking is available for all guests.' },
      { question: 'Will there be dietary options?', answer: 'Yes — please indicate any dietary requirements when you RSVP.' },
    ],
    close: 'Close invitation',
  },
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const th: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#7a6e5f', fontWeight: 400, fontFamily: "'EB Garamond', serif",
}
const fieldStyle: React.CSSProperties = {
  padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf',
  fontFamily: "'EB Garamond', serif", fontSize: 14, color: '#201d19',
  outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box',
}

const SECTION_LABELS: Record<string, string> = {
  envelope: 'Envelope Gate', hero: 'Hero', countdown: 'Countdown', seating: 'Seating Card',
  rsvp: 'RSVP Form', schedule: 'Day Schedule', video: 'Video', gallery: 'Gallery', faq: 'FAQ',
  location: 'Location', dresscode: 'Dress Code',
}

const colorSchemes = getAllColorSchemes()

// ── Live preview renderer ─────────────────────────────────────────────────────

function renderPreviewSection(key: string, section: SectionRow, wd: Record<string, unknown> | null | undefined, heroElements?: HeroElement[], scheduleItems?: ScheduleEvent[]) {
  const design = section.design
  const brideName = (wd?.bride_name as string) || 'Sofia'
  const groomName = (wd?.groom_name as string) || 'Marco'

  switch (key) {
    case 'envelope':
      return (
        <EnvelopeGate
          dict={PREVIEW_DICT.envelope}
          lang="en"
          design={design}
          namesFontUrl={(wd?.names_font_url as string) || null}
          coordinatorEmail={(wd?.coordinator_email as string) || null}
          letterEyebrow={(wd?.letter_eyebrow as string) || null}
          letterGreeting={(wd?.letter_greeting as string) || null}
          letterBodyText={(wd?.letter_body_text as string) || null}
          prototype={true}
        />
      )
    case 'hero':
      return (
        <InvitationHero
          brideName={brideName}
          groomName={groomName}
          guestName="Elena"
          groupName="Preview Guest"
          backgroundUrl={section.background_url || undefined}
          overlayOpacity={section.overlay_opacity}
          elements={heroElements ?? []}
          dict={PREVIEW_DICT.hero}
          design={design}
        />
      )
    case 'countdown': {
      const date = (wd?.wedding_date as string) || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
      return <CountdownTimer targetDate={date} dict={PREVIEW_DICT.countdown} design={design} />
    }
    case 'seating':
      return (
        <SeatingCard
          guestName="Elena Jou"
          groupName="Jou Family"
          tableName="Table 3"
          allocatedSeats={3}
          groupMembers={[
            { id: 1, name: 'Elena Jou' },
            { id: 2, name: 'Marco Jou' },
            { id: 3, name: 'Sofia Jou' },
          ]}
          dict={PREVIEW_DICT.seating}
          design={design}
        />
      )
    case 'rsvp':
      return (
        <RSVPForm
          groupId={0}
          guestName="Elena Jou"
          groupName="Jou Family"
          tableName="Table 3"
          allocatedSeats={2}
          groupMembers={[
            { id: 1, name: 'Elena Jou' },
            { id: 2, name: 'Marco Jou' },
          ]}
          dict={PREVIEW_DICT.rsvp}
          design={design}
        />
      )
    case 'schedule': {
      const previewEvents = scheduleItems && scheduleItems.length > 0
        ? scheduleItems.map(e => ({ time: e.time_label, isoTime: e.iso_time, name: e.event_name, description: e.description ?? '' }))
        : PREVIEW_DICT.schedule.events
      return <DaySchedule dict={{ ...PREVIEW_DICT.schedule, events: previewEvents }} design={design} />
    }
    case 'video': {
      const vType = (wd?.video_source_type as string) || 'youtube'
      const vId = (wd?.video_source_id as string) || 'dQw4w9WgXcQ'
      const source =
        vType === 'youtube' ? { type: 'youtube' as const, videoId: vId } :
        vType === 'vimeo'   ? { type: 'vimeo'   as const, videoId: vId } :
                              { type: 'self'    as const, src: vId }
      return (
        <VideoSection
          source={source}
          posterUrl={(wd?.video_poster_url as string) || undefined}
          dict={PREVIEW_DICT.video}
          design={design}
        />
      )
    }
    case 'gallery':
      return <PhotoGallery dict={PREVIEW_DICT.gallery} design={design} />
    case 'faq':
      return (
        <FAQAccordion
          coordinatorEmail={(wd?.coordinator_email as string) || undefined}
          coordinatorName={(wd?.coordinator_name as string) || undefined}
          lang="en"
          dict={PREVIEW_DICT.faq}
          design={design}
        />
      )
    case 'dresscode':
      return (
        <DressCode
          items={[
            { id: '1', sort_order: 1, title: 'Black Tie', description: 'Formal evening attire for all guests.', image_urls: [], locale_content: {} },
            { id: '2', sort_order: 2, title: 'Cocktail', description: 'Semi-formal. Suits or cocktail dresses.', image_urls: [], locale_content: {} },
          ]}
          dict={{ sectionLabel: 'Dress Code' }}
          design={design}
        />
      )
    default:
      return null
  }
}

// ── Main component ────────────────────────────────────────────────────────────

// ── AgendaPanel ───────────────────────────────────────────────────────────────

function AgendaPanel({ items, onItemsChange, locales, defaultLocale, locale }: {
  items: ScheduleEvent[]
  onItemsChange: (items: ScheduleEvent[]) => void
  locales?: string[]
  defaultLocale?: string
  locale?: string
}) {
  const dl = defaultLocale ?? 'es'
  const allLocales = locales && locales.length > 0 ? locales : [dl]
  const [activeLang, setActiveLang] = useState(dl)
  const [addTime, setAddTime] = useState('')
  const [addIso, setAddIso] = useState('')
  const [addContent, setAddContent] = useState<Record<string, { event_name: string; description: string }>>({})
  const [adding, setAdding] = useState(false)
  const [agError, setAgError] = useState('')

  const T = (k: string) => dt(k, locale)
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)

  function getItemField(item: ScheduleEvent, field: 'event_name' | 'description'): string {
    if (activeLang === dl) return (item[field] as string) ?? ''
    return item.locale_content?.[activeLang]?.[field] ?? ''
  }

  function setItemField(id: string, field: 'event_name' | 'description', val: string) {
    if (activeLang === dl) {
      onItemsChange(items.map(i => i.id === id ? { ...i, [field]: val } : i))
    } else {
      onItemsChange(items.map(i => i.id === id ? {
        ...i,
        locale_content: { ...(i.locale_content ?? {}), [activeLang]: { ...(i.locale_content?.[activeLang] ?? {}), [field]: val } },
      } : i))
    }
  }

  function getAdd(field: 'event_name' | 'description'): string {
    return addContent[activeLang]?.[field] ?? ''
  }

  function setAdd(field: 'event_name' | 'description', val: string) {
    setAddContent(prev => ({ ...prev, [activeLang]: { ...(prev[activeLang] ?? {}), [field]: val } }))
  }

  function moveItem(id: string, dir: -1 | 1) {
    const idx = sorted.findIndex(i => i.id === id)
    const next = idx + dir
    if (next < 0 || next >= sorted.length) return
    const arr = [...sorted]
    const aOrder = arr[idx].sort_order; const bOrder = arr[next].sort_order
    arr[idx] = { ...arr[idx], sort_order: bOrder }
    arr[next] = { ...arr[next], sort_order: aOrder }
    onItemsChange(arr)
  }

  async function handleAdd() {
    const eventName = addContent[dl]?.event_name ?? ''
    if (!addTime || !eventName) { setAgError('Time and event name required'); return }
    setAdding(true)
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) : 0
    const localeContent: Record<string, any> = {}
    for (const lc of allLocales.filter(l => l !== dl)) {
      localeContent[lc] = { event_name: addContent[lc]?.event_name ?? '', description: addContent[lc]?.description ?? '' }
    }
    const body = { sort_order: maxOrder + 10, time_label: addTime, iso_time: addIso, event_name: eventName, description: addContent[dl]?.description || null, locale_content: localeContent }
    const res = await fetch('/api/dashboard/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      const d = await res.json()
      onItemsChange([...items, d].sort((a, b) => a.sort_order - b.sort_order))
      setAddTime(''); setAddIso(''); setAddContent({})
    } else { const d = await res.json(); setAgError(d.error ?? 'Failed') }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm(T('scheduleDeleteConfirm'))) return
    const res = await fetch(`/api/dashboard/schedule/${id}`, { method: 'DELETE' })
    if (res.ok) onItemsChange(items.filter(i => i.id !== id))
    else setAgError('Failed')
  }

  const ci: React.CSSProperties = {
    padding: '4px 6px', background: '#fff', border: '0.5px solid #d4cbbf',
    fontFamily: "'EB Garamond', serif", fontSize: 13, color: '#201d19',
    outline: 'none', borderRadius: 1, boxSizing: 'border-box', height: 26,
  }
  const moveBtn = (disabled: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
    color: '#9a9080', opacity: disabled ? 0.25 : 1, padding: '0 1px', fontSize: 10, lineHeight: 1,
  })
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '3px 10px', border: 'none', background: active ? '#fff' : 'transparent',
    borderBottom: active ? '1.5px solid #b08d57' : '1.5px solid transparent',
    fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
    color: active ? '#b08d57' : '#9a9080', cursor: 'pointer', fontFamily: "'EB Garamond', serif",
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <style>{`.agenda-row::-webkit-scrollbar{height:3px}.agenda-row::-webkit-scrollbar-track{background:transparent}.agenda-row::-webkit-scrollbar-thumb{background:#d4cbbf;border-radius:2px}.agenda-row{scrollbar-width:thin;scrollbar-color:#d4cbbf transparent}`}</style>

      {allLocales.length > 1 && (
        <div style={{ display: 'flex', borderBottom: '0.5px solid #e0d8c8', marginBottom: 2 }}>
          {allLocales.map(lc => <button key={lc} onClick={() => setActiveLang(lc)} style={tabBtn(activeLang === lc)}>{lc}</button>)}
        </div>
      )}

      {sorted.map((item, idx) => (
        <div key={item.id} className="agenda-row" style={{ overflowX: 'auto', background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px', minWidth: 'max-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <button onClick={() => moveItem(item.id, -1)} disabled={idx === 0} style={moveBtn(idx === 0)}>▲</button>
              <button onClick={() => moveItem(item.id, 1)} disabled={idx === sorted.length - 1} style={moveBtn(idx === sorted.length - 1)}>▼</button>
            </div>
            <input style={{ ...ci, width: 80 }} value={item.time_label} onChange={e => onItemsChange(items.map(i => i.id === item.id ? { ...i, time_label: e.target.value } : i))} placeholder="4:00 PM" />
            <input style={{ ...ci, width: 110 }} value={item.iso_time} onChange={e => onItemsChange(items.map(i => i.id === item.id ? { ...i, iso_time: e.target.value } : i))} placeholder="ISO time" />
            <input style={{ ...ci, width: 140 }} value={getItemField(item, 'event_name')} onChange={e => setItemField(item.id, 'event_name', e.target.value)} placeholder="Event" />
            <input style={{ ...ci, width: 160 }} value={getItemField(item, 'description')} onChange={e => setItemField(item.id, 'description', e.target.value)} placeholder="Description" />
            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4614a', fontSize: 12, padding: '0 2px', lineHeight: 1 }} title={T('delete')}>✕</button>
          </div>
        </div>
      ))}

      {items.length === 0 && <p style={{ fontSize: 12, color: '#9a9080', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", margin: '4px 0' }}>{T('scheduleEmpty')}</p>}

      <div className="agenda-row" style={{ overflowX: 'auto', border: '0.5px dashed #d4cbbf', borderRadius: 2, background: '#fdf9f3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px', minWidth: 'max-content' }}>
          <div style={{ width: 16 }} />
          <input style={{ ...ci, width: 80, background: '#fdf9f3' }} value={addTime} onChange={e => setAddTime(e.target.value)} placeholder="4:00 PM" />
          <input style={{ ...ci, width: 110, background: '#fdf9f3' }} value={addIso} onChange={e => setAddIso(e.target.value)} placeholder="ISO time" />
          <input style={{ ...ci, width: 140, background: '#fdf9f3' }} value={getAdd('event_name')} onChange={e => setAdd('event_name', e.target.value)} placeholder="Event" />
          <input style={{ ...ci, width: 160, background: '#fdf9f3' }} value={getAdd('description')} onChange={e => setAdd('description', e.target.value)} placeholder="Description" />
          <button onClick={handleAdd} disabled={adding} style={{ padding: '4px 12px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: adding ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            + {T('add')}
          </button>
          {agError && <span style={{ color: '#c4614a', fontSize: 11, fontStyle: 'italic' }}>{agError}</span>}
        </div>
      </div>
    </div>
  )
}

// ── HeroElementsPanel ─────────────────────────────────────────────────────────

const ELEMENT_TYPE_LABELS: Record<HeroElementType, string> = {
  eyebrow: 'Eyebrow',
  names: 'Names',
  greeting: 'Greeting',
  body: 'Body',
  tagline: 'Tagline',
  date: 'Date',
  spacer: 'Spacer',
}

const HERO_ELEMENT_TYPES: HeroElementType[] = ['eyebrow', 'names', 'greeting', 'body', 'tagline', 'date', 'spacer']

function HeroElementsPanel({
  elements,
  onChange,
  locales,
  defaultLocale,
}: {
  elements: HeroElement[]
  onChange: (updated: HeroElement[]) => void
  locales?: string[]
  defaultLocale?: string
}) {
  const [newType, setNewType] = useState<HeroElementType>('eyebrow')
  const [adding, setAdding] = useState(false)
  const dl = defaultLocale ?? 'es'
  const allLocales = locales && locales.length > 0 ? locales : [dl]
  const [activeLang, setActiveLang] = useState(dl)

  function updateEl(id: string, patch: Partial<HeroElement>) {
    onChange(elements.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  function updateLocaleContent(id: string, locale: string, val: string) {
    onChange(elements.map(e => e.id === id ? {
      ...e,
      locale_content: { ...(e.locale_content ?? {}), [locale]: val },
    } : e))
  }

  async function addElement() {
    setAdding(true)
    try {
      const maxOrder = elements.length > 0 ? Math.max(...elements.map(e => e.sort_order)) : 0
      const res = await fetch('/api/dashboard/hero-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sort_order: maxOrder + 10,
          element_type: newType,
          content: '',
          locale_content: {},
          font_family: '',
          font_style: 'normal',
          font_weight: '400',
          visible: true,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        onChange([...elements, created])
      }
    } finally { setAdding(false) }
  }

  async function deleteElement(id: string) {
    await fetch(`/api/dashboard/hero-elements/${id}`, { method: 'DELETE' })
    onChange(elements.filter(e => e.id !== id))
  }

  function moveElement(id: string, dir: -1 | 1) {
    const idx = elements.findIndex(e => e.id === id)
    const next = idx + dir
    if (next < 0 || next >= elements.length) return
    const arr = [...elements]
    const aOrder = arr[idx].sort_order
    const bOrder = arr[next].sort_order
    arr[idx] = { ...arr[idx], sort_order: bOrder }
    arr[next] = { ...arr[next], sort_order: aOrder }
    onChange([...arr].sort((a, b) => a.sort_order - b.sort_order))
  }

  const sorted = [...elements].sort((a, b) => a.sort_order - b.sort_order)

  const compactInput: React.CSSProperties = {
    padding: '4px 6px', background: '#fff', border: '0.5px solid #d4cbbf',
    fontFamily: "'EB Garamond', serif", fontSize: 13, color: '#201d19',
    outline: 'none', borderRadius: 1, boxSizing: 'border-box', height: 26,
  }
  const compactSelect: React.CSSProperties = { ...compactInput, cursor: 'pointer' }
  const moveBtn = (disabled: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
    color: '#9a9080', opacity: disabled ? 0.25 : 1, padding: '0 1px', fontSize: 10, lineHeight: 1,
  })
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '3px 10px', border: 'none', background: active ? '#fff' : 'transparent',
    borderBottom: active ? '1.5px solid #b08d57' : '1.5px solid transparent',
    fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
    color: active ? '#b08d57' : '#9a9080', cursor: 'pointer',
    fontFamily: "'EB Garamond', serif",
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {allLocales.length > 1 && (
        <div style={{ display: 'flex', borderBottom: '0.5px solid #e0d8c8', marginBottom: 2 }}>
          {allLocales.map(lc => (
            <button key={lc} onClick={() => setActiveLang(lc)} style={tabBtn(activeLang === lc)}>{lc}</button>
          ))}
        </div>
      )}

      {sorted.map((el, idx) => (
        <div key={el.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: 2, padding: '5px 8px' }}>
          {/* Move */}
          <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <button onClick={() => moveElement(el.id, -1)} disabled={idx === 0} style={moveBtn(idx === 0)}>▲</button>
            <button onClick={() => moveElement(el.id, 1)} disabled={idx === sorted.length - 1} style={moveBtn(idx === sorted.length - 1)}>▼</button>
          </div>
          {/* Type */}
          <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b08d57', fontFamily: "'EB Garamond', serif", whiteSpace: 'nowrap', width: 48, flexShrink: 0 }}>
            {ELEMENT_TYPE_LABELS[el.element_type as HeroElementType] ?? el.element_type}
          </span>
          {/* Content / spacer controls */}
          {el.element_type === 'spacer' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
              <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>Height</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid #d4cbbf', borderRadius: 1, overflow: 'hidden', height: 24 }}>
                <button type="button" onClick={() => updateEl(el.id, { content: String(Math.max(0, (parseInt(el.content) || 40) - 8)) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', fontSize: 9, padding: '0 5px', height: 24, lineHeight: 1 }}>−</button>
                <input
                  style={{ width: 36, padding: '0 2px', background: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, color: '#201d19', outline: 'none', textAlign: 'center', height: 24, boxSizing: 'border-box' }}
                  value={el.content || '40'}
                  onChange={e => updateEl(el.id, { content: e.target.value.replace(/\D/g, '') })}
                />
                <button type="button" onClick={() => updateEl(el.id, { content: String((parseInt(el.content) || 40) + 8) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', fontSize: 9, padding: '0 5px', height: 24, lineHeight: 1 }}>+</button>
              </div>
              <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>px</span>
            </div>
          ) : (
            <>
              {activeLang === dl ? (
                <input style={{ ...compactInput, flex: 1, minWidth: 60 }} value={el.content} onChange={e => updateEl(el.id, { content: e.target.value })} placeholder={el.element_type === 'names' ? 'e.g. Elena & Marco' : 'content'} />
              ) : (
                <input style={{ ...compactInput, flex: 1, minWidth: 60 }} value={el.locale_content?.[activeLang] ?? ''} onChange={e => updateLocaleContent(el.id, activeLang, e.target.value)} placeholder={`${activeLang} content`} />
              )}
              {/* FontPicker — 300px fixed, shrinks last */}
              <div style={{ width: 300, flexShrink: 0 }}>
                <FontPicker
                  value={el.font_family}
                  onChange={v => updateEl(el.id, { font_family: v })}
                  color={el.font_color || '#ffffff'}
                  onColorChange={v => updateEl(el.id, { font_color: v })}
                  size={el.font_size ?? ''}
                  onSizeChange={v => updateEl(el.id, { font_size: v })}
                  letterSpacing={el.letter_spacing ?? ''}
                  onLetterSpacingChange={v => updateEl(el.id, { letter_spacing: v })}
                  italic={el.font_style === 'italic'}
                  onItalicChange={v => updateEl(el.id, { font_style: v ? 'italic' : 'normal' })}
                  bold={el.font_weight === '700'}
                  onBoldChange={v => updateEl(el.id, { font_weight: v ? '700' : '400' })}
                />
              </div>
            </>
          )}
          {/* Visible */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <input type="checkbox" checked={el.visible !== false} onChange={e => updateEl(el.id, { visible: e.target.checked })} style={{ accentColor: '#b08d57', width: 11, height: 11 }} />
            <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a6e5f' }}>Vis</span>
          </label>
          {/* Delete */}
          <button onClick={() => deleteElement(el.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4614a', fontSize: 12, padding: '0 2px', lineHeight: 1, flexShrink: 0 }} title="Delete">✕</button>
        </div>
      ))}

      {/* Add new element */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
        <select
          style={{ ...compactSelect, flex: 1 }}
          value={newType}
          onChange={e => setNewType(e.target.value as HeroElementType)}
        >
          {HERO_ELEMENT_TYPES.map(t => (
            <option key={t} value={t}>{ELEMENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <button
          onClick={addElement}
          disabled={adding}
          style={{
            padding: '6px 14px', background: '#b08d57', color: '#fff', border: 'none',
            fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em',
            textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer',
            borderRadius: 1, opacity: adding ? 0.6 : 1, whiteSpace: 'nowrap',
          }}
        >
          + Add
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ThemeTab({ initialSections, enabledDesigns, activeSectionKeys, initialWeddingDetails, locale, initialHeroElements, locales, defaultLocale, initialScheduleItems }: Props) {
  const T = (k: string) => dt(k, locale)
  const dl = defaultLocale ?? 'es'
  const extraLocales = (locales ?? []).filter(l => l !== dl)

  const [heroElements, setHeroElements] = useState<HeroElement[]>(initialHeroElements)
  const [wd, setWd] = useState<Record<string, any>>(initialWeddingDetails ?? {})
  const [scheduleItems, setScheduleItems] = useState<ScheduleEvent[]>(initialScheduleItems ?? [])

  const wdVal = (key: string): string => (wd[key] ?? '') as string
  const setWdKey = (key: string, val: string) => { setWd(prev => ({ ...prev, [key]: val })) }
  const setWdLocale = (loc: string, key: string, val: string) => {
    setWd(prev => ({
      ...prev,
      locale_content: {
        ...((prev.locale_content as Record<string, any>) ?? {}),
        [loc]: { ...(((prev.locale_content as Record<string, any>) ?? {})[loc] ?? {}), [key]: val },
      },
    }))
  }
  const wdLc = (loc: string, key: string): string => ((wd.locale_content as any)?.[loc]?.[key]) ?? ''

  const [sections, setSections] = useState<SectionRow[]>(() => {
    const existing = Object.fromEntries(initialSections.map(s => [s.section_key, s]))
    return activeSectionKeys
      .map(key => existing[key] ?? {
        id: null, section_key: key, design: 'Classic', color_scheme: 'Gold',
        background_url: null, background_color: null, font_color: null,
        overlay_opacity: 0.32, contrast: 100, sort_order: 99, visible: true,
      })
      .sort((a, b) => {
        if (a.section_key === 'envelope') return -1
        if (b.section_key === 'envelope') return 1
        return a.sort_order - b.sort_order
      })
  })
  const [sectionSaving, setSectionSaving] = useState<Record<string, boolean>>({})
  const [sectionSaved, setSectionSaved] = useState<Record<string, boolean>>({})
  const [sectionError, setSectionError] = useState<Record<string, string>>({})
  const [wdSaving, setWdSaving] = useState(false)
  const [wdSaved, setWdSaved] = useState(false)
  const [wdError, setWdError] = useState('')
  const [openSection, setOpenSection] = useState<string | null>(activeSectionKeys[0] ?? null)

  useEffect(() => {
    const stored = localStorage.getItem('theme-open-section')
    if (stored && (stored === 'wedding-info' || activeSectionKeys.includes(stored))) setOpenSection(stored)
  }, [])

  const previewContainerRef = useRef<HTMLDivElement>(null)
  const sectionElRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartScrollTop = useRef(0)
  const [grabbing, setGrabbing] = useState(false)

  useEffect(() => {
    if (!openSection || !previewContainerRef.current) return
    const el = sectionElRefs.current[openSection]
    if (!el) return
    const container = previewContainerRef.current
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    container.scrollTo({ top: elRect.top - containerRect.top + container.scrollTop, behavior: 'smooth' })
  }, [openSection])

  useEffect(() => {
    function onMouseUp() { isDragging.current = false; setGrabbing(false) }
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [])

  function onPreviewMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    dragStartY.current = e.clientY
    dragStartScrollTop.current = previewContainerRef.current?.scrollTop ?? 0
    setGrabbing(true)
    e.preventDefault()
  }

  function onPreviewMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !previewContainerRef.current) return
    previewContainerRef.current.scrollTop = dragStartScrollTop.current - (e.clientY - dragStartY.current)
  }

  function openAccordion(key: string | null) {
    setOpenSection(key)
    if (key) localStorage.setItem('theme-open-section', key)
    else localStorage.removeItem('theme-open-section')
  }

  function update(key: string, patch: Partial<SectionRow>) {
    setSections(prev => prev.map(s => s.section_key === key ? { ...s, ...patch } : s))
  }

  function moveSection(key: string, dir: -1 | 1) {
    if (key === 'envelope') return
    setSections(prev => {
      const idx = prev.findIndex(s => s.section_key === key)
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      if (prev[next].section_key === 'envelope') return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr.map((s, i) => ({ ...s, sort_order: i * 10 }))
    })
  }

  function toggleVisible(key: string) {
    setSections(prev => prev.map(s => s.section_key === key ? { ...s, visible: !s.visible } : s))
  }

  async function saveSection(key: string) {
    const section = sections.find(s => s.section_key === key)
    if (!section) return
    setSectionSaving(p => ({ ...p, [key]: true }))
    setSectionError(p => ({ ...p, [key]: '' }))
    try {
      const promises: Promise<Response>[] = [
        fetch('/api/dashboard/sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{
            id: section.id, section_key: section.section_key,
            design: section.design, color_scheme: section.color_scheme,
            background_url: section.background_url || null,
            background_color: section.background_color || null,
            font_color: section.font_color || null,
            overlay_opacity: section.overlay_opacity,
            contrast: section.contrast ?? 100,
            sort_order: section.sort_order, visible: section.visible !== false,
          }]),
        }),
        ...(key === 'hero' ? heroElements.map(el =>
          fetch(`/api/dashboard/hero-elements/${el.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(el) })
        ) : []),
        ...(key === 'schedule' ? scheduleItems.map(item =>
          fetch(`/api/dashboard/schedule/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: item.sort_order, time_label: item.time_label, iso_time: item.iso_time, event_name: item.event_name, description: item.description, locale_content: item.locale_content ?? {} }) })
        ) : []),
      ]
      const [sectRes] = await Promise.all(promises)
      if (!sectRes.ok) { const d = await sectRes.json(); throw new Error(d.error ?? 'Error') }
      const updated: SectionRow[] = await sectRes.json()
      setSections(prev => prev.map(s => updated.find(u => u.section_key === s.section_key) ?? s))
      setSectionSaved(p => ({ ...p, [key]: true }))
      setTimeout(() => setSectionSaved(p => ({ ...p, [key]: false })), 2500)
    } catch (e) {
      setSectionError(p => ({ ...p, [key]: e instanceof Error ? e.message : 'Error' }))
    } finally {
      setSectionSaving(p => ({ ...p, [key]: false }))
    }
  }

  async function saveWeddingInfo() {
    setWdSaving(true); setWdError('')
    try {
      const res = await fetch('/api/dashboard/wedding-details', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(wd) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Error') }
      setWdSaved(true)
      setTimeout(() => setWdSaved(false), 2500)
    } catch (e) {
      setWdError(e instanceof Error ? e.message : 'Error')
    } finally { setWdSaving(false) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19' }}>
          {T('themeTitle')}
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left: controls ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, color: '#7a6e5f', fontStyle: 'italic', marginBottom: '1.5rem' }}>
            {T('themeDescription')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── Wedding Info accordion ─────────────────────────────────── */}
            <div style={{ border: '0.5px solid #e0d8c8', borderBottom: 'none', background: '#fff' }}>
              <button
                onClick={() => openAccordion(openSection === 'wedding-info' ? null : 'wedding-info')}
                style={{ width: '100%', background: openSection === 'wedding-info' ? '#faf7f2' : 'transparent', border: 'none', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ ...th, fontSize: 11 }}>Wedding Info</span>
                <span style={{ fontSize: 13, color: '#7a6e5f', transform: openSection === 'wedding-info' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
              </button>

              {openSection === 'wedding-info' && (
                <div style={{ padding: '0 14px 22px', background: '#faf7f2', borderTop: '0.5px solid #e0d8c8' }}>
                  {/* Couple */}
                  <div style={{ marginTop: 16, marginBottom: 14 }}>
                    <p style={{ ...th, marginBottom: 8 }}>Couple</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingBrideName')}</label><input style={fieldStyle} value={wdVal('bride_name')} onChange={e => setWdKey('bride_name', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingGroomName')}</label><input style={fieldStyle} value={wdVal('groom_name')} onChange={e => setWdKey('groom_name', e.target.value)} /></div>
                    </div>
                  </div>

                  {/* Event */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ ...th, marginBottom: 8 }}>Event</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingDate')}</label><input style={fieldStyle} type="date" value={wdVal('wedding_date')} onChange={e => setWdKey('wedding_date', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingRsvpDeadline')}</label><input style={fieldStyle} value={wdVal('rsvp_deadline')} onChange={e => setWdKey('rsvp_deadline', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingCeremonyTime')}</label><input style={fieldStyle} value={wdVal('ceremony_time')} onChange={e => setWdKey('ceremony_time', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingCeremonyLocation')}</label><input style={fieldStyle} value={wdVal('ceremony_location')} onChange={e => setWdKey('ceremony_location', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingReceptionTime')}</label><input style={fieldStyle} value={wdVal('reception_time')} onChange={e => setWdKey('reception_time', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingReceptionLocation')}</label><input style={fieldStyle} value={wdVal('reception_location')} onChange={e => setWdKey('reception_location', e.target.value)} /></div>
                    </div>
                  </div>

                  {/* Coordinator */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ ...th, marginBottom: 8 }}>Coordinator</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingCoordName')}</label><input style={fieldStyle} value={wdVal('coordinator_name')} onChange={e => setWdKey('coordinator_name', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingCoordEmail')}</label><input style={fieldStyle} type="email" value={wdVal('coordinator_email')} onChange={e => setWdKey('coordinator_email', e.target.value)} /></div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingNamesFontUrl')}</label>
                      <input style={fieldStyle} value={wdVal('names_font_url')} onChange={e => setWdKey('names_font_url', e.target.value)} placeholder={T('weddingNamesFontUrlPh')} />
                    </div>
                  </div>

                  {/* Letter (envelope gate) */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ ...th, marginBottom: 8 }}>Letter</p>
                    <div style={{ marginBottom: 8, padding: '10px 12px', background: '#fff', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
                      {extraLocales.length > 0 && <span style={{ display: 'inline-block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', background: '#b08d57', padding: '2px 6px', borderRadius: 2, marginBottom: 8 }}>{LOCALE_NAMES[dl] ?? dl} ({dl})</span>}
                      <div style={{ marginBottom: 8 }}><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingLetterEyebrow')}</label><input style={fieldStyle} value={wdVal('letter_eyebrow')} onChange={e => setWdKey('letter_eyebrow', e.target.value)} /></div>
                      <div style={{ marginBottom: 8 }}><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingLetterGreeting')}</label><input style={fieldStyle} value={wdVal('letter_greeting')} onChange={e => setWdKey('letter_greeting', e.target.value)} /></div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingLetterBody')}</label><textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }} value={wdVal('letter_body_text')} onChange={e => setWdKey('letter_body_text', e.target.value)} /></div>
                    </div>
                    {extraLocales.map(xl => (
                      <div key={xl} style={{ marginBottom: 8, padding: '10px 12px', background: '#fff', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
                        <span style={{ display: 'inline-block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', background: '#b08d57', padding: '2px 6px', borderRadius: 2, marginBottom: 8 }}>{LOCALE_NAMES[xl] ?? xl} ({xl})</span>
                        <div style={{ marginBottom: 8 }}><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingLetterEyebrow')}</label><input style={fieldStyle} value={wdLc(xl, 'letter_eyebrow')} onChange={e => setWdLocale(xl, 'letter_eyebrow', e.target.value)} /></div>
                        <div style={{ marginBottom: 8 }}><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingLetterGreeting')}</label><input style={fieldStyle} value={wdLc(xl, 'letter_greeting')} onChange={e => setWdLocale(xl, 'letter_greeting', e.target.value)} /></div>
                        <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingLetterBody')}</label><textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }} value={wdLc(xl, 'letter_body_text')} onChange={e => setWdLocale(xl, 'letter_body_text', e.target.value)} /></div>
                      </div>
                    ))}
                  </div>

                  {/* Video */}
                  <div>
                    <p style={{ ...th, marginBottom: 8 }}>Video</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                      <div>
                        <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingVideoType')}</label>
                        <select style={{ ...fieldStyle, cursor: 'pointer' }} value={wdVal('video_source_type')} onChange={e => setWdKey('video_source_type', e.target.value)}>
                          <option value="">{T('weddingVideoNone')}</option>
                          <option value="youtube">YouTube</option>
                          <option value="vimeo">Vimeo</option>
                          <option value="self">{T('weddingVideoSelf')}</option>
                        </select>
                      </div>
                      <div><label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 3 }}>{T('weddingVideoId')}</label><input style={fieldStyle} value={wdVal('video_source_id')} onChange={e => setWdKey('video_source_id', e.target.value)} /></div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <ImageUploader
                          value={wdVal('video_poster_url')}
                          onChange={v => {
                            setWdKey('video_poster_url', v)
                            fetch('/api/dashboard/wedding-details', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...wd, video_poster_url: v }),
                            })
                          }}
                          fieldKey="video-poster"
                          label={T('weddingVideoPoster')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '0.5px solid #e0d8c8' }}>
                    {wdSaved && <span style={{ fontSize: 12, color: '#2d6a40', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>{T('savedShort')}</span>}
                    {wdError && <span style={{ fontSize: 12, color: '#c4614a', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>{wdError}</span>}
                    <button onClick={saveWeddingInfo} disabled={wdSaving} style={{ padding: '7px 18px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: wdSaving ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: wdSaving ? 0.6 : 1 }}>{wdSaving ? T('saving') : T('save')}</button>
                  </div>
                </div>
              )}
            </div>

            {sections.map((section, idx) => {
              const key = section.section_key
              const allDesigns = SECTION_DESIGNS[key as SectionKey] ?? []
              const allowed = enabledDesigns[key]
              const designs = allowed && allowed.length > 0 ? allDesigns.filter(d => allowed.includes(d.key)) : allDesigns
              const currentDesign = designs.find(d => d.key === section.design) ?? designs[0]
              const isOpen = openSection === key
              const scheme = getColorScheme(section.color_scheme)
              const hasCustomBg = !!(section.background_url || section.background_color)
              const isVisible = section.visible !== false

              const rowBtnStyle: React.CSSProperties = {
                background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px',
                color: '#9a9080', fontSize: 9, lineHeight: 1, display: 'flex', alignItems: 'center',
              }

              return (
                <div key={key} style={{ border: '0.5px solid #e0d8c8', borderBottom: 'none', background: '#fff' }}>
                  {/* Section header row */}
                  <div style={{ display: 'flex', alignItems: 'stretch', background: isOpen ? '#faf7f2' : '#fff' }}>

                    {/* Reorder buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', borderRight: '0.5px solid #ede8df', flexShrink: 0 }}>
                      {key === 'envelope' ? (
                        <div style={{ ...rowBtnStyle, flex: 1, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.35, justifyContent: 'center', pointerEvents: 'none' }} title={T('themeLocked')}>⊥</div>
                      ) : (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); moveSection(key, -1) }}
                            disabled={idx <= 1}
                            style={{ ...rowBtnStyle, flex: 1, opacity: idx <= 1 ? 0.25 : 1 }}
                            title={T('themeMoveUp')}
                          >▲</button>
                          <button
                            onClick={e => { e.stopPropagation(); moveSection(key, 1) }}
                            disabled={idx === sections.length - 1}
                            style={{ ...rowBtnStyle, flex: 1, opacity: idx === sections.length - 1 ? 0.25 : 1 }}
                            title={T('themeMoveDown')}
                          >▼</button>
                        </>
                      )}
                    </div>

                    {/* Accordion toggle */}
                    <button
                      onClick={() => openAccordion(isOpen ? null : key)}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', padding: '11px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', textAlign: 'left', minWidth: 0,
                        opacity: isVisible ? 1 : 0.45,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <span style={{ ...th, fontSize: 11 }}>{SECTION_LABELS[key] ?? key}</span>
                        <span style={{ fontSize: 11, color: '#b08d57', fontFamily: "'EB Garamond', serif", fontStyle: 'italic' }}>
                          {currentDesign?.label}
                        </span>
                        <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: scheme.colorPrimary, display: 'inline-block', border: '0.5px solid #e0d8c8' }} />
                          <span style={{ fontSize: 10, color: '#7a6e5f', fontFamily: "'EB Garamond', serif" }}>{section.color_scheme}</span>
                        </span>
                        {hasCustomBg && <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>{T('themeCustomBg')}</span>}
                      </div>
                      <span style={{ fontSize: 13, color: '#7a6e5f', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', flexShrink: 0, marginLeft: 8 }}>▾</span>
                    </button>

                    {/* Visibility toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', borderLeft: '0.5px solid #ede8df', flexShrink: 0 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }} title={isVisible ? T('themeHidden') : T('themeVisible')}>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleVisible(key)}
                          style={{ accentColor: '#b08d57', cursor: 'pointer', width: 13, height: 13 }}
                        />
                        <span style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: isVisible ? '#7a6e5f' : '#b0a090', fontFamily: "'EB Garamond', serif" }}>
                          {isVisible ? T('themeVisible') : T('themeHidden')}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Expanded panel */}
                  {isOpen && (
                    <div style={{ padding: '0 14px 22px', background: '#faf7f2', borderTop: '0.5px solid #e0d8c8' }}>

                      {/* Template preview grid */}
                      <div style={{ marginTop: 16, marginBottom: 16 }}>
                        <p style={{ ...th, marginBottom: 10 }}>{T('themeTemplate')}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {designs.map(d => (
                            <button
                              key={d.key}
                              onClick={() => update(key, { design: d.key })}
                              title={d.description}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                padding: '6px 6px 8px',
                                background: section.design === d.key ? '#fdf9f3' : '#fff',
                                border: section.design === d.key ? '1.5px solid #b08d57' : '1px solid #e0d8c8',
                                borderRadius: 3, cursor: 'pointer',
                                boxShadow: section.design === d.key ? '0 1px 6px rgba(176,141,87,0.18)' : 'none',
                                transition: 'all 0.15s',
                              }}
                            >
                              <TemplatePreview sectionKey={key} designKey={d.key} colorScheme={section.color_scheme} />
                              <span style={{
                                fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                                color: section.design === d.key ? '#b08d57' : '#7a6e5f',
                                fontFamily: "'EB Garamond', serif",
                              }}>
                                {d.label}
                              </span>
                            </button>
                          ))}
                        </div>
                        {currentDesign && (
                          <p style={{ fontSize: 11, color: '#7a6e5f', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", marginTop: 6 }}>
                            {currentDesign.description}
                          </p>
                        )}
                      </div>

                      {/* Colour scheme */}
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ ...th, marginBottom: 8 }}>{T('themePalette')}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {colorSchemes.map(cs => (
                            <button
                              key={cs.name}
                              onClick={() => update(key, { color_scheme: cs.name })}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 12px', cursor: 'pointer', borderRadius: 1,
                                fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                                border: '0.5px solid',
                                background: section.color_scheme === cs.name ? '#b08d57' : 'transparent',
                                color: section.color_scheme === cs.name ? '#fff' : '#7a6e5f',
                                borderColor: section.color_scheme === cs.name ? '#b08d57' : '#d4cbbf',
                                transition: 'all 0.15s',
                              }}
                            >
                              <span style={{ width: 9, height: 9, borderRadius: '50%', background: cs.colorPrimary, display: 'inline-block', flexShrink: 0 }} />
                              {cs.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background */}
                      <div>
                        <p style={{ ...th, marginBottom: 10 }}>{T('themeBackground')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                          <ImageUploader
                            value={section.background_url ?? ''}
                            onChange={v => {
                              const url = v || null
                              update(key, { background_url: url })
                              const s = sections.find(sec => sec.section_key === key)
                              if (s) fetch('/api/dashboard/sections', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify([{ ...s, background_url: url }]),
                              })
                            }}
                            fieldKey={`section-${key}-background`}
                            label={T('themeBgUrl')}
                            opacity={section.overlay_opacity}
                            onOpacityChange={v => update(key, { overlay_opacity: v })}
                            contrast={section.contrast ?? 100}
                            onContrastChange={v => update(key, { contrast: v })}
                            bgColor={section.background_color ?? ''}
                            onBgColorChange={v => update(key, { background_color: v || null })}
                          />

                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            {key !== 'hero' && (
                            <div>
                              <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 4 }}>{T('themeFontColor')}</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <input
                                  type="color"
                                  value={section.font_color ?? '#201d19'}
                                  onChange={e => update(key, { font_color: e.target.value })}
                                  style={{ width: 30, height: 24, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 2, padding: 2, background: 'none' }}
                                />
                                <span style={{ fontSize: 12, fontFamily: "'EB Garamond', serif", color: '#201d19' }}>
                                  {section.font_color ?? T('default')}
                                </span>
                                {section.font_color && (
                                  <button onClick={() => update(key, { font_color: null })} style={{ fontSize: 11, color: '#7a6e5f', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'EB Garamond', serif", textDecoration: 'underline' }}>{T('clear')}</button>
                                )}
                              </div>
                            </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content elements (hero only) */}
                      {key === 'hero' && (
                        <div style={{ marginTop: 20 }}>
                          <p style={{ ...th, marginBottom: 10 }}>Content</p>
                          <HeroElementsPanel
                            elements={heroElements}
                            onChange={setHeroElements}
                          />
                        </div>
                      )}

                      {/* Events (schedule only) */}
                      {key === 'schedule' && (
                        <div style={{ marginTop: 20 }}>
                          <p style={{ ...th, marginBottom: 10 }}>{T('scheduleTitle')}</p>
                          <AgendaPanel
                            items={scheduleItems}
                            onItemsChange={setScheduleItems}
                            locales={locales}
                            defaultLocale={defaultLocale}
                            locale={locale}
                          />
                        </div>
                      )}

                      {/* Per-section Save */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, paddingTop: 12, borderTop: '0.5px solid #e0d8c8' }}>
                        {sectionSaved[key] && <span style={{ fontSize: 12, color: '#2d6a40', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>{T('savedShort')}</span>}
                        {sectionError[key] && <span style={{ fontSize: 12, color: '#c4614a', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>{sectionError[key]}</span>}
                        <button onClick={() => saveSection(key)} disabled={!!sectionSaving[key]} style={{ padding: '7px 18px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: sectionSaving[key] ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: sectionSaving[key] ? 0.6 : 1 }}>{sectionSaving[key] ? T('saving') : T('save')}</button>
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ border: '0.5px solid #e0d8c8', height: 0 }} />
          </div>
        </div>

        {/* ── Right: scrollable full-invitation preview ── */}
        <div style={{ width: PREVIEW_W, flexShrink: 0, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...th, fontSize: 9 }}>Vista previa</span>
            {openSection && (
              <span style={{ fontSize: 12, color: '#b08d57', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>
                {SECTION_LABELS[openSection] ?? openSection}
              </span>
            )}
          </div>

          <style>{`#theme-preview::-webkit-scrollbar{display:none}`}</style>
          <div
            id="theme-preview"
            ref={previewContainerRef}
            onMouseDown={onPreviewMouseDown}
            onMouseMove={onPreviewMouseMove}
            style={{
              width: PREVIEW_W,
              height: PREVIEW_H,
              overflowY: 'scroll',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
              cursor: grabbing ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
          >
            <div style={{ width: PHONE_W, zoom: SCALE, overflowX: 'hidden' }}>
              {sections.map(section => (
                <div
                  key={section.section_key}
                  ref={el => { sectionElRefs.current[section.section_key] = el }}
                  style={{
                    overflow: 'hidden',
                    opacity: section.visible === false ? 0.35 : 1,
                    ...(openSection === section.section_key ? { outline: '2px solid #b08d57', outlineOffset: -2, zIndex: 1, position: 'relative' } : {}),
                  }}
                >
                  <SectionTheme sectionCfg={{ colorScheme: section.color_scheme, fontColor: section.font_color ?? '' }}>
                    <PreviewFadeIn section={section}>
                      {renderPreviewSection(section.section_key, section, wd, heroElements, scheduleItems)}
                    </PreviewFadeIn>
                  </SectionTheme>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 8, fontSize: 10, color: '#9a9080', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", textAlign: 'center' }}>
            La vista previa se actualiza al cambiar los ajustes
          </p>
        </div>

      </div>
    </div>
  )
}
