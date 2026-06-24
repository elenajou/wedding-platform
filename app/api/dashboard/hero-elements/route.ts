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
      SELECT * FROM hero_elements
      WHERE wedding_id = ${session.weddingId}
      ORDER BY sort_order
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/hero-elements GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const rows = await sql`
      INSERT INTO hero_elements (wedding_id, sort_order, element_type, content, locale_content, font_family, font_style, font_weight, font_size, letter_spacing, font_color, visible)
      VALUES (
        ${session.weddingId},
        ${body.sort_order ?? 0},
        ${body.element_type},
        ${body.content ?? ''},
        ${JSON.stringify(body.locale_content ?? {})}::jsonb,
        ${body.font_family ?? ''},
        ${body.font_style ?? 'normal'},
        ${body.font_weight ?? '400'},
        ${body.font_size ?? ''},
        ${body.letter_spacing ?? ''},
        ${body.font_color ?? ''},
        ${body.visible !== false}
      )
      RETURNING *
    `
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[dashboard/hero-elements POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
