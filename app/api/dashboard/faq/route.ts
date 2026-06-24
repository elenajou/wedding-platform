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
      SELECT * FROM wedding_faq
      WHERE wedding_id = ${session.weddingId}
      ORDER BY sort_order
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[dashboard/faq GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const rows = await sql`
      INSERT INTO wedding_faq (wedding_id, sort_order, question, answer, locale_content)
      VALUES (${session.weddingId}, ${body.sort_order ?? 0}, ${body.question}, ${body.answer}, ${JSON.stringify(body.locale_content ?? {})})
      RETURNING *
    `
    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[dashboard/faq POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
