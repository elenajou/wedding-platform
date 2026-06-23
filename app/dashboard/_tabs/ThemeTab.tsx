'use client'

import { useState } from 'react'
import { SECTION_DESIGNS, type SectionKey } from '@/themes/section-designs'
import { getAllColorSchemes, getColorScheme } from '@/themes/color-schemes'
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
  sort_order: number
}

type Props = {
  initialSections: SectionRow[]
  enabledDesigns: Record<string, string[]>
  activeSectionKeys: string[]
  weddingDetails?: Record<string, unknown> | null
}

// ── Preview dimensions (iPhone 14 Pro Max logical pixels) ────────────────────

const PHONE_W = 450
const PHONE_H = 1000
const PREVIEW_W = 250
const SCALE = PREVIEW_W / PHONE_W
const PREVIEW_H = Math.round(PHONE_H * SCALE)

// ── Preview FadeIn (no animations — shows immediately for the live panel) ────

function PreviewFadeIn({ section, children }: { section: SectionRow; children: React.ReactNode }) {
  const style: React.CSSProperties & Record<string, string> = {}
  if (section.background_url) {
    style.backgroundImage = `url(${section.background_url})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.position = 'relative'
  }
  if (section.background_color) style.backgroundColor = section.background_color
  if (section.font_color) style['--section-color'] = section.font_color

  return (
    <div style={style}>
      {section.background_url && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: section.overlay_opacity >= 0
            ? `rgba(0,0,0,${section.overlay_opacity})`
            : `rgba(255,255,255,${Math.abs(section.overlay_opacity)})`,
        }} />
      )}
      <div style={section.background_url ? { position: 'relative', zIndex: 1 } : undefined}>
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
}

const colorSchemes = getAllColorSchemes()

// ── Live preview renderer ─────────────────────────────────────────────────────

function renderPreviewSection(key: string, section: SectionRow, wd: Record<string, unknown> | null | undefined) {
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
          namesFontUrl={(wd?.names_font_url as string) || null}
          heroTagline={(wd?.hero_tagline as string) || null}
          heroEyebrow={(wd?.hero_eyebrow as string) || null}
          heroGreeting={(wd?.hero_greeting as string) || null}
          heroBodyText={(wd?.hero_body_text as string) || null}
          backgroundUrl={section.background_url || undefined}
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
    case 'schedule':
      return <DaySchedule dict={PREVIEW_DICT.schedule} design={design} />
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
    default:
      return null
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ThemeTab({ initialSections, enabledDesigns, activeSectionKeys, weddingDetails }: Props) {
  const [sections, setSections] = useState<SectionRow[]>(() => {
    const existing = Object.fromEntries(initialSections.map(s => [s.section_key, s]))
    return activeSectionKeys.map(key => existing[key] ?? {
      id: null, section_key: key, design: 'Classic', color_scheme: 'Gold',
      background_url: null, background_color: null, font_color: null,
      overlay_opacity: 0.32, sort_order: 99,
    })
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [openSection, setOpenSection] = useState<string | null>(activeSectionKeys[0] ?? null)

  function update(key: string, patch: Partial<SectionRow>) {
    setSections(prev => prev.map(s => s.section_key === key ? { ...s, ...patch } : s))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/dashboard/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sections.map(s => ({
          id: s.id,
          section_key: s.section_key,
          design: s.design,
          color_scheme: s.color_scheme,
          background_url: s.background_url || null,
          background_color: s.background_color || null,
          font_color: s.font_color || null,
          overlay_opacity: s.overlay_opacity,
          sort_order: s.sort_order,
        }))),
      })
      if (res.ok) {
        const updated: SectionRow[] = await res.json()
        setSections(prev => prev.map(s => updated.find(u => u.section_key === s.section_key) ?? s))
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        const d = await res.json(); setError(d.error ?? 'Error al guardar')
      }
    } catch { setError('Error de red') } finally { setSaving(false) }
  }

  const currentSection = sections.find(s => s.section_key === openSection)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19' }}>
          Tema y Plantillas
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {saved && <span style={{ fontSize: 12, color: '#2d6a40', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>Guardado</span>}
          {error && <span style={{ fontSize: 12, color: '#c4614a', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '7px 18px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left: controls ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, color: '#7a6e5f', fontStyle: 'italic', marginBottom: '1.5rem' }}>
            Elige plantilla y paleta para cada sección. Personaliza fondos, superposición y color de texto.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sections.map(section => {
              const key = section.section_key
              const allDesigns = SECTION_DESIGNS[key as SectionKey] ?? []
              const allowed = enabledDesigns[key]
              const designs = allowed && allowed.length > 0 ? allDesigns.filter(d => allowed.includes(d.key)) : allDesigns
              const currentDesign = designs.find(d => d.key === section.design) ?? designs[0]
              const isOpen = openSection === key
              const scheme = getColorScheme(section.color_scheme)
              const hasCustomBg = !!(section.background_url || section.background_color)

              return (
                <div key={key} style={{ border: '0.5px solid #e0d8c8', borderBottom: 'none', background: '#fff' }}>
                  {/* Section header */}
                  <button
                    onClick={() => setOpenSection(isOpen ? null : key)}
                    style={{
                      width: '100%', background: isOpen ? '#faf7f2' : '#fff',
                      border: 'none', padding: '13px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', textAlign: 'left',
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
                      {hasCustomBg && <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>fondo personalizado</span>}
                    </div>
                    <span style={{ fontSize: 13, color: '#7a6e5f', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', flexShrink: 0, marginLeft: 8 }}>▾</span>
                  </button>

                  {/* Expanded panel */}
                  {isOpen && (
                    <div style={{ padding: '0 14px 22px', background: '#faf7f2', borderTop: '0.5px solid #e0d8c8' }}>

                      {/* Template preview grid */}
                      <div style={{ marginTop: 16, marginBottom: 16 }}>
                        <p style={{ ...th, marginBottom: 10 }}>Plantilla</p>
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
                        <p style={{ ...th, marginBottom: 8 }}>Paleta de colores</p>
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
                        <p style={{ ...th, marginBottom: 10 }}>Fondo</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                          <div>
                            <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 4 }}>URL de imagen de fondo</label>
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/…"
                              value={section.background_url ?? ''}
                              onChange={e => update(key, { background_url: e.target.value || null })}
                              style={fieldStyle}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div>
                              <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 4 }}>Color de fondo</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <input
                                  type="color"
                                  value={section.background_color ?? '#faf7f2'}
                                  onChange={e => update(key, { background_color: e.target.value })}
                                  style={{ width: 30, height: 24, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 2, padding: 2, background: 'none' }}
                                />
                                <span style={{ fontSize: 12, fontFamily: "'EB Garamond', serif", color: '#201d19' }}>
                                  {section.background_color ?? 'Ninguno'}
                                </span>
                                {section.background_color && (
                                  <button onClick={() => update(key, { background_color: null })} style={{ fontSize: 11, color: '#7a6e5f', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'EB Garamond', serif", textDecoration: 'underline' }}>Limpiar</button>
                                )}
                              </div>
                            </div>

                            <div>
                              <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 4 }}>Color de texto</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <input
                                  type="color"
                                  value={section.font_color ?? '#201d19'}
                                  onChange={e => update(key, { font_color: e.target.value })}
                                  style={{ width: 30, height: 24, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 2, padding: 2, background: 'none' }}
                                />
                                <span style={{ fontSize: 12, fontFamily: "'EB Garamond', serif", color: '#201d19' }}>
                                  {section.font_color ?? 'Por defecto'}
                                </span>
                                {section.font_color && (
                                  <button onClick={() => update(key, { font_color: null })} style={{ fontSize: 11, color: '#7a6e5f', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'EB Garamond', serif", textDecoration: 'underline' }}>Limpiar</button>
                                )}
                              </div>
                            </div>
                          </div>

                          {hasCustomBg && (
                            <div>
                              <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 5 }}>
                                Opacidad de superposición — {Math.round(section.overlay_opacity * 100)}%
                              </label>
                              <input
                                type="range"
                                min={0} max={1} step={0.01}
                                value={section.overlay_opacity}
                                onChange={e => update(key, { overlay_opacity: parseFloat(e.target.value) })}
                                style={{ width: '100%', accentColor: '#b08d57' }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                                <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>Ninguna</span>
                                <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>Completa</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ border: '0.5px solid #e0d8c8', height: 0 }} />
          </div>
        </div>

        {/* ── Right: live preview (iPhone 14 Pro Max dimensions) ── */}
        <div style={{ width: PREVIEW_W + 20, flexShrink: 0, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>

          {/* Panel label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...th, fontSize: 9 }}>Vista previa — iPhone 14 Pro Max</span>
            {openSection && (
              <span style={{ fontSize: 12, color: '#b08d57', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>
                {SECTION_LABELS[openSection] ?? openSection}
              </span>
            )}
          </div>

          {/* Phone frame — screen-edge design (Dynamic Island inside) */}
          <div style={{
            width: PREVIEW_W + 14,
            background: '#1c1c1e',
            borderRadius: 36,
            padding: '7px',
            boxShadow: '0 0 0 1px #3a3a3c, inset 0 0 0 1px #2c2c2e, 0 24px 64px rgba(0,0,0,0.5)',
          }}>
            {/* Screen — Dynamic Island + content + home bar all live inside */}
            <div style={{
              width: PREVIEW_W,
              height: PREVIEW_H,
              overflow: 'hidden',
              borderRadius: 29,
              background: currentSection
                ? (currentSection.background_color ?? getColorScheme(currentSection.color_scheme).colorBackground)
                : '#faf7f2',
              position: 'relative',
            }}>
              {/* Content */}
              {currentSection ? (
                <div style={{
                  width: PHONE_W,
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: `translateX(-50%) scale(${SCALE})`,
                  transformOrigin: 'top center',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  paddingTop: Math.round(44 / SCALE),
                }}>
                  <SectionTheme sectionCfg={{ colorScheme: currentSection.color_scheme, fontColor: currentSection.font_color ?? '' }}>
                    <PreviewFadeIn section={currentSection}>
                      {renderPreviewSection(openSection!, currentSection, weddingDetails)}
                    </PreviewFadeIn>
                  </SectionTheme>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9a9080', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", fontSize: 14, textAlign: 'center', padding: '0 20px' }}>
                  Abre una sección para ver la vista previa
                </div>
              )}

              {/* Dynamic Island — pill cutout overlaid on screen */}
              <div style={{
                position: 'absolute', top: 10, left: '50%',
                transform: 'translateX(-50%)',
                width: Math.round(PREVIEW_W * 0.34),
                height: 20,
                background: '#0a0a0a',
                borderRadius: 10,
                zIndex: 20,
                boxShadow: '0 0 0 1px #1c1c1e',
              }}>
                {/* Front camera dot */}
                <div style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: '#1a2a2a',
                  boxShadow: 'inset 0 0 0 1.5px #0d1a1a',
                }} />
              </div>

              {/* Home indicator — inside screen at bottom */}
              <div style={{
                position: 'absolute', bottom: 6, left: '50%',
                transform: 'translateX(-50%)',
                width: Math.round(PREVIEW_W * 0.36),
                height: 4,
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 2,
                zIndex: 20,
              }} />
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
