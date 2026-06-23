'use client'

import { useState } from 'react'
import type { WeddingConfig } from '@/lib/tenant'
import { SECTION_DESIGNS, type SectionKey } from '@/themes/section-designs'

type Props = { config: WeddingConfig }

const SECTION_LABELS: Record<string, string> = {
  envelope: 'Envelope Gate', hero: 'Hero', countdown: 'Countdown', seating: 'Seating Card',
  rsvp: 'RSVP Form', schedule: 'Day Schedule', video: 'Video', gallery: 'Gallery', faq: 'FAQ',
}

export default function EditWeddingForm({ config }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    domains: config.domains.join(', '),
    defaultLocale: config.defaultLocale,
    locales: config.locales.join(', '),
    dashboardPassword: '',
    featureRsvp: config.features.rsvp,
    featureCountdown: config.features.countdown,
    featureGallery: config.features.gallery,
    featureSchedule: config.features.schedule,
    featureFaq: config.features.faq,
    featureSeatingCard: config.features.seatingCard,
    featureVideoSection: config.features.videoSection,
    featureGuestbook: config.features.guestbook,
    featureMaps: config.features.maps,
    featureQrCode: config.features.qrCode,
  })

  // For each section, if enabledDesigns is empty (means all allowed), initialise all checked
  const [enabledDesigns, setEnabledDesigns] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {}
    for (const key of Object.keys(SECTION_DESIGNS)) {
      const configured = config.enabledDesigns[key]
      result[key] = (!configured || configured.length === 0)
        ? SECTION_DESIGNS[key as SectionKey].map(d => d.key)
        : [...configured]
    }
    return result
  })

  function toggleDesign(sectionKey: string, designKey: string, checked: boolean) {
    setEnabledDesigns(prev => {
      const current = prev[sectionKey] ?? []
      return {
        ...prev,
        [sectionKey]: checked
          ? [...current, designKey]
          : current.filter(k => k !== designKey),
      }
    })
  }

  function set(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Convert back: if all designs checked → send empty array (means "all enabled")
      const enabledDesignsBody: Record<string, string[]> = {}
      for (const [sectionKey, checkedKeys] of Object.entries(enabledDesigns)) {
        const allKeys = SECTION_DESIGNS[sectionKey as SectionKey]?.map(d => d.key) ?? []
        const allChecked = allKeys.every(k => checkedKeys.includes(k))
        enabledDesignsBody[sectionKey] = allChecked ? [] : checkedKeys
      }

      const body: Record<string, unknown> = {
        domains: form.domains.split(',').map(d => d.trim()).filter(Boolean),
        defaultLocale: form.defaultLocale,
        locales: form.locales.split(',').map(l => l.trim()).filter(Boolean),
        features: {
          rsvp: form.featureRsvp,
          countdown: form.featureCountdown,
          gallery: form.featureGallery,
          schedule: form.featureSchedule,
          faq: form.featureFaq,
          seatingCard: form.featureSeatingCard,
          videoSection: form.featureVideoSection,
          guestbook: form.featureGuestbook,
          maps: form.featureMaps,
          qrCode: form.featureQrCode,
        },
        enabledDesigns: enabledDesignsBody,
      }
      if (form.dashboardPassword) body.dashboardPassword = form.dashboardPassword

      const res = await fetch(`/api/super-admin/weddings/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        window.location.href = '/super-admin'
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete wedding "${config.slug}" and all its data? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/super-admin/weddings/${config.id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/super-admin'
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete')
      }
    } catch {
      setError('Network error')
    } finally {
      setDeleting(false)
    }
  }

  const fieldStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #3a3530', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 300, color: '#f4efe5', outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#6b6046', marginBottom: 4 }

  const features: [string, string][] = [
    ['featureRsvp', 'RSVP'],
    ['featureCountdown', 'Countdown'],
    ['featureGallery', 'Gallery'],
    ['featureSchedule', 'Schedule'],
    ['featureFaq', 'FAQ'],
    ['featureSeatingCard', 'Seating Card'],
    ['featureVideoSection', 'Video Section'],
    ['featureGuestbook', 'Guestbook'],
    ['featureMaps', 'Maps'],
    ['featureQrCode', 'QR Code'],
  ]

  return (
    <form onSubmit={handleSave}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Custom Domains (comma-separated)</label>
        <input type="text" value={form.domains} onChange={e => set('domains', e.target.value)} style={fieldStyle} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Default Locale</label>
        <input type="text" value={form.defaultLocale} onChange={e => set('defaultLocale', e.target.value)} required style={fieldStyle} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Supported Locales (comma-separated)</label>
        <input type="text" value={form.locales} onChange={e => set('locales', e.target.value)} required style={fieldStyle} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={labelStyle}>New Password (leave blank to keep current)</label>
        <input type="password" value={form.dashboardPassword} onChange={e => set('dashboardPassword', e.target.value)} style={fieldStyle} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ ...labelStyle, marginBottom: 12 }}>Features</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {features.map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={e => set(key, e.target.checked)}
                style={{ accentColor: '#b08d57' }}
              />
              <span style={{ fontSize: 14, color: '#c4b89a' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ ...labelStyle, marginBottom: 4 }}>Template Visibility</p>
        <p style={{ fontSize: 12, color: '#6b6046', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", marginBottom: 16 }}>
          Uncheck templates to hide them from the couple's theme picker. All checked = all available (default).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(Object.keys(SECTION_DESIGNS) as SectionKey[]).map(sectionKey => (
            <div key={sectionKey} style={{ borderTop: '0.5px solid #2e2922', paddingTop: 12, paddingBottom: 12 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b08d57', marginBottom: 8 }}>
                {SECTION_LABELS[sectionKey] ?? sectionKey}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
                {SECTION_DESIGNS[sectionKey].map(design => (
                  <label key={design.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={design.description}>
                    <input
                      type="checkbox"
                      checked={(enabledDesigns[sectionKey] ?? []).includes(design.key)}
                      onChange={e => toggleDesign(sectionKey, design.key, e.target.checked)}
                      style={{ accentColor: '#b08d57' }}
                    />
                    <span style={{ fontSize: 13, color: '#c4b89a' }}>{design.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ fontSize: 14, fontStyle: 'italic', color: '#c4614a', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={loading}
          style={{ flex: 1, padding: 13, background: '#b08d57', color: '#1e1a16', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: '13px 20px', background: 'transparent', color: '#c4614a', border: '0.5px solid #5a2a20', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: deleting ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: deleting ? 0.5 : 1 }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </form>
  )
}
