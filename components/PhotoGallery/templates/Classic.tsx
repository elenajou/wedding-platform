'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { t } from '@/lib/i18n'
import styles from '../PhotoGallery.module.css'
import type { GalleryTemplateProps } from './types'

export default function Classic({ dict }: GalleryTemplateProps) {
  const photos = dict.photos ?? []
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollY = useRef(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const dismissing = useRef(false)

  const closeLightbox = useCallback(() => { dismissing.current = false; setDragY(0); setIsDragging(false); setLightboxIndex(null) }, [])
  const prev = useCallback(() => setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i)), [])
  const next = useCallback(() => setLightboxIndex(i => (i !== null && i < photos.length - 1 ? i + 1 : i)), [photos.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, prev, next, closeLightbox])

  useEffect(() => {
    if (lightboxIndex === null) return
    scrollY.current = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY.current}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY.current)
    }
  }, [lightboxIndex])

  useEffect(() => { setDragY(0); setIsDragging(false); dismissing.current = false }, [lightboxIndex])

  function handleTouchStart(e: React.TouchEvent) {
    if (dismissing.current) return
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    setIsDragging(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dismissing.current) return
    e.preventDefault()
    setDragY(e.touches[0].clientY - touchStartY.current)
  }

  function handleTouchEnd() {
    if (dismissing.current) return
    const elapsed = Date.now() - touchStartTime.current
    const velocity = Math.abs(dragY) / Math.max(elapsed, 1)
    if (Math.abs(dragY) > 100 || velocity > 0.5) {
      dismissing.current = true; setIsDragging(false)
      setDragY(dragY > 0 ? window.innerHeight : -window.innerHeight)
      setTimeout(closeLightbox, 280)
    } else { setIsDragging(false); setDragY(0) }
  }

  if (photos.length === 0) return null
  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null
  const dragProgress = Math.min(Math.abs(dragY) / 250, 1)

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{dict.title}</p>
      <p className={styles.sectionSub}>{dict.subtitle}</p>
      <div className={styles.grid}>
        {photos.map((photo, i) => (
          <div key={i} className={styles.photoItem} onClick={() => setLightboxIndex(i)}>
            <img src={photo.src} alt={photo.alt} className={styles.photo} loading="lazy" />
            {photo.caption && <span className={styles.caption}>{photo.caption}</span>}
          </div>
        ))}
      </div>
      {activePhoto && createPortal(
        <div className={styles.lightbox} style={{ background: `rgba(30,26,22,${0.95*(1-dragProgress*0.85)})` }} onClick={!isDragging && !dismissing.current ? closeLightbox : undefined}>
          <button className={styles.lightboxClose} onClick={closeLightbox} style={{ opacity: 1 - dragProgress }}>{dict.close}</button>
          <div className={styles.lightboxContent} style={{ transform: `translateY(${dragY}px)`, transition: isDragging || dismissing.current ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)', opacity: 1 - dragProgress * 0.6 }}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onClick={e => e.stopPropagation()}>
            <img src={activePhoto.src} alt={activePhoto.alt} className={styles.lightboxImg} />
            {activePhoto.caption && <p className={styles.lightboxCaption}>{activePhoto.caption}</p>}
            <div className={styles.lightboxNav}>
              <button className={styles.lightboxNavBtn} onClick={prev} disabled={lightboxIndex === 0}>{dict.previous}</button>
              <button className={styles.lightboxNavBtn} onClick={next} disabled={lightboxIndex === photos.length - 1}>{dict.next}</button>
            </div>
            <p className={styles.photoCount}>{t(dict.countOf, { current: (lightboxIndex ?? 0) + 1, total: photos.length })}</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
