'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'

type Location = { id: string; sort_order: number; title: string; address: string; maps_link: string; waze_link: string; embed_url: string }
type Props = { initialItems: Location[]; locale?: string }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }

const blank = { sort_order: '0', title: '', address: '', maps_link: '', waze_link: '', embed_url: '' }
type EditState = { id: string; sort_order: string; title: string; address: string; maps_link: string; waze_link: string; embed_url: string }

function LocationFields({
  values, onChange,
}: {
  values: { title: string; address: string; maps_link: string; waze_link: string; embed_url: string }
  onChange: (key: string, val: string) => void
}) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={lbl}>Nombre del lugar</div>
          <input style={field} placeholder="ej. Salón de bodas" value={values.title} onChange={e => onChange('title', e.target.value)} required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={lbl}>Dirección (para mapa integrado)</div>
          <input style={field} placeholder="ej. Av. Reforma 123, Ciudad de México" value={values.address} onChange={e => onChange('address', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={lbl}>Enlace de Google Maps</div>
          <input style={field} type="url" placeholder="https://maps.app.goo.gl/…" value={values.maps_link} onChange={e => onChange('maps_link', e.target.value)} />
        </div>
        <div>
          <div style={lbl}>Enlace de Waze</div>
          <input style={field} type="url" placeholder="https://waze.com/ul?ll=…" value={values.waze_link} onChange={e => onChange('waze_link', e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={lbl}>URL del mapa integrado (embed)</div>
        <input style={field} type="url" placeholder="https://www.google.com/maps/embed?pb=…" value={values.embed_url} onChange={e => onChange('embed_url', e.target.value)} />
        <div style={{ fontSize: 10, color: '#7a6e5f', marginTop: 3 }}>En Google Maps: Compartir → Insertar un mapa → copiar sólo el valor del atributo <em>src</em></div>
      </div>
    </>
  )
}

export default function LocationTab({ initialItems, locale }: Props) {
  const [items, setItems] = useState<Location[]>(initialItems)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [error, setError] = useState('')

  const T = (k: string) => dt(k, locale)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) }),
    })
    if (res.ok) {
      const d = await res.json()
      setItems(i => [...i, d].sort((a, b) => a.sort_order - b.sort_order))
      setForm(blank)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed')
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const res = await fetch(`/api/dashboard/location/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editing, sort_order: Number(editing.sort_order) }),
    })
    if (res.ok) {
      const d = await res.json()
      setItems(i => i.map(x => x.id === d.id ? d : x).sort((a, b) => a.sort_order - b.sort_order))
      setEditing(null)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(T('locationDeleteConfirm'))) return
    const res = await fetch(`/api/dashboard/location/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed')
  }

  async function handleMove(item: Location, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(x => x.id === item.id)
    const target = sorted[idx + dir]
    if (!target) return
    const [newA, newB] = [target.sort_order, item.sort_order]
    await Promise.all([
      fetch(`/api/dashboard/location/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, sort_order: newA }) }),
      fetch(`/api/dashboard/location/${target.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...target, sort_order: newB }) }),
    ])
    setItems(prev => prev.map(x => {
      if (x.id === item.id) return { ...x, sort_order: newA }
      if (x.id === target.id) return { ...x, sort_order: newB }
      return x
    }).sort((a, b) => a.sort_order - b.sort_order))
  }

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>{T('locationTitle')}</p>

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem', padding: '1rem', background: '#faf7f2', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 10 }}>{T('locationAddNew')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr', gap: 8, marginBottom: 8 }}>
          <div>
            <div style={lbl}>{T('locationOrder')}</div>
            <input style={field} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
          </div>
          <div style={{ display: 'none' }} />
        </div>
        <LocationFields
          values={form}
          onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))}
        />
        <button type="submit" style={btn()}>{T('add')}</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((item, idx) => editing?.id === item.id ? (
          <form key={item.id} onSubmit={handleSaveEdit} style={{ padding: '1rem', background: '#faf7f2', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr', gap: 8, marginBottom: 8 }}>
              <div>
                <div style={lbl}>{T('locationOrder')}</div>
                <input style={field} type="number" value={editing.sort_order} onChange={e => setEditing(x => x && ({ ...x, sort_order: e.target.value }))} />
              </div>
              <div style={{ display: 'none' }} />
            </div>
            <LocationFields
              values={editing}
              onChange={(k, v) => setEditing(x => x && ({ ...x, [k]: v }))}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={btn()}>{T('save')}</button>
              <button type="button" onClick={() => setEditing(null)} style={btn('#e8e0d4')}>{T('cancel')}</button>
            </div>
          </form>
        ) : (
          <div key={item.id} style={{ padding: '1rem', background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

              {item.embed_url && (
                <div style={{ flexShrink: 0, width: 140, height: 100, overflow: 'hidden', borderRadius: 2, border: '0.5px solid #e0d8c8' }}>
                  <iframe
                    src={item.embed_url}
                    width="140"
                    height="100"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={item.title}
                  />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: 4 }}>{item.title}</p>
                {item.address && <p style={{ fontSize: 13, color: '#4b4331', marginBottom: 6, lineHeight: 1.4 }}>{item.address}</p>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {item.maps_link && (
                    <a href={item.maps_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#b08d57', letterSpacing: '0.08em' }}>
                      Google Maps ↗
                    </a>
                  )}
                  {item.waze_link && (
                    <a href={item.waze_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#b08d57', letterSpacing: '0.08em' }}>
                      Waze ↗
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => setEditing({ id: item.id, sort_order: String(item.sort_order), title: item.title, address: item.address, maps_link: item.maps_link, waze_link: item.waze_link, embed_url: item.embed_url })} style={btn('#e8e0d4')}>{T('edit')}</button>
                  <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>{T('delete')}</button>
                  {idx > 0 && <button type="button" onClick={() => handleMove(item, -1)} style={btn('#e8e0d4')}>↑</button>}
                  {idx < sorted.length - 1 && <button type="button" onClick={() => handleMove(item, 1)} style={btn('#e8e0d4')}>↓</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p style={{ fontSize: 14, fontStyle: 'italic', color: '#7a6e5f' }}>{T('locationEmpty')}</p>
        )}
      </div>
    </div>
  )
}
