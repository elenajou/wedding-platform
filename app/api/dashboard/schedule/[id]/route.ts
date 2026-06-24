import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'
import { getWeddingConfigById } from '@/lib/tenant'
import { revalidateWeddingPages } from '@/lib/revalidate'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const rows = await sql`
      UPDATE wedding_schedule
      SET sort_order     = ${body.sort_order},
          time_label     = ${body.time_label},
          iso_time       = ${body.iso_time},
          event_name     = ${body.event_name},
          description    = ${body.description ?? null},
          locale_content = ${JSON.stringify(body.locale_content ?? {})}::jsonb
      WHERE id = ${id} AND wedding_id = ${session.weddingId}
      RETURNING *
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[dashboard/schedule/[id] PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await sql`DELETE FROM wedding_schedule WHERE id = ${id} AND wedding_id = ${session.weddingId}`
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[dashboard/schedule/[id] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
