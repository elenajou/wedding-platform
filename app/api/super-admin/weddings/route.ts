import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSuperAdminSession } from '@/lib/auth'
import { invalidateTenantCache, getAllWeddingConfigs } from '@/lib/tenant'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weddings = await getAllWeddingConfigs()
  return NextResponse.json(weddings)
}

export async function POST(req: NextRequest) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { slug, domains, defaultLocale, locales, dashboardPassword, features } = body

    const passwordHash = dashboardPassword ? await bcrypt.hash(dashboardPassword, 10) : ''

    const rows = await sql`
      INSERT INTO weddings (
        slug, domains, default_locale, locales, dashboard_password_hash, active,
        feature_rsvp, feature_countdown, feature_gallery, feature_guestbook,
        feature_maps, feature_qr_code, feature_video_section,
        feature_schedule, feature_faq, feature_seating_card
      ) VALUES (
        ${slug},
        ${domains ?? []}::text[],
        ${defaultLocale ?? 'en'},
        ${locales ?? ['en']}::text[],
        ${passwordHash},
        true,
        ${features?.rsvp ?? true},
        ${features?.countdown ?? true},
        ${features?.gallery ?? false},
        ${features?.guestbook ?? false},
        ${features?.maps ?? false},
        ${features?.qrCode ?? false},
        ${features?.videoSection ?? false},
        ${features?.schedule ?? true},
        ${features?.faq ?? true},
        ${features?.seatingCard ?? true}
      )
      RETURNING *
    `

    const wedding = rows[0] as any
    await sql`
      INSERT INTO wedding_details (wedding_id, bride_name, groom_name)
      VALUES (${wedding.id}, '', '')
    `

    invalidateTenantCache()
    return NextResponse.json(wedding, { status: 201 })
  } catch (err) {
    console.error('[super-admin/weddings POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
