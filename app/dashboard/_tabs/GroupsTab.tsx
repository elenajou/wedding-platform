'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'

type Group = { id: string; name: string; allocated_seats: number; passcode: string | null; language: string | null }
type Props = { initialItems: Group[]; locale?: string }
type SortKey = 'name' | 'allocated_seats' | 'passcode' | 'language'
type Sort = { key: SortKey; dir: 'asc' | 'desc' }

const field: React.CSSProperties = { padding: '6px 8px', background: '#fff', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 15, color: '#201d19', outline: 'none', borderRadius: 1, width: '100%', boxSizing: 'border-box' }
const btn = (bg = '#b08d57'): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: bg === '#b08d57' ? '#fff' : '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 })
const baseTh: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '10px 10px', fontSize: 15, color: '#201d19', borderBottom: '0.5px solid #f0ebe3' }

function thStyle(sort: Sort | null, key: SortKey): React.CSSProperties {
  return { ...baseTh, cursor: 'pointer', userSelect: 'none', color: sort?.key === key ? '#b08d57' : '#7a6e5f' }
}
function ind(sort: Sort | null, key: SortKey) {
  return sort?.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''
}

const blank = { name: '', allocated_seats: '2', passcode: '', language: '' }

export default function GroupsTab({ initialItems, locale }: Props) {
  const [items, setItems] = useState<Group[]>(initialItems)
  const [sort, setSort] = useState<Sort | null>(null)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<(typeof blank & { id: string }) | null>(null)
  const [error, setError] = useState('')

  const T = (k: string) => dt(k, locale)

  function toggleSort(key: SortKey) {
    setSort(s => s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const displayed = sort ? [...items].sort((a, b) => {
    const av = a[sort.key] ?? ''
    const bv = b[sort.key] ?? ''
    const cmp = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' })
    return sort.dir === 'asc' ? cmp : -cmp
  }) : items

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
    if (!confirm(T('groupsDeleteConfirm'))) return
    const res = await fetch(`/api/dashboard/groups/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed to delete')
  }

  function editRow(item: Group) { setEditing({ id: item.id, name: item.name, allocated_seats: String(item.allocated_seats), passcode: item.passcode ?? '', language: item.language ?? '' }) }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '1.5rem' }}>{T('groupsTitle')}</p>

      <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: '2rem', alignItems: 'flex-end' }}>
        {([[T('groupsName'), 'name', 'text', 'Familia García'], [T('groupsSeats'), 'allocated_seats', 'number', '2'], [T('groupsPasscode'), 'passcode', 'text', 'GARCIA'], [T('groupsLanguage'), 'language', 'text', 'es']] as [string,string,string,string][]).map(([lbl, key, type, ph]) => (
          <div key={key}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 3 }}>{lbl}</div>
            <input style={field} type={type} placeholder={ph} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key === 'name'} min={key === 'allocated_seats' ? 1 : undefined} />
          </div>
        ))}
        <button type="submit" style={{ ...btn(), alignSelf: 'flex-end' }}>{T('add')}</button>
      </form>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle(sort, 'name')} onClick={() => toggleSort('name')}>{T('groupsName')}{ind(sort, 'name')}</th>
            <th style={thStyle(sort, 'allocated_seats')} onClick={() => toggleSort('allocated_seats')}>{T('groupsSeats')}{ind(sort, 'allocated_seats')}</th>
            <th style={thStyle(sort, 'passcode')} onClick={() => toggleSort('passcode')}>{T('groupsPasscode')}{ind(sort, 'passcode')}</th>
            <th style={thStyle(sort, 'language')} onClick={() => toggleSort('language')}>{T('groupsLanguage')}{ind(sort, 'language')}</th>
            <th style={{ ...baseTh, color: '#7a6e5f' }}></th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(item => editing?.id === item.id ? (
            <tr key={item.id}>
              {(['name', 'allocated_seats', 'passcode', 'language'] as const).map(k => (
                <td key={k} style={td}><input style={field} type={k === 'allocated_seats' ? 'number' : 'text'} value={(editing as any)[k]} onChange={e => setEditing(x => x && ({ ...x, [k]: e.target.value }))} /></td>
              ))}
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={handleSaveEdit as any} style={{ ...btn(), marginRight: 6 }}>{T('save')}</button>
                <button onClick={() => setEditing(null)} style={btn('#e8e0d4')}>{T('cancel')}</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td style={td}>{item.name}</td>
              <td style={td}>{item.allocated_seats}</td>
              <td style={td}>{item.passcode ?? '—'}</td>
              <td style={td}>{item.language ?? '—'}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => editRow(item)} style={{ ...btn('#e8e0d4'), marginRight: 6 }}>{T('edit')}</button>
                <button onClick={() => handleDelete(item.id)} style={btn('#f5ebe8')}>{T('delete')}</button>
              </td>
            </tr>
          ))}
          {displayed.length === 0 && <tr><td colSpan={5} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>{T('groupsEmpty')}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
