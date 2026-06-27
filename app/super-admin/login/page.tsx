'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/super-admin')
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ width: '100%', maxWidth: 340, padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '0.5rem', textAlign: 'center' }}>
          Platform Admin
        </h1>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6e5f', textAlign: 'center', marginBottom: '2rem' }}>
          Super Admin Access
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a6e5f', marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '0.5px solid #d4cbbf', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#201d19', outline: 'none' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 14, fontStyle: 'italic', color: '#c4614a', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 13, background: '#b08d57', color: '#faf7f2', border: 'none', fontFamily: "'EB Garamond', serif", fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
