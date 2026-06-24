'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'

const LOCALE_NAMES: Record<string, string> = { en: 'English', es: 'Español', zh: '中文' }

type Props = { initialData: any; locales?: string[]; defaultLocale?: string; locale?: string }

const field: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '7px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 17, color: '#201d19', outline: 'none' }
const label: React.CSSProperties = { display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }
const group: React.CSSProperties = { marginBottom: '1.5rem' }
const section: React.CSSProperties = { marginBottom: '2rem' }
const sectionTitle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.25rem' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }
const localeCard: React.CSSProperties = { marginBottom: '1.25rem', padding: '10px 14px', background: '#faf7f2', border: '0.5px solid #e8e0d4', borderRadius: 2 }
const localeTagStyle: React.CSSProperties = { display: 'inline-block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', background: '#b08d57', padding: '2px 6px', borderRadius: 2, marginBottom: 10 }

export default function WeddingTab({ initialData, locales = ['en'], defaultLocale = 'en', locale }: Props) {
  const [form, setForm] = useState<Record<string, any>>(initialData ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  function setLocale(locale: string, key: string, val: string) {
    setForm(f => ({
      ...f,
      locale_content: {
        ...(f.locale_content ?? {}),
        [locale]: {
          ...((f.locale_content ?? {})[locale] ?? {}),
          [key]: val,
        },
      },
    }))
  }

  function lc(locale: string, key: string): string {
    return (form.locale_content?.[locale]?.[key]) ?? ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/dashboard/wedding-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
      else { const d = await res.json(); setError(d.error ?? 'Error al guardar') }
    } catch { setError('Error de red') }
    finally { setSaving(false) }
  }

  const f = (key: string) => form[key] ?? ''

  const T = (k: string) => dt(k, locale)
  const extraLocales = locales.filter(l => l !== defaultLocale)

  return (
    <form onSubmit={handleSave}>
      <div style={section}>
        <p style={sectionTitle}>{T('weddingCouple')}</p>
        <div style={grid2}>
          <div style={group}><label style={label}>{T('weddingBrideName')}</label><input style={field} value={f('bride_name')} onChange={e => set('bride_name', e.target.value)} /></div>
          <div style={group}><label style={label}>{T('weddingGroomName')}</label><input style={field} value={f('groom_name')} onChange={e => set('groom_name', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>{T('weddingEvent')}</p>
        <div style={grid2}>
          <div style={group}><label style={label}>{T('weddingDate')}</label><input style={field} type="date" value={f('wedding_date')} onChange={e => set('wedding_date', e.target.value)} /></div>
          <div style={group}><label style={label}>{T('weddingRsvpDeadline')}</label><input style={field} value={f('rsvp_deadline')} onChange={e => set('rsvp_deadline', e.target.value)} placeholder={T('weddingRsvpDeadlinePh')} /></div>
          <div style={group}><label style={label}>{T('weddingCeremonyTime')}</label><input style={field} value={f('ceremony_time')} onChange={e => set('ceremony_time', e.target.value)} placeholder={T('weddingCeremonyTimePh')} /></div>
          <div style={group}><label style={label}>{T('weddingCeremonyLocation')}</label><input style={field} value={f('ceremony_location')} onChange={e => set('ceremony_location', e.target.value)} /></div>
          <div style={group}><label style={label}>{T('weddingReceptionTime')}</label><input style={field} value={f('reception_time')} onChange={e => set('reception_time', e.target.value)} placeholder={T('weddingReceptionTimePh')} /></div>
          <div style={group}><label style={label}>{T('weddingReceptionLocation')}</label><input style={field} value={f('reception_location')} onChange={e => set('reception_location', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>{T('weddingCoordinator')}</p>
        <div style={grid2}>
          <div style={group}><label style={label}>{T('weddingCoordName')}</label><input style={field} value={f('coordinator_name')} onChange={e => set('coordinator_name', e.target.value)} /></div>
          <div style={group}><label style={label}>{T('weddingCoordEmail')}</label><input style={field} type="email" value={f('coordinator_email')} onChange={e => set('coordinator_email', e.target.value)} /></div>
        </div>
        <div style={group}><label style={label}>{T('weddingNamesFontUrl')}</label><input style={field} value={f('names_font_url')} onChange={e => set('names_font_url', e.target.value)} placeholder={T('weddingNamesFontUrlPh')} /></div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>{T('weddingLetter')}</p>

        {/* Default locale card */}
        <div style={localeCard}>
          {extraLocales.length > 0 && <span style={localeTagStyle}>{LOCALE_NAMES[defaultLocale] ?? defaultLocale} ({defaultLocale})</span>}
          <div style={group}><label style={label}>{T('weddingLetterEyebrow')}</label><input style={field} value={f('letter_eyebrow')} onChange={e => set('letter_eyebrow', e.target.value)} /></div>
          <div style={group}><label style={label}>{T('weddingLetterGreeting')}</label><input style={field} value={f('letter_greeting')} onChange={e => set('letter_greeting', e.target.value)} /></div>
          <div style={{ marginBottom: 0 }}><label style={label}>{T('weddingLetterBody')}</label><textarea style={{ ...field, resize: 'vertical', minHeight: 100 }} value={f('letter_body_text')} onChange={e => set('letter_body_text', e.target.value)} /></div>
        </div>

        {extraLocales.map(xl => (
          <div key={xl} style={localeCard}>
            <span style={localeTagStyle}>{LOCALE_NAMES[xl] ?? xl} ({xl})</span>
            <div style={group}><label style={label}>{T('weddingLetterEyebrow')}</label><input style={field} value={lc(xl, 'letter_eyebrow')} onChange={e => setLocale(xl, 'letter_eyebrow', e.target.value)} /></div>
            <div style={group}><label style={label}>{T('weddingLetterGreeting')}</label><input style={field} value={lc(xl, 'letter_greeting')} onChange={e => setLocale(xl, 'letter_greeting', e.target.value)} /></div>
            <div style={{ marginBottom: 0 }}><label style={label}>{T('weddingLetterBody')}</label><textarea style={{ ...field, resize: 'vertical', minHeight: 100 }} value={lc(xl, 'letter_body_text')} onChange={e => setLocale(xl, 'letter_body_text', e.target.value)} /></div>
          </div>
        ))}
      </div>

      <div style={section}>
        <p style={sectionTitle}>{T('weddingVideo')}</p>
        <div style={grid2}>
          <div style={group}>
            <label style={label}>{T('weddingVideoType')}</label>
            <select style={{ ...field, cursor: 'pointer' }} value={f('video_source_type')} onChange={e => set('video_source_type', e.target.value)}>
              <option value="">{T('weddingVideoNone')}</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="self">{T('weddingVideoSelf')}</option>
            </select>
          </div>
          <div style={group}><label style={label}>{T('weddingVideoId')}</label><input style={field} value={f('video_source_id')} onChange={e => set('video_source_id', e.target.value)} /></div>
          <div style={group}><label style={label}>{T('weddingVideoPoster')}</label><input style={field} value={f('video_poster_url')} onChange={e => set('video_poster_url', e.target.value)} /></div>
        </div>
      </div>

      {error && <p style={{ color: '#c4614a', fontSize: 14, fontStyle: 'italic', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" disabled={saving} style={{ padding: '10px 28px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, borderRadius: 1 }}>
        {saving ? T('saving') : saved ? T('saved') : T('saveChanges')}
      </button>
    </form>
  )
}
