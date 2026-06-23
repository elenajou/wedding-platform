import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'

export async function GET() {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT * FROM wedding_tables
      WHERE wedding_id = ${session.weddingId}
      ORDER BY created_at
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/tables GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const rows = await sql`
      INSERT INTO wedding_tables (wedding_id, name, capacity)
      VALUES (${session.weddingId}, ${body.name}, ${body.capacity ?? 8})
      RETURNING *
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[dashboard/tables POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
