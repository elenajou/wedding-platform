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
      SELECT * FROM section_config
      WHERE wedding_id = ${session.weddingId}
      ORDER BY sort_order
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/sections GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows: {
      id: string | null
      section_key?: string
      sort_order: number
      design?: string
      color_scheme?: string
      background_url?: string | null
      background_color?: string | null
      font_color?: string | null
      overlay_opacity?: number
    }[] = await req.json()

    const updated = []
    for (const row of rows) {
      if (row.id) {
        const r = await sql`
          UPDATE section_config
          SET sort_order       = ${row.sort_order},
              design           = COALESCE(${row.design ?? null}, design),
              color_scheme     = COALESCE(${row.color_scheme ?? null}, color_scheme),
              background_url   = ${row.background_url ?? null},
              background_color = ${row.background_color ?? null},
              font_color       = ${row.font_color ?? null},
              overlay_opacity  = ${row.overlay_opacity ?? 0.32}
          WHERE id = ${row.id} AND wedding_id = ${session.weddingId}
          RETURNING *
        `
        if (r[0]) updated.push(r[0])
      } else if (row.section_key) {
        const r = await sql`
          INSERT INTO section_config
            (wedding_id, section_key, sort_order, design, color_scheme,
             background_url, background_color, font_color, overlay_opacity)
          VALUES
            (${session.weddingId}, ${row.section_key}, ${row.sort_order},
             ${row.design ?? 'Classic'}, ${row.color_scheme ?? 'Gold'},
             ${row.background_url ?? null}, ${row.background_color ?? null},
             ${row.font_color ?? null}, ${row.overlay_opacity ?? 0.32})
          ON CONFLICT (wedding_id, section_key) DO UPDATE SET
            sort_order       = EXCLUDED.sort_order,
            design           = EXCLUDED.design,
            color_scheme     = EXCLUDED.color_scheme,
            background_url   = EXCLUDED.background_url,
            background_color = EXCLUDED.background_color,
            font_color       = EXCLUDED.font_color,
            overlay_opacity  = EXCLUDED.overlay_opacity
          RETURNING *
        `
        if (r[0]) updated.push(r[0])
      }
    }

    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[dashboard/sections PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
