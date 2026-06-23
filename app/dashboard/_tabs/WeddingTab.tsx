'use client'

import { useState } from 'react'

type Props = { initialData: any }

const field: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '7px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 17, color: '#201d19', outline: 'none' }
const label: React.CSSProperties = { display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }
const group: React.CSSProperties = { marginBottom: '1.5rem' }
const section: React.CSSProperties = { marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '0.5px solid #e8e0d4' }
const sectionTitle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.25rem' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }

export default function WeddingTab({ initialData }: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialData ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

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
      else { const d = await res.json(); setError(d.error ?? 'Failed to save') }
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  const f = (key: string) => form[key] ?? ''

  return (
    <form onSubmit={handleSave}>
      <div style={section}>
        <p style={sectionTitle}>Couple</p>
        <div style={grid2}>
          <div style={group}><label style={label}>Bride name</label><input style={field} value={f('bride_name')} onChange={e => set('bride_name', e.target.value)} /></div>
          <div style={group}><label style={label}>Groom name</label><input style={field} value={f('groom_name')} onChange={e => set('groom_name', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Event</p>
        <div style={grid2}>
          <div style={group}><label style={label}>Wedding date</label><input style={field} type="date" value={f('wedding_date')} onChange={e => set('wedding_date', e.target.value)} /></div>
          <div style={group}><label style={label}>RSVP deadline</label><input style={field} value={f('rsvp_deadline')} onChange={e => set('rsvp_deadline', e.target.value)} placeholder="e.g. November 1" /></div>
          <div style={group}><label style={label}>Ceremony time</label><input style={field} value={f('ceremony_time')} onChange={e => set('ceremony_time', e.target.value)} placeholder="e.g. 4:00 PM" /></div>
          <div style={group}><label style={label}>Ceremony location</label><input style={field} value={f('ceremony_location')} onChange={e => set('ceremony_location', e.target.value)} /></div>
          <div style={group}><label style={label}>Reception time</label><input style={field} value={f('reception_time')} onChange={e => set('reception_time', e.target.value)} placeholder="e.g. 6:00 PM" /></div>
          <div style={group}><label style={label}>Reception location</label><input style={field} value={f('reception_location')} onChange={e => set('reception_location', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Coordinator</p>
        <div style={grid2}>
          <div style={group}><label style={label}>Name</label><input style={field} value={f('coordinator_name')} onChange={e => set('coordinator_name', e.target.value)} /></div>
          <div style={group}><label style={label}>Email</label><input style={field} type="email" value={f('coordinator_email')} onChange={e => set('coordinator_email', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Hero section</p>
        <div style={group}><label style={label}>Eyebrow text</label><input style={field} value={f('hero_eyebrow')} onChange={e => set('hero_eyebrow', e.target.value)} placeholder="e.g. Save the Date" /></div>
        <div style={group}><label style={label}>Tagline</label><input style={field} value={f('hero_tagline')} onChange={e => set('hero_tagline', e.target.value)} /></div>
        <div style={group}><label style={label}>Greeting</label><input style={field} value={f('hero_greeting')} onChange={e => set('hero_greeting', e.target.value)} /></div>
        <div style={group}><label style={label}>Body text</label><textarea style={{ ...field, resize: 'vertical', minHeight: 80 }} value={f('hero_body_text')} onChange={e => set('hero_body_text', e.target.value)} /></div>
        <div style={group}><label style={label}>Names font URL</label><input style={field} value={f('names_font_url')} onChange={e => set('names_font_url', e.target.value)} placeholder="Google Fonts URL" /></div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Invitation letter</p>
        <div style={group}><label style={label}>Eyebrow</label><input style={field} value={f('letter_eyebrow')} onChange={e => set('letter_eyebrow', e.target.value)} /></div>
        <div style={group}><label style={label}>Greeting</label><input style={field} value={f('letter_greeting')} onChange={e => set('letter_greeting', e.target.value)} /></div>
        <div style={group}><label style={label}>Body text</label><textarea style={{ ...field, resize: 'vertical', minHeight: 100 }} value={f('letter_body_text')} onChange={e => set('letter_body_text', e.target.value)} /></div>
      </div>

      <div style={{ ...section, borderBottom: 'none' }}>
        <p style={sectionTitle}>Video</p>
        <div style={grid2}>
          <div style={group}>
            <label style={label}>Source type</label>
            <select style={{ ...field, cursor: 'pointer' }} value={f('video_source_type')} onChange={e => set('video_source_type', e.target.value)}>
              <option value="">None</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="self">Self-hosted</option>
            </select>
          </div>
          <div style={group}><label style={label}>Video ID / URL</label><input style={field} value={f('video_source_id')} onChange={e => set('video_source_id', e.target.value)} /></div>
          <div style={group}><label style={label}>Poster image URL</label><input style={field} value={f('video_poster_url')} onChange={e => set('video_poster_url', e.target.value)} /></div>
        </div>
      </div>

      {error && <p style={{ color: '#c4614a', fontSize: 14, fontStyle: 'italic', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" disabled={saving} style={{ padding: '10px 28px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, borderRadius: 1 }}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </form>
  )
}
