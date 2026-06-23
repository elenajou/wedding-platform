import { NextResponse, type NextRequest } from 'next/server'
import { SUPER_ADMIN_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (password !== process.env.SUPER_ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password.' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(SUPER_ADMIN_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })
    return response
  } catch (err) {
    console.error('[auth/super-admin]', err)
    return NextResponse.json({ ok: false, error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SUPER_ADMIN_COOKIE)
  return response
}
