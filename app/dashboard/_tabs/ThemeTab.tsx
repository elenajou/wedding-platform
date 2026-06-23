'use client'

import { useState } from 'react'
import { SECTION_DESIGNS, type SectionKey } from '@/themes/section-designs'
import { getAllColorSchemes, getColorScheme } from '@/themes/color-schemes'
import TemplatePreview from './_TemplatePreview'

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
}

const colorSchemes = getAllColorSchemes()

const SECTION_LABELS: Record<string, string> = {
  envelope: 'Envelope Gate', hero: 'Hero', countdown: 'Countdown', seating: 'Seating Card',
  rsvp: 'RSVP Form', schedule: 'Day Schedule', video: 'Video', gallery: 'Gallery', faq: 'FAQ',
}

const th: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#7a6e5f', fontWeight: 400, fontFamily: "'EB Garamond', serif",
}
const field: React.CSSProperties = {
  padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf',
  fontFamily: "'EB Garamond', serif", fontSize: 14, color: '#201d19',
  outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box',
}

export default function ThemeTab({ initialSections, enabledDesigns, activeSectionKeys }: Props) {
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
        const d = await res.json(); setError(d.error ?? 'Failed to save')
      }
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19' }}>
          Theme &amp; Templates
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {saved && <span style={{ fontSize: 12, color: '#2d6a40', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>Saved</span>}
          {error && <span style={{ fontSize: 12, color: '#c4614a', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '7px 18px', background: '#b08d57', color: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 14, color: '#7a6e5f', fontStyle: 'italic', marginBottom: '2rem' }}>
        Choose a template and colour scheme for each section. Customise backgrounds, overlays, and font colours per section.
      </p>

      {/* Section accordion */}
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
              {/* Section header row */}
              <button
                onClick={() => setOpenSection(isOpen ? null : key)}
                style={{
                  width: '100%', background: isOpen ? '#faf7f2' : '#fff',
                  border: 'none', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ ...th, fontSize: 12 }}>{SECTION_LABELS[key] ?? key}</span>
                  <span style={{ fontSize: 12, color: '#b08d57', fontFamily: "'EB Garamond', serif", fontStyle: 'italic' }}>
                    {currentDesign?.label}
                  </span>
                  <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: scheme.colorPrimary, display: 'inline-block', border: '0.5px solid #e0d8c8' }} />
                    <span style={{ fontSize: 11, color: '#7a6e5f', fontFamily: "'EB Garamond', serif" }}>{section.color_scheme}</span>
                  </span>
                  {hasCustomBg && (
                    <span style={{ fontSize: 10, color: '#7a6e5f', fontFamily: "'EB Garamond', serif", letterSpacing: '0.1em' }}>
                      custom bg
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 14, color: '#7a6e5f', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
              </button>

              {/* Expanded panel */}
              {isOpen && (
                <div style={{ padding: '0 16px 24px', background: '#faf7f2', borderTop: '0.5px solid #e0d8c8' }}>

                  {/* Template preview grid */}
                  <div style={{ marginTop: 18, marginBottom: 18 }}>
                    <p style={{ ...th, marginBottom: 12 }}>Template</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {designs.map(d => (
                        <button
                          key={d.key}
                          onClick={() => update(key, { design: d.key })}
                          title={d.description}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                            padding: '7px 7px 9px',
                            background: section.design === d.key ? '#fdf9f3' : '#fff',
                            border: section.design === d.key ? '1.5px solid #b08d57' : '1px solid #e0d8c8',
                            borderRadius: 3, cursor: 'pointer',
                            boxShadow: section.design === d.key ? '0 1px 6px rgba(176,141,87,0.18)' : 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          <TemplatePreview sectionKey={key} designKey={d.key} colorScheme={section.color_scheme} />
                          <span style={{
                            fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                            color: section.design === d.key ? '#b08d57' : '#7a6e5f',
                            fontFamily: "'EB Garamond', serif",
                          }}>
                            {d.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {currentDesign && (
                      <p style={{ fontSize: 12, color: '#7a6e5f', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", marginTop: 8 }}>
                        {currentDesign.description}
                      </p>
                    )}
                  </div>

                  {/* Colour scheme */}
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ ...th, marginBottom: 10 }}>Colour Scheme</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {colorSchemes.map(cs => (
                        <button
                          key={cs.name}
                          onClick={() => update(key, { color_scheme: cs.name })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', cursor: 'pointer', borderRadius: 1,
                            fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                            border: '0.5px solid',
                            background: section.color_scheme === cs.name ? '#b08d57' : 'transparent',
                            color: section.color_scheme === cs.name ? '#fff' : '#7a6e5f',
                            borderColor: section.color_scheme === cs.name ? '#b08d57' : '#d4cbbf',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: cs.colorPrimary, display: 'inline-block', flexShrink: 0 }} />
                          {cs.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background */}
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ ...th, marginBottom: 10 }}>Background</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                      {/* Image URL */}
                      <div>
                        <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 5 }}>Image URL</label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/…"
                          value={section.background_url ?? ''}
                          onChange={e => update(key, { background_url: e.target.value || null })}
                          style={field}
                        />
                      </div>

                      {/* Color + Font color row */}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

                        {/* Background color */}
                        <div>
                          <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 5 }}>Background Color</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="color"
                              value={section.background_color ?? '#faf7f2'}
                              onChange={e => update(key, { background_color: e.target.value })}
                              style={{ width: 32, height: 26, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 2, padding: 2, background: 'none' }}
                            />
                            <span style={{ fontSize: 12, fontFamily: "'EB Garamond', serif", color: '#201d19' }}>
                              {section.background_color ?? 'None'}
                            </span>
                            {section.background_color && (
                              <button
                                onClick={() => update(key, { background_color: null })}
                                style={{ fontSize: 11, color: '#7a6e5f', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'EB Garamond', serif", textDecoration: 'underline' }}
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Font color */}
                        <div>
                          <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 5 }}>Font Color</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="color"
                              value={section.font_color ?? '#201d19'}
                              onChange={e => update(key, { font_color: e.target.value })}
                              style={{ width: 32, height: 26, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 2, padding: 2, background: 'none' }}
                            />
                            <span style={{ fontSize: 12, fontFamily: "'EB Garamond', serif", color: '#201d19' }}>
                              {section.font_color ?? 'Default'}
                            </span>
                            {section.font_color && (
                              <button
                                onClick={() => update(key, { font_color: null })}
                                style={{ fontSize: 11, color: '#7a6e5f', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'EB Garamond', serif", textDecoration: 'underline' }}
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Overlay opacity — shown only when there's a background image or color */}
                      {hasCustomBg && (
                        <div>
                          <label style={{ ...th, fontSize: 9, display: 'block', marginBottom: 6 }}>
                            Overlay Opacity — {Math.round(section.overlay_opacity * 100)}%
                          </label>
                          <input
                            type="range"
                            min={0} max={1} step={0.01}
                            value={section.overlay_opacity}
                            onChange={e => update(key, { overlay_opacity: parseFloat(e.target.value) })}
                            style={{ width: '100%', accentColor: '#b08d57' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                            <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>None</span>
                            <span style={{ fontSize: 10, color: '#9a9080', fontFamily: "'EB Garamond', serif" }}>Full</span>
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
  )
}
