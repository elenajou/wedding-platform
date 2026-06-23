import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { resolveConfigBySlug } from '@/lib/tenant'
import { signDashboardToken, DASHBOARD_COOKIE } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json()
    if (!slug || !password) {
      return NextResponse.json({ ok: false, error: 'Slug and password required.' }, { status: 400 })
    }

    const config = await resolveConfigBySlug(slug)
    if (!config) {
      return NextResponse.json({ ok: false, error: 'Wedding not found.' }, { status: 404 })
    }

    const rows = await sql`SELECT dashboard_password_hash FROM weddings WHERE id = ${config.id} LIMIT 1`
    const hash = rows[0]?.dashboard_password_hash as string | undefined

    const valid = hash ? await bcrypt.compare(password, hash) : false
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Invalid password.' }, { status: 401 })
    }

    const token = await signDashboardToken(config.id)
    const response = NextResponse.json({ ok: true })
    response.cookies.set(DASHBOARD_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('[auth/dashboard]', err)
    return NextResponse.json({ ok: false, error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(DASHBOARD_COOKIE)
  return response
}
