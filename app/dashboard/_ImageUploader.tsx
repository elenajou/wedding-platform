'use client'

import { useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (url: string) => void
  fieldKey: string
  label?: string
  aspectRatio?: string  // CSS aspect-ratio e.g. "16/9", "1/1", "4/3"
}

export default function ImageUploader({ value, onChange, fieldKey, label, aspectRatio = '16/9' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const lbl: React.CSSProperties = {
    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3,
  }

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
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <div style={{
            aspectRatio, width: '100%', overflow: 'hidden',
            border: '0.5px solid #d4cbbf', borderRadius: 2, background: '#f5f1ea',
          }}>
            <img
              src={value}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={btnStyle('#e8e0d4', uploading)}
            >
              {uploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={btnStyle('#f5ebe8', false)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%', aspectRatio, border: '0.5px dashed #c4b99e', borderRadius: 2,
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
