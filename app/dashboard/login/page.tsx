'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLoginPage() {
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim(), password }),
      })
      if (res.ok) {
        router.push('/dashboard/wedding')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '0.5rem', textAlign: 'center' }}>
          Couple Dashboard
        </h1>
        <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4b4331', textAlign: 'center', marginBottom: '2rem' }}>
          Sign in to manage your wedding
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4b4331', marginBottom: 4 }}>
              Wedding Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="john-sarah"
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #c4b89a', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#201d19', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4b4331', marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #c4b89a', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#201d19', outline: 'none' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 14, fontStyle: 'italic', color: '#702d22', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 13, background: '#2e2a24', color: '#f4efe5', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
