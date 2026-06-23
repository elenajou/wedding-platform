'use client'

import { useState } from 'react'

type Photo = { id: string; sort_order: number; src: string; alt: string; caption: string | null }
type Props = { initialItems: Photo[] }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '9px 10px', fontSize: 14, color: '#201d19', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'middle' }

const blank = { sort_order: '0', src: '', alt: '', caption: '' }

export default function PhotosTab({ initialItems }: Props) {
  const [items, setItems] = useState<Photo[]>(initialItems)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<(typeof blank & { id: string }) | null>(null)
  const [error, setError] = useState('')

  function toBody(f: typeof blank) { return { ...f, sort_order: Number(f.sort_order), caption: f.caption || null } }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(form)) })
    if (res.ok) { const d = await res.json(); setItems(i => [...i, d].sort((a, b) => a.sort_order - b.sort_order)); setForm(blank) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const res = await fetch(`/api/dashboard/photos/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(editing)) })
    if (res.ok) { const d = await res.json(); setItems(i => i.map(x => x.id === d.id ? d : x).sort((a, b) => a.sort_order - b.sort_order)); setEditing(null) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta foto?')) return
    const res = await fetch(`/api/dashboard/photos/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed')
  }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>Galería de Fotos</p>

      <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '0.4fr 3fr 2fr 2fr auto', gap: 8, marginBottom: '2rem', alignItems: 'flex-end' }}>
        {[['#', 'sort_order', '0'], ['URL de imagen', 'src', 'https://...'], ['Texto alt', 'alt', 'Descripción de foto'], ['Pie de foto', 'caption', 'Opcional']].map(([lbl, k, ph]) => (
          <div key={k}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>{lbl}</div>
            <input style={field} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k === 'src'} />
          </div>
        ))}
        <button type="submit" style={{ ...btn(), alignSelf: 'flex-end' }}>Agregar</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>#</th><th style={th}>Vista previa</th><th style={th}>URL</th><th style={th}>Alt</th><th style={th}>Pie de foto</th><th style={th}></th></tr></thead>
        <tbody>
          {items.map(item => editing?.id === item.id ? (
            <tr key={item.id}>
              <td style={td}><input style={{ ...field, width: 50 }} value={editing.sort_order} onChange={e => setEditing(x => x && ({ ...x, sort_order: e.target.value }))} /></td>
              <td style={td} colSpan={2}><input style={field} value={editing.src} onChange={e => setEditing(x => x && ({ ...x, src: e.target.value }))} /></td>
              <td style={td}><input style={field} value={editing.alt} onChange={e => setEditing(x => x && ({ ...x, alt: e.target.value }))} /></td>
              <td style={td}><input style={field} value={editing.caption} onChange={e => setEditing(x => x && ({ ...x, caption: e.target.value }))} /></td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>Guardar</button>
                <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>Cancelar</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td style={td}>{item.sort_order}</td>
              <td style={td}>
                {item.src && <img src={item.src} alt={item.alt} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 2 }} />}
              </td>
              <td style={{ ...td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#7a6e5f' }}>{item.src}</td>
              <td style={td}>{item.alt}</td>
              <td style={{ ...td, color: '#4b4331', fontStyle: 'italic' }}>{item.caption ?? '—'}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => setEditing({ id: item.id, sort_order: String(item.sort_order), src: item.src, alt: item.alt, caption: item.caption ?? '' })} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>Editar</button>
                <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>Eliminar</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>Sin fotos aún.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
