import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const weddingId = req.headers.get('x-wedding-id')
    if (!weddingId) return NextResponse.json({ ok: false, error: 'Unknown wedding.' }, { status: 400 })

    const { groupId, guestAttendance, attending, guestCount, message, rsvpedBy } = await req.json()

    if (!groupId) {
      return NextResponse.json({ ok: false, error: 'Could not identify group.' }, { status: 400 })
    }

    const name = rsvpedBy || 'Unknown'
    const guestAttendanceJson = Array.isArray(guestAttendance) ? JSON.stringify(guestAttendance) : null

    const existing = await sql`
      SELECT id FROM rsvps
      WHERE group_id = ${groupId} AND wedding_id = ${weddingId}
      LIMIT 1
    `

    if (existing[0]) {
      await sql`
        UPDATE rsvps
        SET attending = ${attending},
            guest_count = ${attending ? guestCount : 0},
            message = ${message ?? null},
            rsvped_by = ${name},
            guest_attendance = ${guestAttendanceJson}::jsonb
        WHERE group_id = ${groupId} AND wedding_id = ${weddingId}
      `
    } else {
      await sql`
        INSERT INTO rsvps (wedding_id, group_id, attending, guest_count, message, rsvped_by, guest_attendance)
        VALUES (
          ${weddingId}, ${groupId}, ${attending},
          ${attending ? guestCount : 0},
          ${message ?? null}, ${name},
          ${guestAttendanceJson}::jsonb
        )
      `
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[rsvp] unexpected error:', err)
    return NextResponse.json({ ok: false, error: 'Internal server error.' }, { status: 500 })
  }
}
