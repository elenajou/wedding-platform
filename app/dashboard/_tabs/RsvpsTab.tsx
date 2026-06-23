'use client'

import { useState } from 'react'

type Rsvp = { id: string; group_name: string | null; attending: boolean; guest_count: number; allocated_seats: number; message: string | null; rsvped_by: string | null; created_at: string; guest_attendance: any }
type Props = { initialItems: Rsvp[] }

const th: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', borderBottom: '0.5px solid #e0d8c8', textAlign: 'left', fontWeight: 400 }
const td: React.CSSProperties = { padding: '10px 10px', fontSize: 14, color: '#201d19', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'top' }

export default function RsvpsTab({ initialItems }: Props) {
  const [items, setItems] = useState<Rsvp[]>(initialItems)
  const [error, setError] = useState('')

  const attending = items.filter(r => r.attending)
  const declined = items.filter(r => !r.attending)
  const totalAttending = attending.reduce((s, r) => s + r.guest_count, 0)

  async function handleDelete(id: string) {
    if (!confirm('Delete this RSVP?')) return
    const res = await fetch(`/api/dashboard/rsvps/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(i => i.filter(x => x.id !== id))
    else setError('Failed to delete')
  }

  return (
    <div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '0.5rem' }}>RSVPs</p>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        {[['Total', items.length], ['Attending', attending.length], ['Guests', totalAttending], ['Declined', declined.length]].map(([lbl, val]) => (
          <div key={lbl as string} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#b08d57', lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7a6e5f', marginTop: 2 }}>{lbl}</p>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#c4614a', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>{error}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Group</th><th style={th}>Status</th><th style={th}>Guests</th><th style={th}>Submitted by</th><th style={th}>Message</th><th style={th}></th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={td}>{item.group_name ?? '—'}</td>
                <td style={td}>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: item.attending ? '#e8f4ec' : '#fce8e4', color: item.attending ? '#2d6a40' : '#c4614a' }}>
                    {item.attending ? 'Attending' : 'Declined'}
                  </span>
                </td>
                <td style={td}>{item.attending ? `${item.guest_count} / ${item.allocated_seats}` : '—'}</td>
                <td style={td}>{item.rsvped_by ?? '—'}</td>
                <td style={{ ...td, maxWidth: 220, color: '#4b4331', fontStyle: 'italic' }}>{item.message ?? '—'}</td>
                <td style={td}><button onClick={() => handleDelete(item.id)} style={{ padding: '4px 10px', background: '#f5ebe8', color: '#201d19', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ ...td, color: '#7a6e5f', fontStyle: 'italic' }}>No RSVPs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
