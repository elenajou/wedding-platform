import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'

export async function GET() {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT r.*, ig.name AS group_name, ig.allocated_seats
      FROM rsvps r
      LEFT JOIN invitation_groups ig ON ig.id = r.group_id
      WHERE r.wedding_id = ${session.weddingId}
      ORDER BY r.created_at DESC
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/rsvps GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
