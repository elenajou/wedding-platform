import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'
import { getWeddingConfigById } from '@/lib/tenant'
import { revalidateWeddingPages } from '@/lib/revalidate'

export async function GET() {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`SELECT * FROM wedding_details WHERE wedding_id = ${session.weddingId} LIMIT 1`
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[dashboard/wedding-details GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Strip non-editable fields — all other keys are passed through
    const { id: _id, wedding_id: _wid, created_at: _ca, ...b } = await req.json()

    const rows = await sql`
      UPDATE wedding_details SET
        bride_name         = COALESCE(${b.bride_name          ?? null}, bride_name),
        groom_name         = COALESCE(${b.groom_name          ?? null}, groom_name),
        wedding_date       = COALESCE(${b.wedding_date        ?? null}, wedding_date),
        ceremony_time      = COALESCE(${b.ceremony_time       ?? null}, ceremony_time),
        ceremony_location  = COALESCE(${b.ceremony_location   ?? null}, ceremony_location),
        reception_time     = COALESCE(${b.reception_time      ?? null}, reception_time),
        reception_location = COALESCE(${b.reception_location  ?? null}, reception_location),
        coordinator_email  = COALESCE(${b.coordinator_email   ?? null}, coordinator_email),
        coordinator_name   = COALESCE(${b.coordinator_name    ?? null}, coordinator_name),
        rsvp_deadline      = COALESCE(${b.rsvp_deadline       ?? null}, rsvp_deadline),
        names_font_url     = COALESCE(${b.names_font_url      ?? null}, names_font_url),
        hero_eyebrow       = COALESCE(${b.hero_eyebrow        ?? null}, hero_eyebrow),
        hero_tagline       = COALESCE(${b.hero_tagline        ?? null}, hero_tagline),
        hero_greeting      = COALESCE(${b.hero_greeting       ?? null}, hero_greeting),
        hero_body_text     = COALESCE(${b.hero_body_text      ?? null}, hero_body_text),
        letter_eyebrow     = COALESCE(${b.letter_eyebrow      ?? null}, letter_eyebrow),
        letter_greeting    = COALESCE(${b.letter_greeting     ?? null}, letter_greeting),
        letter_body_text   = COALESCE(${b.letter_body_text    ?? null}, letter_body_text),
        video_source_type  = COALESCE(${b.video_source_type   ?? null}, video_source_type),
        video_source_id    = COALESCE(${b.video_source_id     ?? null}, video_source_id),
        video_poster_url   = COALESCE(${b.video_poster_url    ?? null}, video_poster_url)
      WHERE wedding_id = ${session.weddingId}
      RETURNING *
    `

    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const config = await getWeddingConfigById(session.weddingId)
    if (config) revalidateWeddingPages(config.locales)

    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[dashboard/wedding-details PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
