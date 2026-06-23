'use client'

import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react'

type Props = {
  children: ReactNode
  backgroundUrl?: string
  backgroundColor?: string
  fontColor?: string
  overlayOpacity?: number
  eagerBackground?: boolean
  transitionDuration?: number
  backgroundDelay?: number
}

export default function FadeIn({ children, backgroundUrl, backgroundColor, fontColor, overlayOpacity = 0.32, eagerBackground = false, transitionDuration, backgroundDelay }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style: CSSProperties & Record<string, string> = {}
  if (backgroundUrl) {
    style.backgroundImage = `url(${backgroundUrl})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.position = 'relative'
  }
  if (backgroundColor) style.backgroundColor = backgroundColor
  if (fontColor) style['--section-color'] = fontColor
  if (backgroundDelay !== undefined) {
    style.animationDelay = `${backgroundDelay}s`
    style.animationFillMode = 'both'
  }

  const showFadeBg = !eagerBackground || backgroundDelay !== undefined

  return (
    <div ref={ref} className={showFadeBg ? 'fade-bg' : undefined} style={style}>
      {backgroundUrl && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: overlayOpacity >= 0
            ? `rgba(0,0,0,${overlayOpacity})`
            : `rgba(255,255,255,${Math.abs(overlayOpacity)})`,
        }} />
      )}
      <div
        className={`fade-section${visible ? ' visible' : ''}`}
        style={{
          ...(backgroundUrl ? { position: 'relative', zIndex: 1 } : undefined),
          ...(transitionDuration ? { transition: `opacity ${transitionDuration}s ease, transform ${transitionDuration}s ease` } : undefined),
        }}
      >
        {children}
      </div>
    </div>
  )
}
