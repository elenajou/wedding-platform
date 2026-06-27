import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getDictionaryWithData, hasLocale } from '../dictionaries'
import { getWeddingConfigById } from '@/lib/tenant'
import InvitationClient from './InvitationClient'

export const dynamic = 'force-dynamic'

export default async function InvitationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const h = await headers()
  const weddingId = h.get('x-wedding-id')
  const config = weddingId ? await getWeddingConfigById(weddingId) : null

  const { dict, weddingDetails } = await getDictionaryWithData(lang)

  return (
    <InvitationClient
      dict={dict}
      lang={lang}
      weddingDetails={weddingDetails}
      features={config?.features ?? {
        rsvp: true, countdown: true, gallery: true, guestbook: false,
        maps: false, qrCode: false, videoSection: true, schedule: true, faq: true, seatingCard: true, dressCode: false,
      }}
    />
  )
}
