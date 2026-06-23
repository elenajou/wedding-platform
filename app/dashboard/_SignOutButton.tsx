'use client'

export default function SignOutButton() {
  async function handleSignOut() {
    await fetch('/api/auth/dashboard', { method: 'DELETE' })
    window.location.href = '/dashboard/login'
  }

  return (
    <button
      onClick={handleSignOut}
      style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4b4331', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', fontFamily: "'EB Garamond', serif" }}
    >
      Sign out
    </button>
  )
}
