import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'
import { getWeddingConfigById } from '@/lib/tenant'
import { revalidateWeddingPages } from '@/lib/revalidate'

export async function GET() {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT * FROM wedding_schedule
      WHERE wedding_id = ${session.weddingId}
      ORDER BY sort_order
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/schedule GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const rows = await sql`
      INSERT INTO wedding_schedule (wedding_id, sort_order, time_label, iso_time, event_name, description)
      VALUES (
        ${session.weddingId}, ${body.sort_order ?? 0},
        ${body.time_label}, ${body.iso_time},
        ${body.event_name}, ${body.description ?? null}
      )
      RETURNING *
    `
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[dashboard/schedule POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
