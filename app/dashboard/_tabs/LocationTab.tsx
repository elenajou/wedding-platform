'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'
import FontPicker from '@/app/dashboard/_FontPicker'

type Location = {
  id: string; sort_order: number; title: string; address: string
  description: string; image_url: string; maps_link: string
  waze_link: string; embed_url: string; font_title: string; font_description: string
  color_title: string; color_description: string
  size_title: string; size_description: string
  spacing_title: string; spacing_description: string
  italic_title: boolean; italic_description: boolean
  bold_title: boolean; bold_description: boolean
}
type Props = { initialItems: Location[]; locale?: string }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }

type FieldValues = {
  title: string; address: string; description: string; image_url: string
  maps_link: string; waze_link: string; embed_url: string
  font_title: string; font_description: string
  color_title: string; color_description: string
  size_title: string; size_description: string
  spacing_title: string; spacing_description: string
  italic_title: boolean; italic_description: boolean
  bold_title: boolean; bold_description: boolean
}

type EditState = { id: string; sort_order: string } & FieldValues

const blank: Omit<EditState, 'id'> = {
  sort_order: '0', title: '', address: '', description: '', image_url: '',
  maps_link: '', waze_link: '', embed_url: '',
  font_title: '', font_description: '',
  color_title: '', color_description: '',
  size_title: '', size_description: '',
  spacing_title: '', spacing_description: '',
  italic_title: false, italic_description: false,
  bold_title: false, bold_description: false,
}

function LocationFields({ values, onChange }: { values: FieldValues; onChange: (key: string, val: string | boolean) => void }) {
  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <div style={lbl}>Nombre del lugar</div>
        <input style={field} placeholder="ej. Salón de bodas" value={values.title} onChange={e => onChange('title', e.target.value)} required />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={lbl}>Dirección</div>
        <input style={field} placeholder="ej. Av. Reforma 123, Ciudad de México" value={values.address} onChange={e => onChange('address', e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={lbl}>Descripción</div>
        <textarea style={{ ...field, resize: 'vertical', minHeight: 60, fontSize: 14 }} placeholder="ej. Ceremonia y recepción en el jardín" value={values.description} onChange={e => onChange('description', e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={lbl}>URL de imagen</div>
        <input style={field} type="url" placeholder="https://…/venue.jpg" value={values.image_url} onChange={e => onChange('image_url', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FontPicker
          label="Fuente — nombre del lugar"
          value={values.font_title}
          onChange={v => onChange('font_title', v)}
          color={values.color_title}
          onColorChange={v => onChange('color_title', v)}
          size={values.size_title}
          onSizeChange={v => onChange('size_title', v)}
          letterSpacing={values.spacing_title}
          onLetterSpacingChange={v => onChange('spacing_title', v)}
          italic={values.italic_title}
          onItalicChange={v => onChange('italic_title', v)}
          bold={values.bold_title}
          onBoldChange={v => onChange('bold_title', v)}
        />
        <FontPicker
          label="Fuente — descripción"
          value={values.font_description}
          onChange={v => onChange('font_description', v)}
          color={values.color_description}
          onColorChange={v => onChange('color_description', v)}
          size={values.size_description}
          onSizeChange={v => onChange('size_description', v)}
          letterSpacing={values.spacing_description}
          onLetterSpacingChange={v => onChange('spacing_description', v)}
          italic={values.italic_description}
          onItalicChange={v => onChange('italic_description', v)}
          bold={values.bold_description}
          onBoldChange={v => onChange('bold_description', v)}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={lbl}>Enlace de Waze</div>
        <input style={field} type="url" placeholder="https://waze.com/ul?ll=…" value={values.waze_link} onChange={e => onChange('waze_link', e.target.value)} />
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
  const [form, setForm] = useState<Omit<EditState, 'id'>>(blank)
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
        <LocationFields values={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
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
            <LocationFields values={editing} onChange={(k, v) => setEditing(x => x && ({ ...x, [k]: v }))} />
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
                  <iframe src={item.embed_url} width="140" height="100" style={{ border: 0, display: 'block' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={item.title} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: item.font_title ? `'${item.font_title}', serif` : "'Cormorant Garamond', serif",
                  fontSize: item.size_title || 17,
                  letterSpacing: item.spacing_title || undefined,
                  fontStyle: item.italic_title ? 'italic' : 'normal',
                  fontWeight: item.bold_title ? 700 : 300,
                  color: item.color_title || '#201d19',
                  marginBottom: 4,
                }}>{item.title}</p>
                {item.address && <p style={{ fontSize: 13, color: '#4b4331', marginBottom: 4, lineHeight: 1.4 }}>{item.address}</p>}
                {item.description && <p style={{
                  fontFamily: item.font_description ? `'${item.font_description}', serif` : undefined,
                  fontSize: item.size_description || 13,
                  letterSpacing: item.spacing_description || undefined,
                  fontStyle: item.italic_description ? 'italic' : 'normal',
                  fontWeight: item.bold_description ? 700 : 400,
                  color: item.color_description || '#7a6e5f',
                  marginBottom: 6,
                  lineHeight: 1.4,
                }}>{item.description}</p>}
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', maxWidth: 220, height: 80, objectFit: 'cover', borderRadius: 2, marginBottom: 6, border: '0.5px solid #e0d8c8' }} />
                )}
                {item.waze_link && (
                  <a href={item.waze_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 11, color: '#b08d57', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Waze ↗
                  </a>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <button
                    onClick={() => setEditing({
                      id: item.id, sort_order: String(item.sort_order),
                      title: item.title, address: item.address, description: item.description,
                      image_url: item.image_url, maps_link: item.maps_link,
                      waze_link: item.waze_link, embed_url: item.embed_url,
                      font_title: item.font_title ?? '', font_description: item.font_description ?? '',
                      color_title: item.color_title ?? '', color_description: item.color_description ?? '',
                      size_title: item.size_title ?? '', size_description: item.size_description ?? '',
                      spacing_title: item.spacing_title ?? '', spacing_description: item.spacing_description ?? '',
                      italic_title: item.italic_title ?? false, italic_description: item.italic_description ?? false,
                      bold_title: item.bold_title ?? false, bold_description: item.bold_description ?? false,
                    })}
                    style={btn('#e8e0d4')}
                  >{T('edit')}</button>
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
