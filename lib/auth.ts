import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const DASHBOARD_COOKIE = 'dashboard_session'
const SUPER_ADMIN_COOKIE = 'super_admin_session'

function getJwtSecret(): Uint8Array {
  const secret = process.env.DASHBOARD_JWT_SECRET
  if (!secret) throw new Error('DASHBOARD_JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export async function signDashboardToken(weddingId: string): Promise<string> {
  return new SignJWT({ weddingId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function getDashboardSession(): Promise<{ weddingId: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(DASHBOARD_COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (typeof payload.weddingId !== 'string') return null
    return { weddingId: payload.weddingId }
  } catch {
    return null
  }
}

export async function getSuperAdminSession(): Promise<{ ok: boolean } | null> {
  try {
    const cookieStore = await cookies()
    const val = cookieStore.get(SUPER_ADMIN_COOKIE)?.value
    if (val === 'authenticated') return { ok: true }
    return null
  } catch {
    return null
  }
}

export { DASHBOARD_COOKIE, SUPER_ADMIN_COOKIE }
