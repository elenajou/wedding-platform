import type { LocationItem } from '@/lib/wedding-data'
import styles from './LocationSection.module.css'

type Dict = {
  sectionLabel: string
  openInGoogleMaps: string
  openInWaze: string
}

type Props = {
  locations: LocationItem[]
  dict: Dict
  design?: string
}

function mapsEmbedUrl(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
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
              <p className={styles.cardTitle}>{loc.title}</p>
              <p className={styles.cardAddress}>{loc.address}</p>

              {loc.address && (
                <div className={styles.mapWrap}>
                  <iframe
                    src={mapsEmbedUrl(loc.address)}
                    className={styles.mapFrame}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={loc.title}
                  />
                </div>
              )}

              <div className={styles.ctaRow}>
                {loc.maps_link && (
                  <a
                    href={loc.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaBtn}
                  >
                    {dict.openInGoogleMaps}
                  </a>
                )}
                {loc.waze_link && (
                  <a
                    href={loc.waze_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.ctaBtn} ${styles.ctaBtnWaze}`}
                  >
                    {dict.openInWaze}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
