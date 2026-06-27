'use client'

export default function SignOutButton() {
  async function handleSignOut() {
    await fetch('/api/auth/super-admin', { method: 'DELETE' })
    window.location.href = '/super-admin/login'
  }

  return (
    <button
      onClick={handleSignOut}
      style={{ padding: '8px 18px', background: 'transparent', color: '#7a6e5f', border: '0.5px solid #d4cbbf', fontFamily: "'EB Garamond', serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}
    >
      Sign out
    </button>
  )
}
