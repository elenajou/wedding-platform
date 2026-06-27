import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'

export async function GET() {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT g.*, ig.name AS group_name
      FROM guests g
      LEFT JOIN invitation_groups ig ON ig.id = g.group_id
      WHERE g.wedding_id = ${session.weddingId}
      ORDER BY g.created_at
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/guests GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const rows = await sql`
      INSERT INTO guests (wedding_id, name, phone, email, group_id, table_name, language)
      VALUES (
        ${session.weddingId}, ${body.name}, ${body.phone ?? null},
        ${body.email ?? null}, ${body.group_id ?? null},
        ${body.table_name ?? null}, ${body.language ?? null}
      )
      RETURNING *
    `
    const guest = rows[0] as any
    if (guest.group_id) {
      const groups = await sql`SELECT name FROM invitation_groups WHERE id = ${guest.group_id} LIMIT 1`
      guest.group_name = groups[0]?.name ?? null
    }
    return NextResponse.json(guest, { status: 201 })
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Duplicate phone number — each guest must have a unique phone number.' }, { status: 409 })
    }
    console.error('[dashboard/guests POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
