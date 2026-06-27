import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getDashboardSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const rows = await sql`
      UPDATE guests
      SET name       = ${body.name},
          phone      = ${body.phone ?? null},
          email      = ${body.email ?? null},
          group_id   = ${body.group_id ?? null},
          table_name = ${body.table_name ?? null},
          language   = ${body.language ?? null}
      WHERE id = ${id} AND wedding_id = ${session.weddingId}
      RETURNING *
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const guest = rows[0] as any
    if (guest.group_id) {
      const groups = await sql`SELECT name FROM invitation_groups WHERE id = ${guest.group_id} LIMIT 1`
      guest.group_name = groups[0]?.name ?? null
    }
    return NextResponse.json(guest)
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Duplicate phone number — each guest must have a unique phone number.' }, { status: 409 })
    }
    console.error('[dashboard/guests/[id] PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await sql`DELETE FROM guests WHERE id = ${id} AND wedding_id = ${session.weddingId}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[dashboard/guests/[id] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
