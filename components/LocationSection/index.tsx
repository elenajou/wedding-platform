import type { LocationItem } from '@/lib/wedding-data'
import { buildGoogleFontsUrl } from '@/lib/google-fonts'
import styles from './LocationSection.module.css'

type Dict = {
  sectionLabel: string
  openInWaze: string
}

type Props = {
  locations: LocationItem[]
  dict: Dict
  design?: string
}

export default function LocationSection({ locations, dict, design }: Props) {
  if (!locations.length) return null

  return (
    <section className={`${styles.root} ${design ? styles[`design_${design}`] ?? '' : ''}`}>
      <div className={styles.inner}>
        <p className={styles.sectionLabel}>{dict.sectionLabel}</p>
        <div className={styles.ornament}>
          <div className={styles.ornamentLine} />
          <div className={styles.ornamentDiamond} />
          <div className={styles.ornamentLine} />
        </div>

        <div className={styles.cards}>
          {locations.map((loc) => (
            <div key={loc.id} className={styles.card}>
              {loc.font_title && <link rel="stylesheet" href={buildGoogleFontsUrl([loc.font_title])} precedence="default" />}
              {loc.font_description && loc.font_description !== loc.font_title && <link rel="stylesheet" href={buildGoogleFontsUrl([loc.font_description])} precedence="default" />}
              {loc.image_url && (
                <img src={loc.image_url} alt={loc.title} className={styles.cardImage} />
              )}
              <p className={styles.cardTitle} style={{
                ...(loc.font_title ? { fontFamily: `'${loc.font_title}', serif` } : {}),
                ...(loc.color_title ? { color: loc.color_title } : {}),
                ...(loc.size_title ? { fontSize: loc.size_title } : {}),
                ...(loc.spacing_title ? { letterSpacing: loc.spacing_title } : {}),
                ...(loc.italic_title ? { fontStyle: 'italic' } : {}),
                ...(loc.bold_title ? { fontWeight: 700 } : {}),
              }}>{loc.title}</p>
              {loc.address && <p className={styles.cardAddress}>{loc.address}</p>}
              {loc.description && <p className={styles.cardDescription} style={{
                ...(loc.font_description ? { fontFamily: `'${loc.font_description}', serif` } : {}),
                ...(loc.color_description ? { color: loc.color_description } : {}),
                ...(loc.size_description ? { fontSize: loc.size_description } : {}),
                ...(loc.spacing_description ? { letterSpacing: loc.spacing_description } : {}),
                ...(loc.italic_description ? { fontStyle: 'italic' } : {}),
                ...(loc.bold_description ? { fontWeight: 700 } : {}),
              }}>{loc.description}</p>}

              {loc.embed_url && (
                <div className={styles.mapWrap}>
                  <iframe
                    src={loc.embed_url}
                    className={styles.mapFrame}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={loc.title}
                  />
                </div>
              )}

              {loc.waze_link && (
                <div className={styles.ctaRow}>
                  <a
                    href={loc.waze_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.ctaBtn} ${styles.ctaBtnWaze}`}
                  >
                    {dict.openInWaze}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
