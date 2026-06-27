import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getDashboardSession } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const fieldKey = formData.get('fieldKey') as string | null

    if (!file || !fieldKey) {
      return NextResponse.json({ error: 'Missing file or fieldKey' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    // Deterministic public_id per wedding + field — overwrite replaces the old asset
    const sanitizedKey = fieldKey.replace(/[^a-zA-Z0-9_-]/g, '-')
    const publicId = `weddings/${session.weddingId}/${sanitizedKey}`

    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error('[upload-image POST]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getDashboardSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { fieldKey } = await req.json()
    if (!fieldKey) return NextResponse.json({ error: 'Missing fieldKey' }, { status: 400 })

    const sanitizedKey = fieldKey.replace(/[^a-zA-Z0-9_-]/g, '-')
    const publicId = `weddings/${session.weddingId}/${sanitizedKey}`

    await cloudinary.uploader.destroy(publicId, { invalidate: true })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[upload-image DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
