'use client'

import { useState } from 'react'

type SectionRow = {
  id: string | null
  section_key: string
  sort_order: number
  visible: boolean
  design: string
  color_scheme: string
  background_url: string | null
  background_color: string | null
  font_color: string | null
  overlay_opacity: number
}

type Props = {
  initialSections: SectionRow[]
  activeSectionKeys: string[]
}

const SECTION_LABELS: Record<string, string> = {
  envelope: 'Sobre / Portada',
  hero: 'Hero principal',
  countdown: 'Cuenta regresiva',
  seating: 'Tarjeta de mesa',
  rsvp: 'Confirmación (RSVP)',
  schedule: 'Agenda del día',
  video: 'Video',
  gallery: 'Galería de fotos',
  faq: 'Preguntas frecuentes',
}

export default function SectionsTab({ initialSections, activeSectionKeys }: Props) {
  const [sections, setSections] = useState<SectionRow[]>(() => {
    const byKey = Object.fromEntries(initialSections.map(s => [s.section_key, s]))
    return activeSectionKeys.map((key, i) => byKey[key] ?? {
      id: null,
      section_key: key,
      sort_order: i * 10,
      visible: true,
      design: 'Classic',
      color_scheme: 'Gold',
      background_url: null,
      background_color: null,
      font_color: null,
      overlay_opacity: 0.32,
    })
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= sections.length) return
    setSections(prev => {
      const arr = [...prev]
      const aOrder = arr[index].sort_order
      const bOrder = arr[next].sort_order
      arr[index] = { ...arr[index], sort_order: bOrder === aOrder ? bOrder + dir : bOrder }
      arr[next] = { ...arr[next], sort_order: aOrder === bOrder ? aOrder - dir : aOrder }
      return [...arr].sort((a, b) => a.sort_order - b.sort_order)
    })
  }

  function toggleVisible(key: string) {
    setSections(prev => prev.map(s => s.section_key === key ? { ...s, visible: !s.visible } : s))
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const payload = sections.map((s, i) => ({
        ...s,
        sort_order: i * 10,
      }))
      const res = await fetch('/api/dashboard/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated: SectionRow[] = await res.json()
        const byKey = Object.fromEntries(updated.map(s => [s.section_key, s]))
        setSections(prev => prev.map(s => byKey[s.section_key] ?? s))
        setSaved(true); setTimeout(() => setSaved(false), 2500)
      } else {
        const d = await res.json(); setError(d.error ?? 'Error al guardar')
      }
    } catch { setError('Error de red') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '0.5rem' }}>
        Secciones
      </p>
      <p style={{ fontSize: 13, color: '#7a6e5f', marginBottom: '1.5rem', fontFamily: "'EB Garamond', serif" }}>
        Reordena y oculta las secciones de la invitación.
      </p>

      <div style={{ border: '0.5px solid #e0d8c8', borderRadius: 2, overflow: 'hidden' }}>
        {sections.map((section, i) => (
          <div
            key={section.section_key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: i < sections.length - 1 ? '0.5px solid #f0ebe3' : 'none',
              background: section.visible ? '#fff' : '#faf7f2',
              opacity: section.visible ? 1 : 0.55,
              transition: 'opacity 0.15s',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#ccc' : '#7a6e5f', fontSize: 12, padding: '1px 4px', lineHeight: 1 }}
                title="Mover arriba"
              >▲</button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === sections.length - 1}
                style={{ background: 'none', border: 'none', cursor: i === sections.length - 1 ? 'default' : 'pointer', color: i === sections.length - 1 ? '#ccc' : '#7a6e5f', fontSize: 12, padding: '1px 4px', lineHeight: 1 }}
                title="Mover abajo"
              >▼</button>
            </div>

            <span style={{ flex: 1, fontFamily: "'EB Garamond', serif", fontSize: 16, color: '#201d19' }}>
              {SECTION_LABELS[section.section_key] ?? section.section_key}
            </span>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={section.visible}
                onChange={() => toggleVisible(section.section_key)}
                style={{ accentColor: '#b08d57', width: 14, height: 14, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7a6e5f', fontFamily: "'EB Garamond', serif" }}>
                {section.visible ? 'Visible' : 'Oculta'}
              </span>
            </label>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#c4614a', fontSize: 14, fontStyle: 'italic', marginTop: '1rem' }}>{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: '1.5rem', padding: '10px 28px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, borderRadius: 1 }}
      >
        {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar Orden'}
      </button>
    </div>
  )
}
