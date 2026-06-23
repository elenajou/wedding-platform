import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSuperAdminSession } from '@/lib/auth'
import { invalidateTenantCache } from '@/lib/tenant'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { domains, defaultLocale, locales, dashboardPassword, features, enabledDesigns } = body

    const passwordHash = dashboardPassword ? await bcrypt.hash(dashboardPassword, 10) : null
    const enabledDesignsJson = JSON.stringify(enabledDesigns ?? {})

    const rows = passwordHash
      ? await sql`
          UPDATE weddings SET
            domains                = ${domains ?? []}::text[],
            default_locale         = ${defaultLocale},
            locales                = ${locales ?? ['en']}::text[],
            dashboard_password_hash = ${passwordHash},
            feature_rsvp           = ${features?.rsvp},
            feature_countdown      = ${features?.countdown},
            feature_gallery        = ${features?.gallery},
            feature_guestbook      = ${features?.guestbook},
            feature_maps           = ${features?.maps},
            feature_qr_code        = ${features?.qrCode},
            feature_video_section  = ${features?.videoSection},
            feature_schedule       = ${features?.schedule},
            feature_faq            = ${features?.faq},
            feature_seating_card   = ${features?.seatingCard},
            enabled_designs        = ${enabledDesignsJson}::jsonb
          WHERE id = ${id}
          RETURNING *
        `
      : await sql`
          UPDATE weddings SET
            domains                = ${domains ?? []}::text[],
            default_locale         = ${defaultLocale},
            locales                = ${locales ?? ['en']}::text[],
            feature_rsvp           = ${features?.rsvp},
            feature_countdown      = ${features?.countdown},
            feature_gallery        = ${features?.gallery},
            feature_guestbook      = ${features?.guestbook},
            feature_maps           = ${features?.maps},
            feature_qr_code        = ${features?.qrCode},
            feature_video_section  = ${features?.videoSection},
            feature_schedule       = ${features?.schedule},
            feature_faq            = ${features?.faq},
            feature_seating_card   = ${features?.seatingCard},
            enabled_designs        = ${enabledDesignsJson}::jsonb
          WHERE id = ${id}
          RETURNING *
        `

    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    invalidateTenantCache()
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[super-admin/weddings/[id] PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await sql`DELETE FROM weddings WHERE id = ${id}`
    invalidateTenantCache()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[super-admin/weddings/[id] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
