import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const weddingId = req.headers.get('x-wedding-id')
    if (!weddingId) return NextResponse.json({ found: false, error: 'Unknown wedding.' }, { status: 400 })

    const body = await req.json()
    const { phone, passcode } = body

    if (!phone && !passcode) {
      return NextResponse.json({ found: false, error: 'Phone number or invitation code is required.' }, { status: 400 })
    }

    if (phone) {
      const normalized = (phone as string).trim()

      const rows = await sql`
        SELECT g.id, g.name, g.language, g.table_name, g.group_id,
               ig.id   AS ig_id,
               ig.name AS ig_name,
               ig.allocated_seats
        FROM guests g
        LEFT JOIN invitation_groups ig ON ig.id = g.group_id AND ig.wedding_id = ${weddingId}
        WHERE g.wedding_id = ${weddingId} AND g.phone = ${normalized}
        LIMIT 1
      `

      if (!rows[0]) return NextResponse.json({ found: false })

      const guest = rows[0]
      const members = guest.ig_id
        ? await sql`
            SELECT id, name, table_name FROM guests
            WHERE group_id = ${guest.ig_id} AND wedding_id = ${weddingId}
            ORDER BY created_at
          `
        : []

      return NextResponse.json({
        found: true,
        guestId: guest.id,
        guestName: guest.name ?? null,
        language: guest.language ?? 'en',
        groupId: guest.ig_id ?? null,
        groupName: guest.ig_name ?? null,
        tableName: guest.table_name ?? null,
        allocatedSeats: guest.allocated_seats ?? 1,
        groupMembers: (members as any[]).filter((m) => m.name).map((m) => ({
          id: m.id,
          name: m.name,
          tableName: m.table_name ?? null,
        })),
      })
    }

    if (passcode) {
      const groups = await sql`
        SELECT id, name, allocated_seats FROM invitation_groups
        WHERE wedding_id = ${weddingId} AND passcode = ${(passcode as string).trim().toUpperCase()}
        LIMIT 1
      `
      if (!groups[0]) return NextResponse.json({ found: false })

      const group = groups[0]
      const members = await sql`
        SELECT id, name, table_name FROM guests
        WHERE group_id = ${group.id} AND wedding_id = ${weddingId}
        ORDER BY created_at
      `

      return NextResponse.json({
        found: true,
        guestId: null,
        guestName: null,
        language: 'en',
        groupId: group.id,
        groupName: group.name,
        tableName: null,
        allocatedSeats: group.allocated_seats,
        groupMembers: (members as any[]).filter((m) => m.name).map((m) => ({
          id: m.id,
          name: m.name,
          tableName: m.table_name ?? null,
        })),
      })
    }
  } catch (err) {
    console.error('[lookup] unexpected error:', err)
    return NextResponse.json({ found: false, error: 'Internal server error.' }, { status: 500 })
  }
}
