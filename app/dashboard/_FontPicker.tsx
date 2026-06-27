'use client'

import { useEffect, useRef, useState } from 'react'
import { WEDDING_FONTS, FONT_CATEGORIES, buildGoogleFontsUrl } from '@/lib/google-fonts'

type Props = {
  value: string
  onChange: (family: string) => void
  color?: string
  onColorChange?: (color: string) => void
  size?: string
  onSizeChange?: (size: string) => void
  letterSpacing?: string
  onLetterSpacingChange?: (ls: string) => void
  italic?: boolean
  onItalicChange?: (italic: boolean) => void
  bold?: boolean
  onBoldChange?: (bold: boolean) => void
  label?: string
}

const ALL_FONTS_URL = buildGoogleFontsUrl(WEDDING_FONTS.map(f => f.family))

const lbl: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3,
}

function Stepper({ value, onChange, step, unit, placeholder, width = 28 }: {
  value: string; onChange: (v: string) => void
  step: number; unit: string; placeholder: string; width?: number
}) {
  const numStr = value.match(/^(-?[\d.]+)/)?.[1] ?? ''
  function nudge(dir: 1 | -1) {
    const num = numStr ? parseFloat(numStr) : 0
    const next = Math.round((num + dir * step) * 10000) / 10000
    onChange(`${next}${unit}`)
  }
  const arrowBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080',
    fontSize: 9, padding: '0 3px', height: 24, lineHeight: 1, flexShrink: 0,
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid #d4cbbf', borderRadius: 1, overflow: 'hidden', height: 24 }}>
      <button type="button" onClick={() => nudge(-1)} style={arrowBtn}>−</button>
      <input
        style={{ padding: '0 1px', background: '#fff', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, color: '#201d19', outline: 'none', width, textAlign: 'center', height: 24, boxSizing: 'border-box' }}
        value={numStr}
        onChange={e => onChange(e.target.value ? `${e.target.value}${unit}` : '')}
        placeholder={placeholder}
      />
      <button type="button" onClick={() => nudge(1)} style={arrowBtn}>+</button>
    </div>
  )
}

function ToggleBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        height: 24, padding: '0 7px', border: '0.5px solid #d4cbbf', borderRadius: 1,
        background: active ? '#b08d57' : '#fff', color: active ? '#fff' : '#201d19',
        cursor: 'pointer', fontFamily: "'EB Garamond', serif", fontSize: 12, lineHeight: '24px',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

export default function FontPicker({ value, onChange, color, onColorChange, size, onSizeChange, letterSpacing, onLetterSpacingChange, italic, onItalicChange, bold, onBoldChange, label }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = 'gf-all-wedding-fonts'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = ALL_FONTS_URL
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 300 }}>
      {label && <div style={lbl}>{label}</div>}

      {/* Single row: font selector + all controls */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', flex: 1, boxSizing: 'border-box',
            padding: '4px 7px', background: '#fff', border: '0.5px solid #d4cbbf',
            fontFamily: value ? `'${value}', serif` : "'EB Garamond', serif",
            fontSize: 14, color: '#201d19', outline: 'none', borderRadius: 1, cursor: 'pointer',
            textAlign: 'left', minWidth: 0, height: 24,
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '— Default —'}</span>
          <span style={{ fontSize: 9, opacity: 0.45, marginLeft: 4, fontFamily: "'EB Garamond', serif", flexShrink: 0 }}>▾</span>
        </button>
        {onColorChange !== undefined && (
          <input
            type="color"
            value={color || '#201d19'}
            onChange={e => onColorChange(e.target.value)}
            style={{ width: 24, height: 24, cursor: 'pointer', border: '0.5px solid #d4cbbf', borderRadius: 1, padding: 2, background: 'none', flexShrink: 0 }}
            title="Font color"
          />
        )}
        {onSizeChange && (
          <Stepper value={size ?? ''} onChange={onSizeChange} step={1} unit="px" placeholder="sz" />
        )}
        {onLetterSpacingChange && (
          <Stepper value={letterSpacing ?? ''} onChange={onLetterSpacingChange} step={0.01} unit="em" placeholder="ls" width={32} />
        )}
        {onItalicChange && (
          <ToggleBtn active={!!italic} onClick={() => onItalicChange(!italic)} title="Italic">
            <em>I</em>
          </ToggleBtn>
        )}
        {onBoldChange && (
          <ToggleBtn active={!!bold} onClick={() => onBoldChange(!bold)} title="Bold">
            <strong>B</strong>
          </ToggleBtn>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: '0.5px solid #d4cbbf', borderTop: 'none',
          borderRadius: '0 0 2px 2px', maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 6px 16px rgba(0,0,0,0.09)',
        }}>
          <div
            onClick={() => { onChange(''); setOpen(false) }}
            style={{
              padding: '7px 10px', cursor: 'pointer', fontSize: 13,
              fontFamily: "'EB Garamond', serif", color: '#7a6e5f',
              background: !value ? '#faf7f2' : '#fff',
              borderBottom: '0.5px solid #f0ebe0',
            }}
          >
            — Default —
          </div>

          {FONT_CATEGORIES.map(cat => (
            <div key={cat}>
              <div style={{
                padding: '4px 10px', fontSize: 9, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#b08d57',
                fontFamily: "'EB Garamond', serif", background: '#fdfaf5',
                borderBottom: '0.5px solid #f0ebe0', borderTop: '0.5px solid #f0ebe0',
              }}>
                {cat}
              </div>
              {WEDDING_FONTS.filter(f => f.category === cat).map(f => (
                <div
                  key={f.family}
                  onClick={() => { onChange(f.family); setOpen(false) }}
                  style={{
                    padding: '7px 10px', cursor: 'pointer',
                    fontFamily: `'${f.family}', serif`, fontSize: 15,
                    color: f.family === value ? '#b08d57' : '#201d19',
                    background: f.family === value ? '#faf7f2' : '#fff',
                    borderBottom: '0.5px solid #f8f4ee',
                  }}
                >
                  {f.family}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
