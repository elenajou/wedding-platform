'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WeddingConfig } from '@/lib/tenant'
import { SECTION_DESIGNS, type SectionKey } from '@/themes/section-designs'

type Props = { config: WeddingConfig }

const SECTION_LABELS: Record<string, string> = {
  envelope: 'Envelope Gate', hero: 'Hero', countdown: 'Countdown', seating: 'Seating Card',
  rsvp: 'RSVP Form', schedule: 'Day Schedule', video: 'Video', gallery: 'Gallery', faq: 'FAQ', location: 'Location',
}

export default function EditWeddingForm({ config }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const AVAILABLE_LOCALES: { code: string; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '中文' },
  ]

  const [form, setForm] = useState({
    domains: config.domains.join(', '),
    defaultLocale: config.defaultLocale,
    locales: config.locales as string[],
    dashboardLocale: config.dashboardLocale ?? 'es',
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
    featureDressCode: config.features.dressCode,
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

  function setDefaultLocale(code: string) {
    setForm(prev => ({
      ...prev,
      defaultLocale: code,
      locales: prev.locales.includes(code) ? prev.locales : [...prev.locales, code],
    }))
  }

  function toggleLocale(code: string, checked: boolean) {
    setForm(prev => {
      const next = checked
        ? [...prev.locales, code]
        : prev.locales.filter(l => l !== code)
      // Always keep defaultLocale in the list
      if (!next.includes(prev.defaultLocale)) next.push(prev.defaultLocale)
      return { ...prev, locales: next }
    })
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
        locales: form.locales.includes(form.defaultLocale) ? form.locales : [...form.locales, form.defaultLocale],
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
          dressCode: form.featureDressCode,
        },
        enabledDesigns: enabledDesignsBody,
        dashboardLocale: form.dashboardLocale,
      }
      if (form.dashboardPassword) body.dashboardPassword = form.dashboardPassword

      const res = await fetch(`/api/super-admin/weddings/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        // Sync locales back from DB so the checkboxes immediately reflect what was saved
        const savedLocales: string[] = Array.isArray(data.locales)
          ? data.locales
          : typeof data.locales === 'string' && data.locales.startsWith('{')
            ? data.locales.replace(/^{|}$/g, '').split(',').filter(Boolean)
            : []
        if (savedLocales.length > 0) {
          setForm(prev => ({ ...prev, locales: savedLocales }))
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      } else {
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

  const fieldStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #d4cbbf', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 300, color: '#201d19', outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#7a6e5f', marginBottom: 4 }

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
    ['featureDressCode', 'Dress Code'],
  ]

  return (
    <form onSubmit={handleSave}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Custom Domains (comma-separated)</label>
        <input type="text" value={form.domains} onChange={e => set('domains', e.target.value)} style={fieldStyle} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Default Locale</label>
        <select value={form.defaultLocale} onChange={e => setDefaultLocale(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
          {AVAILABLE_LOCALES.map(({ code, label }) => (
            <option key={code} value={code}>{label} ({code})</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={labelStyle}>Supported Locales</p>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: 8, marginBottom: 6 }}>
          {AVAILABLE_LOCALES.map(({ code, label }) => {
            const isDefault = code === form.defaultLocale
            const isChecked = form.locales.includes(code)
            return (
              <label key={code} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: isDefault ? 'default' : 'pointer', opacity: isDefault ? 0.45 : 1 }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDefault}
                  onChange={e => toggleLocale(code, e.target.checked)}
                  style={{ accentColor: '#b08d57' }}
                />
                <span style={{ fontSize: 14, color: '#4b4331' }}>{label} <span style={{ fontSize: 11, color: '#7a6e5f' }}>({code})</span></span>
              </label>
            )
          })}
        </div>
        <p style={{ fontSize: 11, color: '#7a6e5f', fontStyle: 'italic', fontFamily: "'EB Garamond', serif" }}>
          The default locale is always required. Change "Default Locale" above first if you want to uncheck it.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={labelStyle}>Dashboard Language</label>
        <select value={form.dashboardLocale} onChange={e => set('dashboardLocale', e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
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
              <span style={{ fontSize: 14, color: '#4b4331' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ ...labelStyle, marginBottom: 4 }}>Template Visibility</p>
        <p style={{ fontSize: 12, color: '#7a6e5f', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", marginBottom: 16 }}>
          Uncheck templates to hide them from the couple's theme picker. All checked = all available (default).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(Object.keys(SECTION_DESIGNS) as SectionKey[]).map(sectionKey => (
            <div key={sectionKey} style={{ borderTop: '0.5px solid #e8e0d0', paddingTop: 12, paddingBottom: 12 }}>
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
                    <span style={{ fontSize: 13, color: '#4b4331' }}>{design.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ fontSize: 14, fontStyle: 'italic', color: '#c4614a', marginBottom: '1rem' }}>{error}</p>}
      {saved && <p style={{ fontSize: 14, fontStyle: 'italic', color: '#6b9a6e', marginBottom: '1rem' }}>Changes saved.</p>}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={loading}
          style={{ flex: 1, padding: 13, background: saved ? '#4a7a4e' : '#b08d57', color: '#ffffff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: loading ? 0.5 : 1, transition: 'background 0.3s' }}
        >
          {loading ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: '13px 20px', background: 'transparent', color: '#c4614a', border: '0.5px solid #e0c0b8', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: deleting ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: deleting ? 0.5 : 1 }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </form>
  )
}
