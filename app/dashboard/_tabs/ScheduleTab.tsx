'use client'

import { useState } from 'react'

type Event = { id: string; sort_order: number; time_label: string; iso_time: string; event_name: string; description: string | null }
type Props = { initialItems: Event[] }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '9px 10px', fontSize: 14, color: '#201d19', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'top' }

const blank = { time_label: '', iso_time: '', event_name: '', description: '', sort_order: '0' }

export default function ScheduleTab({ initialItems }: Props) {
  const [items, setItems] = useState<Event[]>(initialItems)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<(typeof blank & { id: string }) | null>(null)
  const [error, setError] = useState('')

  function toBody(f: typeof blank) { return { ...f, sort_order: Number(f.sort_order), description: f.description || null } }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(form)) })
    if (res.ok) { const d = await res.json(); setItems(i => [...i, d].sort((a, b) => a.sort_order - b.sort_order)); setForm(blank) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const res = await fetch(`/api/dashboard/schedule/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(editing)) })
    if (res.ok) { const d = await res.json(); setItems(i => i.map(x => x.id === d.id ? d : x).sort((a, b) => a.sort_order - b.sort_order)); setEditing(null) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/dashboard/schedule/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed')
  }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>Schedule</p>

      <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr 2fr auto', gap: 8, marginBottom: '2rem', alignItems: 'flex-end' }}>
        {[['Order', 'sort_order', '0'], ['Time', 'time_label', '4:00 PM'], ['ISO time', 'iso_time', '2025-12-01T16:00'], ['Event name', 'event_name', 'Ceremony']].map(([lbl, k, ph]) => (
          <div key={k}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>{lbl}</div>
            <input style={field} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k !== 'sort_order'} />
          </div>
        ))}
        <button type="submit" style={{ ...btn(), alignSelf: 'flex-end' }}>Add</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>#</th><th style={th}>Time</th><th style={th}>Event</th><th style={th}>Description</th><th style={th}></th></tr></thead>
        <tbody>
          {items.map(item => editing?.id === item.id ? (
            <tr key={item.id}>
              <td style={td}><input style={{ ...field, width: 50 }} value={editing.sort_order} onChange={e => setEditing(x => x && ({ ...x, sort_order: e.target.value }))} /></td>
              <td style={td}><input style={field} value={editing.time_label} onChange={e => setEditing(x => x && ({ ...x, time_label: e.target.value }))} /></td>
              <td style={td}><input style={field} value={editing.event_name} onChange={e => setEditing(x => x && ({ ...x, event_name: e.target.value }))} /></td>
              <td style={td}><input style={field} value={editing.description} onChange={e => setEditing(x => x && ({ ...x, description: e.target.value }))} /></td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>Save</button>
                <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td style={td}>{item.sort_order}</td>
              <td style={td}>{item.time_label}</td>
              <td style={td}>{item.event_name}</td>
              <td style={{ ...td, color: '#4b4331' }}>{item.description ?? '—'}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => setEditing({ id: item.id, sort_order: String(item.sort_order), time_label: item.time_label, iso_time: item.iso_time, event_name: item.event_name, description: item.description ?? '' })} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>No events yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
