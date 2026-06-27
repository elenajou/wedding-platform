'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (url: string) => void
  fieldKey: string
  label?: string
  opacity?: number
  onOpacityChange?: (v: number) => void
  contrast?: number
  onContrastChange?: (v: number) => void
  bgColor?: string
  onBgColorChange?: (v: string) => void
}

const lbl: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3,
}
const sliderLbl: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9080',
  fontFamily: "'EB Garamond', serif", whiteSpace: 'nowrap',
}

export default function ImageUploader({
  value, onChange, fieldKey, label,
  opacity, onOpacityChange,
  contrast, onContrastChange,
  bgColor, onBgColorChange,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Local draft state so sliders update the preview immediately without waiting for parent re-render
  const [localOpacity, setLocalOpacity] = useState(opacity ?? 1)
  const [localContrast, setLocalContrast] = useState(contrast ?? 100)
  const [localBgColor, setLocalBgColor] = useState(bgColor ?? '')

  useEffect(() => { setLocalOpacity(opacity ?? 1) }, [opacity])
  useEffect(() => { setLocalContrast(contrast ?? 100) }, [contrast])
  useEffect(() => { setLocalBgColor(bgColor ?? '') }, [bgColor])

  const hasControls = value && (onOpacityChange || onContrastChange || onBgColorChange)

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('fieldKey', fieldKey)
      const res = await fetch('/api/dashboard/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleClear() {
    onChange('')
    await fetch('/api/dashboard/upload-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldKey }),
    })
  }

  return (
    <div>
      {label && <div style={lbl}>{label}</div>}

      {value ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* Thumbnail */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 115, height: 115, overflow: 'hidden',
              border: '0.5px solid #d4cbbf', borderRadius: 2,
              background: localBgColor || '#f5f1ea',
              position: 'relative',
            }}>
              <img
                src={value}
                alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: onContrastChange ? `contrast(${localContrast}%)` : undefined,
                }}
              />
              {onOpacityChange && localOpacity > 0 && (
                <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${localOpacity})`, pointerEvents: 'none' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
              <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} style={btnStyle('#e8e0d4', uploading)}>
                {uploading ? 'Uploading…' : 'Replace'}
              </button>
              <button type="button" onClick={handleClear} style={btnStyle('#f5ebe8', false)}>
                Remove
              </button>
            </div>
          </div>

          {/* Controls */}
          {hasControls && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, paddingTop: 2 }}>
              {onOpacityChange && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={sliderLbl}>Overlay</span>
                    <span style={{ ...sliderLbl, color: '#7a6e5f' }}>{Math.round(localOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={localOpacity}
                    onChange={e => { const v = parseFloat(e.target.value); setLocalOpacity(v); onOpacityChange(v) }}
                    style={{ width: '100%', accentColor: '#b08d57' }}
                  />
                </div>
              )}
              {onContrastChange && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={sliderLbl}>Contrast</span>
                    <span style={{ ...sliderLbl, color: '#7a6e5f' }}>{localContrast}%</span>
                  </div>
                  <input
                    type="range" min={50} max={200} step={1}
                    value={localContrast}
                    onChange={e => { const v = parseInt(e.target.value); setLocalContrast(v); onContrastChange(v) }}
                    style={{ width: '100%', accentColor: '#b08d57' }}
                  />
                </div>
              )}
              {onBgColorChange && (
                <div>
                  <div style={{ marginBottom: 4 }}><span style={sliderLbl}>Background color</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <input
                      type="color"
                      value={localBgColor || '#ffffff'}
                      onChange={e => { setLocalBgColor(e.target.value); onBgColorChange(e.target.value) }}
                      style={{ width: 26, height: 26, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 2, padding: 2, background: 'none' }}
                    />
                    <span style={{ fontSize: 12, fontFamily: "'EB Garamond', serif", color: '#7a6e5f' }}>
                      {localBgColor || 'none'}
                    </span>
                    {localBgColor && (
                      <button onClick={() => { setLocalBgColor(''); onBgColorChange('') }} style={{ fontSize: 11, color: '#9a9080', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'EB Garamond', serif", textDecoration: 'underline' }}>
                        clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: 115, height: 115, border: '0.5px dashed #c4b99e', borderRadius: 2,
            background: '#faf7f2', cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, color: '#9a9080', fontFamily: "'EB Garamond', serif",
          }}
        >
          {uploading ? (
            <span style={{ fontSize: 13, fontStyle: 'italic' }}>Uploading…</span>
          ) : (
            <>
              <span style={{ fontSize: 22, opacity: 0.4 }}>↑</span>
              <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Upload image</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p style={{ fontSize: 11, color: '#c4614a', fontStyle: 'italic', fontFamily: "'EB Garamond', serif", marginTop: 4 }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

function btnStyle(bg: string, disabled: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', background: bg, color: '#201d19', border: 'none',
    fontFamily: "'EB Garamond', serif", fontSize: 10, letterSpacing: '0.18em',
    textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 1, opacity: disabled ? 0.6 : 1,
  }
}
