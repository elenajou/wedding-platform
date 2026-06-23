import { notFound } from 'next/navigation'
import { getDictionaryWithData, getAllLocaleLetterData, hasLocale } from './dictionaries'
import EnvelopeGate from '@/components/EnvelopeGate'

export const dynamic = 'force-dynamic'

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const [{ dict, weddingDetails }, allLocaleLetterData] = await Promise.all([
    getDictionaryWithData(lang),
    getAllLocaleLetterData(),
  ])
  const envelopeCfg = weddingDetails.sections['envelope']

  return (
    <EnvelopeGate
      dict={dict.envelope}
      lang={lang}
      backgroundUrl={envelopeCfg?.backgroundUrl}
      backgroundColor={envelopeCfg?.backgroundColor}
      fontColor={envelopeCfg?.fontColor}
      namesFontUrl={weddingDetails.namesFontUrl}
      coordinatorEmail={weddingDetails.coordinatorEmail}
      letterEyebrow={weddingDetails.letterEyebrow}
      letterGreeting={weddingDetails.letterGreeting}
      letterBodyText={weddingDetails.letterBodyText}
      allLocaleLetterData={allLocaleLetterData}
    />
  )
}
