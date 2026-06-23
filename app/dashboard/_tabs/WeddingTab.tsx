'use client'

import { useState } from 'react'

const LOCALE_NAMES: Record<string, string> = { en: 'English', es: 'Español', zh: '中文' }

type Props = { initialData: any; locales?: string[] }

const field: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '7px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 17, color: '#201d19', outline: 'none' }
const label: React.CSSProperties = { display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }
const group: React.CSSProperties = { marginBottom: '1.5rem' }
const section: React.CSSProperties = { marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '0.5px solid #e8e0d4' }
const sectionTitle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.25rem' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }
const localeHeader: React.CSSProperties = { fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b08d57', marginBottom: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '0.5px solid #e8e0d4' }

export default function WeddingTab({ initialData, locales = ['en'] }: Props) {
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

  const extraLocales = locales.filter(l => l !== 'en')

  return (
    <form onSubmit={handleSave}>
      <div style={section}>
        <p style={sectionTitle}>Pareja</p>
        <div style={grid2}>
          <div style={group}><label style={label}>Nombre de la novia</label><input style={field} value={f('bride_name')} onChange={e => set('bride_name', e.target.value)} /></div>
          <div style={group}><label style={label}>Nombre del novio</label><input style={field} value={f('groom_name')} onChange={e => set('groom_name', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Evento</p>
        <div style={grid2}>
          <div style={group}><label style={label}>Fecha de boda</label><input style={field} type="date" value={f('wedding_date')} onChange={e => set('wedding_date', e.target.value)} /></div>
          <div style={group}><label style={label}>Límite de confirmación</label><input style={field} value={f('rsvp_deadline')} onChange={e => set('rsvp_deadline', e.target.value)} placeholder="ej. 1 de noviembre" /></div>
          <div style={group}><label style={label}>Hora de ceremonia</label><input style={field} value={f('ceremony_time')} onChange={e => set('ceremony_time', e.target.value)} placeholder="ej. 4:00 PM" /></div>
          <div style={group}><label style={label}>Lugar de ceremonia</label><input style={field} value={f('ceremony_location')} onChange={e => set('ceremony_location', e.target.value)} /></div>
          <div style={group}><label style={label}>Hora de recepción</label><input style={field} value={f('reception_time')} onChange={e => set('reception_time', e.target.value)} placeholder="ej. 6:00 PM" /></div>
          <div style={group}><label style={label}>Lugar de recepción</label><input style={field} value={f('reception_location')} onChange={e => set('reception_location', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Coordinador</p>
        <div style={grid2}>
          <div style={group}><label style={label}>Nombre</label><input style={field} value={f('coordinator_name')} onChange={e => set('coordinator_name', e.target.value)} /></div>
          <div style={group}><label style={label}>Correo electrónico</label><input style={field} type="email" value={f('coordinator_email')} onChange={e => set('coordinator_email', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Sección principal (Hero)</p>

        <div style={group}><label style={label}>Texto superior (eyebrow)</label><input style={field} value={f('hero_eyebrow')} onChange={e => set('hero_eyebrow', e.target.value)} placeholder="ej. Save the Date" /></div>
        <div style={group}><label style={label}>Tagline</label><input style={field} value={f('hero_tagline')} onChange={e => set('hero_tagline', e.target.value)} /></div>
        <div style={group}><label style={label}>Saludo</label><input style={field} value={f('hero_greeting')} onChange={e => set('hero_greeting', e.target.value)} /></div>
        <div style={group}><label style={label}>Cuerpo de texto</label><textarea style={{ ...field, resize: 'vertical', minHeight: 80 }} value={f('hero_body_text')} onChange={e => set('hero_body_text', e.target.value)} /></div>
        <div style={group}><label style={label}>URL de fuente para nombres</label><input style={field} value={f('names_font_url')} onChange={e => set('names_font_url', e.target.value)} placeholder="URL de Google Fonts" /></div>

        {extraLocales.map(locale => (
          <div key={locale}>
            <p style={localeHeader}>Texto en {LOCALE_NAMES[locale] ?? locale} ({locale})</p>
            <div style={group}><label style={label}>Texto superior ({locale})</label><input style={field} value={lc(locale, 'hero_eyebrow')} onChange={e => setLocale(locale, 'hero_eyebrow', e.target.value)} /></div>
            <div style={group}><label style={label}>Tagline ({locale})</label><input style={field} value={lc(locale, 'hero_tagline')} onChange={e => setLocale(locale, 'hero_tagline', e.target.value)} /></div>
            <div style={group}><label style={label}>Saludo ({locale})</label><input style={field} value={lc(locale, 'hero_greeting')} onChange={e => setLocale(locale, 'hero_greeting', e.target.value)} /></div>
            <div style={group}><label style={label}>Cuerpo de texto ({locale})</label><textarea style={{ ...field, resize: 'vertical', minHeight: 80 }} value={lc(locale, 'hero_body_text')} onChange={e => setLocale(locale, 'hero_body_text', e.target.value)} /></div>
          </div>
        ))}
      </div>

      <div style={section}>
        <p style={sectionTitle}>Carta de invitación</p>
        <div style={group}><label style={label}>Encabezado</label><input style={field} value={f('letter_eyebrow')} onChange={e => set('letter_eyebrow', e.target.value)} /></div>
        <div style={group}><label style={label}>Saludo</label><input style={field} value={f('letter_greeting')} onChange={e => set('letter_greeting', e.target.value)} /></div>
        <div style={group}><label style={label}>Cuerpo de texto</label><textarea style={{ ...field, resize: 'vertical', minHeight: 100 }} value={f('letter_body_text')} onChange={e => set('letter_body_text', e.target.value)} /></div>

        {extraLocales.map(locale => (
          <div key={locale}>
            <p style={localeHeader}>Carta en {LOCALE_NAMES[locale] ?? locale} ({locale})</p>
            <div style={group}><label style={label}>Encabezado ({locale})</label><input style={field} value={lc(locale, 'letter_eyebrow')} onChange={e => setLocale(locale, 'letter_eyebrow', e.target.value)} /></div>
            <div style={group}><label style={label}>Saludo ({locale})</label><input style={field} value={lc(locale, 'letter_greeting')} onChange={e => setLocale(locale, 'letter_greeting', e.target.value)} /></div>
            <div style={group}><label style={label}>Cuerpo de texto ({locale})</label><textarea style={{ ...field, resize: 'vertical', minHeight: 100 }} value={lc(locale, 'letter_body_text')} onChange={e => setLocale(locale, 'letter_body_text', e.target.value)} /></div>
          </div>
        ))}
      </div>

      <div style={{ ...section, borderBottom: 'none' }}>
        <p style={sectionTitle}>Video</p>
        <div style={grid2}>
          <div style={group}>
            <label style={label}>Tipo de fuente</label>
            <select style={{ ...field, cursor: 'pointer' }} value={f('video_source_type')} onChange={e => set('video_source_type', e.target.value)}>
              <option value="">Ninguno</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="self">Alojado propio</option>
            </select>
          </div>
          <div style={group}><label style={label}>ID de video / URL</label><input style={field} value={f('video_source_id')} onChange={e => set('video_source_id', e.target.value)} /></div>
          <div style={group}><label style={label}>URL de imagen de póster</label><input style={field} value={f('video_poster_url')} onChange={e => set('video_poster_url', e.target.value)} /></div>
        </div>
      </div>

      {error && <p style={{ color: '#c4614a', fontSize: 14, fontStyle: 'italic', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" disabled={saving} style={{ padding: '10px 28px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, borderRadius: 1 }}>
        {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
      </button>
    </form>
  )
}
