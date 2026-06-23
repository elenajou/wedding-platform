'use client'

import { useState } from 'react'

type Table = { id: string; name: string; capacity: number }
type Props = { initialItems: Table[] }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (color = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: color, color: color === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })

export default function TablesTab({ initialItems }: Props) {
  const [items, setItems] = useState<Table[]>(initialItems)
  const [form, setForm] = useState({ name: '', capacity: '8' })
  const [editing, setEditing] = useState<{ id: string; name: string; capacity: string } | null>(null)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/dashboard/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, capacity: Number(form.capacity) }) })
    if (res.ok) { const d = await res.json(); setItems(i => [...i, d]); setForm({ name: '', capacity: '8' }) }
    else { const d = await res.json(); setError(d.error ?? 'Failed to add') }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const res = await fetch(`/api/dashboard/tables/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editing.name, capacity: Number(editing.capacity) }) })
    if (res.ok) { const d = await res.json(); setItems(i => i.map(x => x.id === d.id ? d : x)); setEditing(null) }
    else { const d = await res.json(); setError(d.error ?? 'Failed to save') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta mesa?')) return
    const res = await fetch(`/api/dashboard/tables/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed to delete')
  }

  const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
  const td: React.CSSProperties = { padding: '10px 10px', fontSize: 15, color: '#201d19', borderBottom: '0.5px solid #f0ebe3' }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>Mesas</p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: '2rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 2 }}><div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>Nombre de mesa</div><input style={field} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mesa 1" required /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>Capacidad</div><input style={field} type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
        <button type="submit" style={btn()}>Agregar</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Nombre</th><th style={th}>Capacidad</th><th style={th}></th></tr></thead>
        <tbody>
          {items.map(item => editing?.id === item.id ? (
            <tr key={item.id}>
              <td style={td}><input style={field} value={editing.name} onChange={e => setEditing(x => x && ({ ...x, name: e.target.value }))} /></td>
              <td style={td}><input style={{ ...field, width: 70 }} type="number" value={editing.capacity} onChange={e => setEditing(x => x && ({ ...x, capacity: e.target.value }))} /></td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>Guardar</button>
                <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>Cancelar</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td style={td}>{item.name}</td>
              <td style={td}>{item.capacity}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => setEditing({ id: item.id, name: item.name, capacity: String(item.capacity) })} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>Editar</button>
                <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>Eliminar</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>Sin mesas aún.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
