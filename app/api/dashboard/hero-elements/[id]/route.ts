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
      UPDATE hero_elements
      SET sort_order     = ${body.sort_order},
          element_type   = ${body.element_type},
          content        = ${body.content ?? ''},
          locale_content = ${JSON.stringify(body.locale_content ?? {})}::jsonb,
          font_family    = ${body.font_family ?? ''},
          font_style     = ${body.font_style ?? 'normal'},
          font_weight    = ${body.font_weight ?? '400'},
          font_size      = ${body.font_size ?? ''},
          letter_spacing = ${body.letter_spacing ?? ''},
          font_color     = ${body.font_color ?? ''},
          visible        = ${body.visible !== false}
      WHERE id = ${id} AND wedding_id = ${session.weddingId}
      RETURNING *
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[dashboard/hero-elements/[id] PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await sql`DELETE FROM hero_elements WHERE id = ${id} AND wedding_id = ${session.weddingId}`
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[dashboard/hero-elements/[id] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
