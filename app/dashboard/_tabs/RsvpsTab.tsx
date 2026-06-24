'use client'

import { useState } from 'react'
import { dt } from '@/lib/dashboard-i18n'

type Rsvp = { id: string; group_name: string | null; attending: boolean; guest_count: number; allocated_seats: number; message: string | null; rsvped_by: string | null; created_at: string; guest_attendance: any }
type Props = { initialItems: Rsvp[]; locale?: string }

const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '10px 10px', fontSize: 14, color: '#201d19', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'top' }

export default function RsvpsTab({ initialItems, locale }: Props) {
  const [items, setItems] = useState<Rsvp[]>(initialItems)
  const [error, setError] = useState('')

  const T = (k: string) => dt(k, locale)

  const attending = items.filter(r => r.attending)
  const declined = items.filter(r => !r.attending)

  function countGuests(r: Rsvp): number {
    // guest_count is stored as confirmed attending count by the RSVP form
    const n = Number(r.guest_count)
    if (n > 0) return n
    // fallback: derive from per-member attendance data
    let ga: unknown = r.guest_attendance
    if (typeof ga === 'string') { try { ga = JSON.parse(ga) } catch { return 0 } }
    if (Array.isArray(ga) && ga.length > 0) return (ga as { attending: boolean }[]).filter(g => g.attending).length
    return 0
  }

  const totalAttending = attending.reduce((s, r) => s + countGuests(r), 0)

  async function handleDelete(id: string) {
    if (!confirm(T('rsvpsDeleteConfirm'))) return
    const res = await fetch(`/api/dashboard/rsvps/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed to delete')
  }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '0.5rem' }}>{T('rsvpsTitle')}</p>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        {([[T('rsvpsConfirmed'), totalAttending], [T('rsvpsDeclined'), declined.length]] as [string, number][]).map(([lbl, val]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#b08d57', lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginTop: 2 }}>{lbl}</p>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>{T('rsvpsColGroup')}</th>
              <th style={th}>{T('rsvpsColStatus')}</th>
              <th style={th}>{T('rsvpsColGuests')}</th>
              <th style={th}>{T('rsvpsColSentBy')}</th>
              <th style={th}>{T('rsvpsColMessage')}</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={td}>{item.group_name ?? '—'}</td>
                <td style={td}>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: item.attending ? '#e8f4ec' : '#fce8e4', color: item.attending ? '#2d6a40' : '#c4614a' }}>
                    {item.attending ? T('rsvpsStatusAttending') : T('rsvpsStatusDeclined')}
                  </span>
                </td>
                <td style={td}>{item.attending ? `${countGuests(item)} / ${item.allocated_seats}` : '—'}</td>
                <td style={td}>{item.rsvped_by ?? '—'}</td>
                <td style={{ ...td, maxWidth: 220, color: '#4b4331', fontStyle: 'italic' }}>{item.message ?? '—'}</td>
                <td style={td}>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '4px 10px', background: '#f5ebe8', color: '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>
                    {T('delete')}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>{T('rsvpsEmpty')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
