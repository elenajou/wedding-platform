'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'

const LOCALE_NAMES: Record<string, string> = { en: 'English', es: 'Español', zh: '中文' }

type Event = { id: string; sort_order: number; time_label: string; iso_time: string; event_name: string; description: string | null; locale_content?: Record<string, any> }
type Props = { initialItems: Event[]; locales?: string[]; defaultLocale?: string; locale?: string }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '9px 10px', fontSize: 14, color: '#201d19', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'top' }
const localeTag: React.CSSProperties = { display: 'inline-block', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', background: '#b08d57', padding: '2px 6px', borderRadius: 2, marginBottom: 6 }
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }

const blank = { time_label: '', iso_time: '', event_name: '', description: '', sort_order: '0' }
const blankLocales = () => ({} as Record<string, any>)

type EditState = { id: string; sort_order: string; time_label: string; iso_time: string; event_name: string; description: string; locale_content: Record<string, any> }

export default function ScheduleTab({ initialItems, locales = ['en'], defaultLocale = 'en', locale }: Props) {
  const [items, setItems] = useState<Event[]>(initialItems)
  const [form, setForm] = useState(blank)
  const [formLocales, setFormLocales] = useState<Record<string, any>>(blankLocales())
  const [editing, setEditing] = useState<EditState | null>(null)
  const [error, setError] = useState('')

  const T = (k: string) => dt(k, locale)
  const extraLocales = locales.filter(l => l !== defaultLocale)

  function setFormLc(lc: string, key: string, val: string) {
    setFormLocales(prev => ({ ...prev, [lc]: { ...(prev[lc] ?? {}), [key]: val } }))
  }
  function setEditLc(lc: string, key: string, val: string) {
    setEditing(e => e ? { ...e, locale_content: { ...e.locale_content, [lc]: { ...(e.locale_content[lc] ?? {}), [key]: val } } } : e)
  }

  function toBody(f: typeof blank, lc: Record<string, any>) {
    return { ...f, sort_order: Number(f.sort_order), description: f.description || null, locale_content: lc }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(form, formLocales)) })
    if (res.ok) { const d = await res.json(); setItems(i => [...i, d].sort((a, b) => a.sort_order - b.sort_order)); setForm(blank); setFormLocales(blankLocales()) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const body = { sort_order: Number(editing.sort_order), time_label: editing.time_label, iso_time: editing.iso_time, event_name: editing.event_name, description: editing.description || null, locale_content: editing.locale_content }
    const res = await fetch(`/api/dashboard/schedule/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { const d = await res.json(); setItems(i => i.map(x => x.id === d.id ? d : x).sort((a, b) => a.sort_order - b.sort_order)); setEditing(null) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleDelete(id: string) {
    if (!confirm(T('scheduleDeleteConfirm'))) return
    const res = await fetch(`/api/dashboard/schedule/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed')
  }

  const hasMultiLocale = locales.length > 1

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>{T('scheduleTitle')}</p>

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem', padding: '1rem', background: '#faf7f2', border: '0.5px solid #e0d8c8', borderRadius: 2 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 10 }}>
          {T('scheduleOrder')} / {T('scheduleTime')} / {T('scheduleIsoTime')}
        </p>

        {/* Timing fields — locale-independent */}
        <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          {([[T('scheduleOrder'), 'sort_order', '0'], [T('scheduleTime'), 'time_label', '4:00 PM'], [T('scheduleIsoTime'), 'iso_time', '2025-12-01T16:00']] as [string, string, string][]).map(([label, k, ph]) => (
            <div key={k}>
              <div style={lbl}>{label}</div>
              <input style={field} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k !== 'sort_order'} />
            </div>
          ))}
        </div>

        {/* Default locale card */}
        <div style={{ marginBottom: 10, padding: '10px 12px', background: '#fff', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
          {hasMultiLocale && <div style={{ marginBottom: 8 }}><span style={localeTag}>{LOCALE_NAMES[defaultLocale] ?? defaultLocale} ({defaultLocale})</span></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={lbl}>{T('scheduleEventName')}</div>
              <input style={field} placeholder={T('scheduleEventPh')} value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} required />
            </div>
            <div>
              <div style={lbl}>{T('scheduleDescription')}</div>
              <input style={field} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Extra locale cards */}
        {extraLocales.map(xl => (
          <div key={xl} style={{ marginBottom: 10, padding: '10px 12px', background: '#fff', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
            <div style={{ marginBottom: 8 }}><span style={localeTag}>{LOCALE_NAMES[xl] ?? xl} ({xl})</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={lbl}>{T('scheduleEventName')}</div>
                <input style={field} value={formLocales[xl]?.event_name ?? ''} onChange={e => setFormLc(xl, 'event_name', e.target.value)} />
              </div>
              <div>
                <div style={lbl}>{T('scheduleDescription')}</div>
                <input style={field} value={formLocales[xl]?.description ?? ''} onChange={e => setFormLc(xl, 'description', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <button type="submit" style={btn()}>{T('add')}</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>{T('scheduleTime')}</th>
            <th style={th}>{T('scheduleEvent')}</th>
            <th style={th}>{T('scheduleDescription')}</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => editing?.id === item.id ? (
            <tr key={item.id}>
              <td style={td}><input style={{ ...field, width: 50 }} value={editing.sort_order} onChange={e => setEditing(x => x && ({ ...x, sort_order: e.target.value }))} /></td>
              <td style={td}>
                <input style={{ ...field, marginBottom: 4 }} value={editing.time_label} onChange={e => setEditing(x => x && ({ ...x, time_label: e.target.value }))} />
                <input style={field} value={editing.iso_time} onChange={e => setEditing(x => x && ({ ...x, iso_time: e.target.value }))} placeholder="ISO" />
              </td>
              <td style={td} colSpan={2}>
                {/* Default locale edit */}
                <div style={{ marginBottom: 8, padding: '8px 10px', background: '#faf7f2', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
                  {hasMultiLocale && <div style={{ marginBottom: 6 }}><span style={localeTag}>{LOCALE_NAMES[defaultLocale] ?? defaultLocale} ({defaultLocale})</span></div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input style={field} value={editing.event_name} onChange={e => setEditing(x => x && ({ ...x, event_name: e.target.value }))} />
                    <input style={field} value={editing.description} onChange={e => setEditing(x => x && ({ ...x, description: e.target.value }))} />
                  </div>
                </div>
                {/* Extra locale edit */}
                {extraLocales.map(xl => (
                  <div key={xl} style={{ marginBottom: 8, padding: '8px 10px', background: '#faf7f2', border: '0.5px solid #e8e0d4', borderRadius: 2 }}>
                    <div style={{ marginBottom: 6 }}><span style={localeTag}>{LOCALE_NAMES[xl] ?? xl} ({xl})</span></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input style={field} value={editing.locale_content[xl]?.event_name ?? ''} onChange={e => setEditLc(xl, 'event_name', e.target.value)} />
                      <input style={field} value={editing.locale_content[xl]?.description ?? ''} onChange={e => setEditLc(xl, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>{T('save')}</button>
                <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>{T('cancel')}</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td style={td}>{item.sort_order}</td>
              <td style={td}>{item.time_label}</td>
              <td style={td}>
                {item.event_name}
                {extraLocales.map(l => item.locale_content?.[l]?.event_name ? (
                  <div key={l} style={{ fontSize: 12, color: '#7a6e5f', marginTop: 2 }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b08d57', marginRight: 4 }}>{l}</span>
                    {item.locale_content[l].event_name}
                  </div>
                ) : null)}
              </td>
              <td style={{ ...td, color: '#4b4331' }}>
                {item.description ?? '—'}
                {extraLocales.map(l => item.locale_content?.[l]?.description ? (
                  <div key={l} style={{ fontSize: 12, color: '#7a6e5f', marginTop: 2 }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b08d57', marginRight: 4 }}>{l}</span>
                    {item.locale_content[l].description}
                  </div>
                ) : null)}
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => setEditing({ id: item.id, sort_order: String(item.sort_order), time_label: item.time_label, iso_time: item.iso_time, event_name: item.event_name, description: item.description ?? '', locale_content: item.locale_content ?? {} })} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>{T('edit')}</button>
                <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>{T('delete')}</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>{T('scheduleEmpty')}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
