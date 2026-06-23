import { notFound } from 'next/navigation'
import { getWeddingConfigById } from '@/lib/tenant'
import EditWeddingForm from './EditWeddingForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditWeddingPage({ params }: Props) {
  const { id } = await params
  const config = await getWeddingConfigById(id)
  if (!config) notFound()

  return (
    <main style={{ minHeight: '100svh', background: '#1e1a16', fontFamily: "'EB Garamond', serif", padding: '2rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <a href="/super-admin" style={{ color: '#6b6046', fontSize: 12, textDecoration: 'none' }}>← Back</a>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', fontWeight: 300, color: '#f4efe5' }}>
            Edit: {config.slug}
          </h1>
        </div>
        <EditWeddingForm config={config} />
      </div>
    </main>
  )
}
