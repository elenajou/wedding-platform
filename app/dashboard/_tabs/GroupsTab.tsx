'use client'

import { useState } from 'react'

type Group = { id: string; name: string; allocated_seats: number; passcode: string | null; language: string | null }
type Props = { initialItems: Group[] }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '10px 10px', fontSize: 15, color: '#201d19', borderBottom: '0.5px solid #f0ebe3' }

const blank = { name: '', allocated_seats: '2', passcode: '', language: '' }

export default function GroupsTab({ initialItems }: Props) {
  const [items, setItems] = useState<Group[]>(initialItems)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<(typeof blank & { id: string }) | null>(null)
  const [error, setError] = useState('')

  function toBody(f: typeof blank) {
    return { name: f.name, allocated_seats: Number(f.allocated_seats), passcode: f.passcode || null, language: f.language || null }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(form)) })
    if (res.ok) { const d = await res.json(); setItems(i => [...i, d]); setForm(blank) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const res = await fetch(`/api/dashboard/groups/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(editing)) })
    if (res.ok) { const d = await res.json(); setItems(i => i.map(x => x.id === d.id ? d : x)); setEditing(null) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this group? Guests in this group will lose their group assignment.')) return
    const res = await fetch(`/api/dashboard/groups/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed to delete')
  }

  function editRow(item: Group) { setEditing({ id: item.id, name: item.name, allocated_seats: String(item.allocated_seats), passcode: item.passcode ?? '', language: item.language ?? '' }) }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>Invitation Groups</p>

      <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: '2rem', alignItems: 'flex-end' }}>
        {[['Group name', 'name', 'text', 'Smith Family'], ['Seats', 'allocated_seats', 'number', '2'], ['Passcode', 'passcode', 'text', 'SMITH'], ['Language', 'language', 'text', 'en']].map(([lbl, key, type, ph]) => (
          <div key={key as string}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>{lbl}</div>
            <input style={field} type={type as string} placeholder={ph as string} value={(form as any)[key as string]} onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))} required={key === 'name'} min={key === 'allocated_seats' ? 1 : undefined} />
          </div>
        ))}
        <button type="submit" style={{ ...btn(), alignSelf: 'flex-end' }}>Add</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Name</th><th style={th}>Seats</th><th style={th}>Passcode</th><th style={th}>Lang</th><th style={th}></th></tr></thead>
        <tbody>
          {items.map(item => editing?.id === item.id ? (
            <tr key={item.id}>
              {(['name', 'allocated_seats', 'passcode', 'language'] as const).map(k => (
                <td key={k} style={td}><input style={field} type={k === 'allocated_seats' ? 'number' : 'text'} value={(editing as any)[k]} onChange={e => setEditing(x => x && ({ ...x, [k]: e.target.value }))} /></td>
              ))}
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>Save</button>
                <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td style={td}>{item.name}</td>
              <td style={td}>{item.allocated_seats}</td>
              <td style={td}>{item.passcode ?? '—'}</td>
              <td style={td}>{item.language ?? '—'}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => editRow(item)} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>No groups yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
