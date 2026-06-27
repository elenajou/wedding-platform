'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'

const LOCALE_NAMES: Record<string, string> = { en: 'English', es: 'Español', zh: '中文' }

type Item = {
  id: string
  sort_order: number
  title: string
  description: string
  image_urls: string[]
  locale_content: Record<string, { title?: string; description?: string }>
}

type Props = { initialItems: Item[]; locales?: string[]; defaultLocale?: string; locale?: string }

const field: React.CSSProperties = {
  padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf',
  fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19',
  outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box',
}
const btn = (bg = '#b08d57'): React.CSSProperties => ({
  padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19',
  border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11,
  letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1,
})
const lbl: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3,
}
const localeTag: React.CSSProperties = {
  display: 'inline-block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
  color: '#fff', background: '#b08d57', padding: '2px 6px', borderRadius: 2, marginBottom: 6,
}

type FormState = { sort_order: string; title: string; description: string; image_urls_text: string }
type EditState = { id: string } & FormState & { locale_content: Record<string, { title?: string; description?: string }> }

type FieldsProps = {
  values: FormState
  onField: (k: keyof FormState, v: string) => void
  onLocale: (lc: string, field: 'title' | 'description', v: string) => void
  localeContent: Record<string, { title?: string; description?: string }>
  defaultLocale: string
  extraLocales: string[]
}

