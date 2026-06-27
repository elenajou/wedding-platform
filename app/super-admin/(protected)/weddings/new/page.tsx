'use client'

import { useState } from 'react'

export default function NewWeddingPage() {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const AVAILABLE_LOCALES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '中文' },
  ]

  const [form, setForm] = useState({
    slug: '',
    domains: '',
    defaultLocale: 'en',
    locales: ['en'] as string[],
    dashboardPassword: '',
    featureRsvp: true,
    featureCountdown: true,
    featureGallery: false,
    featureSchedule: true,
    featureFaq: true,
    featureSeatingCard: true,
    featureVideoSection: false,
    featureGuestbook: false,
    featureMaps: false,
    featureQrCode: false,
  })

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
      if (!next.includes(prev.defaultLocale)) next.push(prev.defaultLocale)
      return { ...prev, locales: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug.trim().toLowerCase(),
          domains: form.domains.split(',').map(d => d.trim()).filter(Boolean),
          defaultLocale: form.defaultLocale,
          locales: form.locales.includes(form.defaultLocale) ? form.locales : [...form.locales, form.defaultLocale],
          dashboardPassword: form.dashboardPassword,
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
        }),
      })
      if (res.ok) {
        window.location.href = '/super-admin'
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to create wedding')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #d4cbbf', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 300, color: '#201d19', outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#7a6e5f', marginBottom: 4 }
  const checkboxRow = { display: 'flex' as const, alignItems: 'center' as const, gap: 8, marginBottom: 8 }

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
    <main style={{ minHeight: '100svh', background: '#faf7f2', fontFamily: "'EB Garamond', serif", padding: '2rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <a href="/super-admin" style={{ color: '#7a6e5f', fontSize: 12, textDecoration: 'none' }}>← Back</a>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', fontWeight: 300, color: '#201d19' }}>
            New Wedding
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Slug (URL identifier)</label>
            <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="john-sarah" required style={fieldStyle} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Custom Domains (comma-separated)</label>
            <input type="text" value={form.domains} onChange={e => set('domains', e.target.value)} placeholder="johnandsarah.com" style={fieldStyle} />
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
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: 8 }}>
              {AVAILABLE_LOCALES.map(({ code, label }) => {
                const isDefault = code === form.defaultLocale
                const isChecked = form.locales.includes(code)
                return (
                  <label key={code} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: isDefault ? 'default' : 'pointer', opacity: isDefault ? 0.5 : 1 }} title={isDefault ? 'Default locale — always included' : undefined}>
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
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Couple Dashboard Password</label>
            <input type="password" value={form.dashboardPassword} onChange={e => set('dashboardPassword', e.target.value)} required style={fieldStyle} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ ...labelStyle, marginBottom: 12 }}>Features</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {features.map(([key, label]) => (
                <label key={key} style={checkboxRow}>
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

          {error && <p style={{ fontSize: 14, fontStyle: 'italic', color: '#c4614a', marginBottom: '1rem' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 13, background: '#b08d57', color: '#ffffff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Creating...' : 'Create Wedding'}
          </button>
        </form>
      </div>
    </main>
  )
}
