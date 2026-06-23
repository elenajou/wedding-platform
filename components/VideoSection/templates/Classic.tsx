'use client'
import { useState } from 'react'
import Image from 'next/image'
import styles from '../VideoSection.module.css'
import { type VideoTemplateProps, getEmbedSrc } from './types'

export default function Classic({ source, posterUrl, dict }: VideoTemplateProps) {
  const [playing, setPlaying] = useState(false)
  const embedSrc = getEmbedSrc(source)

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{dict.title}</p>
      <div className={styles.videoWrap}>
        {!playing ? (
          <div className={styles.thumbnail} onClick={() => setPlaying(true)}>
            {posterUrl && <Image src={posterUrl} alt="Video thumbnail" fill className={styles.thumbnailImg} sizes="(max-width: 768px) 100vw, 680px" priority={false} />}
            <div className={styles.playOverlay}>
              <div className={styles.playBtn}><div className={styles.playTriangle} /></div>
              <span className={styles.playLabel}>{dict.playLabel}</span>
            </div>
          </div>
        ) : source.type === 'self' ? (
          <div className={styles.iframeWrap}><video src={embedSrc} controls autoPlay preload="none" style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        ) : (
          <div className={styles.iframeWrap}><iframe src={embedSrc} allow="autoplay; encrypted-media; fullscreen" allowFullScreen loading="lazy" /></div>
        )}
        <p className={styles.dataNote}>{playing ? dict.dataNotePlaying : dict.dataNoteIdle}</p>
      </div>
    </section>
  )
}