function Fields({ values, onField, onLocale, localeContent, defaultLocale, extraLocales }: FieldsProps) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={lbl}>#</div>
          <input style={field} type="number" value={values.sort_order} onChange={e => onField('sort_order', e.target.value)} />
        </div>
        <div>
          <div style={lbl}>Título</div>
          <input style={field} placeholder="ej. Black Tie" value={values.title} onChange={e => onField('title', e.target.value)} required />
        </div>
      </div>

      <div style={{ marginBottom: 8, padding: '10px 12px', background: '#fff', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
        <div style={{ marginBottom: 6 }}>
          <span style={localeTag}>{LOCALE_NAMES[defaultLocale] ?? defaultLocale} ({defaultLocale})</span>
        </div>
        <div style={lbl}>Descripción</div>
        <textarea
          style={{ ...field, resize: 'vertical', minHeight: 70 }}
          placeholder="ej. Vestimenta formal de etiqueta para hombres y mujeres."
          value={values.description}
          onChange={e => onField('description', e.target.value)}
        />
      </div>

      {extraLocales.map(xl => (
        <div key={xl} style={{ marginBottom: 8, padding: '10px 12px', background: '#fff', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={localeTag}>{LOCALE_NAMES[xl] ?? xl} ({xl})</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={lbl}>Título</div>
            <input
              style={field}
              placeholder="ej. Black Tie"
              value={localeContent[xl]?.title ?? ''}
              onChange={e => onLocale(xl, 'title', e.target.value)}
            />
          </div>
          <div style={lbl}>Descripción</div>
          <textarea
            style={{ ...field, resize: 'vertical', minHeight: 70 }}
            value={localeContent[xl]?.description ?? ''}
            onChange={e => onLocale(xl, 'description', e.target.value)}
          />
        </div>
      ))}

      <div style={{ marginBottom: 10 }}>
        <div style={lbl}>URLs de imágenes (una por línea)</div>
        <textarea
          style={{ ...field, resize: 'vertical', minHeight: 70, fontSize: 13 }}
          placeholder={'https://…/image1.jpg\nhttps://…/image2.jpg'}
          value={values.image_urls_text}
          onChange={e => onField('image_urls_text', e.target.value)}
        />
      </div>
    </>
  )
}

function urlsToText(urls: string[]): string {
  return (urls ?? []).join('\n')
}
function textToUrls(text: string): string[] {
  return text.split('\n').map(u => u.trim()).filter(Boolean)
}

const blank: FormState = { sort_order: '0', title: '', description: '', image_urls_text: '' }

export default function DressCodeTab({ initialItems, locales = ['en'], defaultLocale = 'en', locale }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [form, setForm] = useState<FormState>(blank)
  const [formLocales, setFormLocales] = useState<Record<string, { title?: string; description?: string }>>({})
  const [editing, setEditing] = useState<EditState | null>(null)
  const [error, setError] = useState('')

  const T = (k: string) => dt(k, locale)
  const extraLocales = locales.filter(l => l !== defaultLocale)

  function setFormLc(lc: string, field: 'title' | 'description', val: string) {
    setFormLocales(prev => ({ ...prev, [lc]: { ...prev[lc], [field]: val } }))
  }
  function setEditLc(lc: string, field: 'title' | 'description', val: string) {
    setEditing(e => e ? { ...e, locale_content: { ...e.locale_content, [lc]: { ...e.locale_content[lc], [field]: val } } } : e)
  }

  function toBody(f: FormState, lc: Record<string, { title?: string; description?: string }>) {
    return {
      sort_order: Number(f.sort_order),
      title: f.title,
      description: f.description,
      image_urls: textToUrls(f.image_urls_text),
      locale_content: lc,
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/dress-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toBody(form, formLocales)),
    })
    if (res.ok) {
      const d = await res.json()
      setItems(i => [...i, d].sort((a, b) => a.sort_order - b.sort_order))
      setForm(blank)
      setFormLocales({})
    } else {
      const d = await res.json(); setError(d.error ?? 'Failed')
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const body = toBody(editing, editing.locale_content)
    const res = await fetch(`/api/dashboard/dress-code/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const d = await res.json()
      setItems(i => i.map(x => x.id === d.id ? d : x).sort((a, b) => a.sort_order - b.sort_order))
      setEditing(null)
    } else {
      const d = await res.json(); setError(d.error ?? 'Failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta entrada de dress code?')) return
    const res = await fetch(`/api/dashboard/dress-code/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed')
  }

  async function handleMove(item: Item, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(x => x.id === item.id)
    const target = sorted[idx + dir]
    if (!target) return
    const [newA, newB] = [target.sort_order, item.sort_order]
    await Promise.all([
      fetch(`/api/dashboard/dress-code/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, sort_order: newA }) }),
      fetch(`/api/dashboard/dress-code/${target.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...target, sort_order: newB }) }),
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
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>
        {T('dressCodeTitle')}
      </p>

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem', padding: '1rem', background: '#faf7f2', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 10 }}>
          Agregar entrada
        </p>
        <Fields
          values={form}
          onField={(k, v) => setForm(f => ({ ...f, [k]: v }))}
          onLocale={(lc, field, v) => setFormLc(lc, field, v)}
          localeContent={formLocales}
          defaultLocale={defaultLocale}
          extraLocales={extraLocales}
        />
        <button type="submit" style={btn()}>+ Agregar</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((item, idx) => editing?.id === item.id ? (
          <form key={item.id} onSubmit={handleSaveEdit} style={{ padding: '1rem', background: '#faf7f2', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
            <Fields
              values={editing}
              onField={(k, v) => setEditing(x => x ? { ...x, [k]: v } : x)}
              onLocale={(lc, field, v) => setEditLc(lc, field, v)}
              localeContent={editing.locale_content}
              defaultLocale={defaultLocale}
              extraLocales={extraLocales}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={btn()}>Guardar</button>
              <button type="button" onClick={() => setEditing(null)} style={btn('#e8e0d4')}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div key={item.id} style={{ padding: '1rem', background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {item.image_urls?.[0] && (
                <img
                  src={item.image_urls[0]}
                  alt={item.title}
                  style={{ flexShrink: 0, width: 90, height: 90, objectFit: 'cover', borderRadius: 2, border: '0.5px solid #e0d8c8' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: 4 }}>{item.title}</p>
                {item.description && <p style={{ fontSize: 13, color: '#4b4331', lineHeight: 1.5, marginBottom: 4 }}>{item.description}</p>}
                {extraLocales.map(lc => {
                  const lct = item.locale_content?.[lc]
                  return (lct?.title || lct?.description) ? (
                    <div key={lc} style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b08d57', marginRight: 5 }}>{lc}</span>
                      {lct?.title && <span style={{ fontSize: 13, color: '#4b4331', fontStyle: 'italic', marginRight: 6 }}>{lct.title}</span>}
                      {lct?.description && <span style={{ fontSize: 12, color: '#7a6e5f', lineHeight: 1.5 }}>{lct.description}</span>}
                    </div>
                  ) : null
                })}
                {item.image_urls?.length > 1 && (
                  <p style={{ fontSize: 11, color: '#9a9080', marginTop: 4 }}>{item.image_urls.length} imágenes</p>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <button
                    onClick={() => setEditing({
                      id: item.id,
                      sort_order: String(item.sort_order),
                      title: item.title,
                      description: item.description,
                      image_urls_text: urlsToText(item.image_urls ?? []),
                      locale_content: item.locale_content ?? {},
                    })}
                    style={btn('#e8e0d4')}
                  >Editar</button>
                  <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>Eliminar</button>
                  {idx > 0 && <button type="button" onClick={() => handleMove(item, -1)} style={btn('#e8e0d4')}>↑</button>}
                  {idx < sorted.length - 1 && <button type="button" onClick={() => handleMove(item, 1)} style={btn('#e8e0d4')}>↓</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p style={{ fontSize: 14, fontStyle: 'italic', color: '#7a6e5f' }}>Sin entradas aún.</p>
        )}
      </div>
    </div>
  )
}
