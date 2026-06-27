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
      SELECT * FROM wedding_dress_code
      WHERE wedding_id = ${session.weddingId}
      ORDER BY sort_order
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/dress-code GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const imageUrlsJson = JSON.stringify(body.image_urls ?? [])
    const localeContentJson = JSON.stringify(body.locale_content ?? {})
    const rows = await sql`
      INSERT INTO wedding_dress_code
        (wedding_id, sort_order, title, description, image_urls, locale_content)
      VALUES (
        ${session.weddingId}, ${body.sort_order ?? 0},
        ${body.title ?? ''}, ${body.description ?? ''},
        ${imageUrlsJson}::jsonb, ${localeContentJson}::jsonb
      )
      RETURNING *
    `
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[dashboard/dress-code POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
