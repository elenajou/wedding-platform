import { getAllWeddingConfigs } from '@/lib/tenant'
import type { WeddingConfig } from '@/lib/tenant'
import SignOutButton from '@/app/super-admin/_SignOutButton'

export default async function SuperAdminPage() {
  const weddings = await getAllWeddingConfigs()

  return (
    <main style={{ minHeight: '100svh', background: '#faf7f2', fontFamily: "'EB Garamond', serif", padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontStyle: 'italic', fontWeight: 300, color: '#201d19' }}>
            Platform Weddings
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="/super-admin/weddings/new"
              style={{ padding: '8px 18px', background: '#b08d57', color: '#faf7f2', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1, textDecoration: 'none' }}
            >
              + New Wedding
            </a>
            <SignOutButton />
          </div>
        </div>

        {weddings.length === 0 ? (
          <p style={{ color: '#7a6e5f', fontStyle: 'italic', fontSize: 18 }}>No weddings yet. Create your first one.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {weddings.map((w: WeddingConfig) => (
              <a
                key={w.id}
                href={`/super-admin/weddings/${w.id}`}
                style={{ display: 'block', padding: '1rem 1.25rem', background: '#ffffff', textDecoration: 'none', borderLeft: '2px solid #d4cbbf' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: 2 }}>
                      {w.slug}
                    </p>
                    <p style={{ fontSize: 12, color: '#7a6e5f' }}>
                      {w.domains.length > 0 ? w.domains.join(', ') : 'No custom domains'}
                      &nbsp;·&nbsp;
                      {w.locales.join(', ')}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 1, background: '#faf7f2', color: '#b08d57', border: '0.5px solid #d4cbbf' }}>
                    Edit →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
