'use client'

import { useState, useEffect, useRef } from 'react'
import SignOutButton from '@/app/dashboard/_SignOutButton'

type Props = {
  tabs: string[]
  currentTab: string
  labels: Record<string, string>
}

export default function DashboardNav({ tabs, currentTab, labels }: Props) {
  const [open, setOpen] = useState(false)
  const [hamburger, setHamburger] = useState(false)
  // Probe is always in the DOM (position:absolute, invisible) so we can always measure
  const probeRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    function check() {
      if (!probe) return
      setHamburger(probe.scrollWidth > probe.clientWidth + 1)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(probe)
    return () => ro.disconnect()
  }, [tabs])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const linkStyle = (t: string): React.CSSProperties => ({
    fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
    color: t === currentTab ? '#201d19' : '#7a6e5f',
    textDecoration: 'none',
    borderBottom: t === currentTab ? '1px solid #201d19' : 'none',
    paddingBottom: 2, whiteSpace: 'nowrap',
  })

  return (
    <nav style={{
      borderBottom: '0.5px solid #e0d8c8',
      padding: '0.75rem 2rem',
      display: 'flex', alignItems: 'center', gap: '1.5rem',
      background: '#fff', position: 'relative',
    }}>

      {/* Hidden probe — always in DOM at the same width as the tab area.
          right: 110px reserves space for SignOutButton + gap. */}
      <div
        ref={probeRef}
        aria-hidden="true"
        style={{
          position: 'absolute', left: '2rem', right: 110,
          display: 'flex', gap: '1.5rem', flexWrap: 'nowrap',
          overflow: 'hidden', visibility: 'hidden', pointerEvents: 'none',
        }}
      >
        {tabs.map(t => (
          <span key={t} style={{ fontSize: 11, letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>
            {labels[t] ?? t}
          </span>
        ))}
      </div>

      {hamburger ? (
        /* ── Compact mode ── */
        <>
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setOpen(o => !o)}
              aria-label="Menú de navegación"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 6px', display: 'flex', flexDirection: 'column',
                gap: 4, alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{ display: 'block', width: 18, height: 1.5, background: '#201d19', borderRadius: 1 }} />
              ))}
            </button>

            {open && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: '#fff', border: '0.5px solid #e0d8c8',
                borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                zIndex: 100, minWidth: 160, padding: '6px 0',
              }}>
                {tabs.map(t => (
                  <a
                    key={t}
                    href={`/dashboard/${t}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block', padding: '9px 18px',
                      fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                      textDecoration: 'none',
                      color: t === currentTab ? '#b08d57' : '#201d19',
                      background: t === currentTab ? '#faf7f2' : 'transparent',
                      fontFamily: "'EB Garamond', serif",
                    }}
                  >
                    {labels[t] ?? t}
                  </a>
                ))}
              </div>
            )}
          </div>

          <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#201d19', flex: 1 }}>
            {labels[currentTab] ?? currentTab}
          </span>
        </>
      ) : (
        /* ── Inline mode ── */
        <>
          {tabs.map(t => (
            <a key={t} href={`/dashboard/${t}`} style={linkStyle(t)}>
              {labels[t] ?? t}
            </a>
          ))}
          <span style={{ flex: 1 }} />
        </>
      )}

      <SignOutButton />
    </nav>
  )
}
