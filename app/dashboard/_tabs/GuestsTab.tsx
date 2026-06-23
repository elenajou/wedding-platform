'use client'

import { useState } from 'react'

type Guest = { id: string; name: string; phone: string | null; email: string | null; group_id: string | null; group_name: string | null; table_name: string | null; language: string | null }
type Group = { id: string; name: string }
type Props = { initialItems: Guest[]; groups: Group[] }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '9px 10px', fontSize: 14, color: '#201d19', borderBottom: '0.5px solid #f0ebe3' }

const blank = { name: '', phone: '', email: '', group_id: '', table_name: '', language: '' }

export default function GuestsTab({ initialItems, groups }: Props) {
  const [items, setItems] = useState<Guest[]>(initialItems)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<(typeof blank & { id: string }) | null>(null)
  const [error, setError] = useState('')

  function toBody(f: typeof blank) {
    return { name: f.name, phone: f.phone || null, email: f.email || null, group_id: f.group_id || null, table_name: f.table_name || null, language: f.language || null }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/guests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(form)) })
    if (res.ok) { const d = await res.json(); setItems(i => [...i, d]); setForm(blank) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const res = await fetch(`/api/dashboard/guests/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(editing)) })
    if (res.ok) { const d = await res.json(); setItems(i => i.map(x => x.id === d.id ? d : x)); setEditing(null) }
    else { const d = await res.json(); setError(d.error ?? 'Failed') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este invitado?')) return
    const res = await fetch(`/api/dashboard/guests/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed to delete')
  }

  function groupSelect(value: string, onChange: (v: string) => void) {
    return (
      <select style={{ ...field, cursor: 'pointer' }} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Sin grupo</option>
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
    )
  }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>Invitados</p>

      <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr auto', gap: 8, marginBottom: '2rem', alignItems: 'flex-end' }}>
        {[['Nombre', 'name', 'Juan García'], ['Teléfono', 'phone', '+52 55 0000'], ['Email', 'email', ''], ['Mesa', 'table_name', 'Mesa 1'], ['Idioma', 'language', 'es']].map(([lbl, k, ph]) => (
          <div key={k}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>{lbl}</div>
            <input style={field} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k === 'name'} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>Grupo</div>
          {groupSelect(form.group_id, v => setForm(f => ({ ...f, group_id: v })))}
        </div>
        <button type="submit" style={{ ...btn(), alignSelf: 'flex-end' }}>Agregar</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead><tr><th style={th}>Nombre</th><th style={th}>Teléfono</th><th style={th}>Mesa</th><th style={th}>Grupo</th><th style={th}>Idioma</th><th style={th}></th></tr></thead>
          <tbody>
            {items.map(item => editing?.id === item.id ? (
              <tr key={item.id}>
                <td style={td}><input style={field} value={editing.name} onChange={e => setEditing(x => x && ({ ...x, name: e.target.value }))} /></td>
                <td style={td}><input style={field} value={editing.phone} onChange={e => setEditing(x => x && ({ ...x, phone: e.target.value }))} /></td>
                <td style={td}><input style={field} value={editing.table_name} onChange={e => setEditing(x => x && ({ ...x, table_name: e.target.value }))} /></td>
                <td style={td}>{groupSelect(editing.group_id, v => setEditing(x => x && ({ ...x, group_id: v })))}</td>
                <td style={td}><input style={{ ...field, width: 60 }} value={editing.language} onChange={e => setEditing(x => x && ({ ...x, language: e.target.value }))} /></td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>Guardar</button>
                  <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>Cancelar</button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td style={td}>{item.name}</td>
                <td style={td}>{item.phone ?? '—'}</td>
                <td style={td}>{item.table_name ?? '—'}</td>
                <td style={td}>{item.group_name ?? '—'}</td>
                <td style={td}>{item.language ?? '—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button onClick={() => setEditing({ id: item.id, name: item.name, phone: item.phone ?? '', email: item.email ?? '', group_id: item.group_id ?? '', table_name: item.table_name ?? '', language: item.language ?? '' })} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>Editar</button>
                  <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>Sin invitados aún.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
