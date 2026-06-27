import type { DressCodeItem } from '@/lib/wedding-data'
import styles from './DressCode.module.css'

type Dict = {
  sectionLabel: string
}

type Props = {
  items: DressCodeItem[]
  dict: Dict
  locale?: string
  design?: string
}

export default function DressCode({ items, dict, locale, design }: Props) {
  if (!items.length) return null

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
          {items.map(item => {
            const title = (locale && item.locale_content?.[locale]?.title) || item.title
          const description = (locale && item.locale_content?.[locale]?.description) || item.description
            const urls: string[] = Array.isArray(item.image_urls) ? item.image_urls : []
            return (
              <div key={item.id} className={styles.card}>
                {urls.length > 0 && (
                  <div className={`${styles.imageRow} ${urls.length === 1 ? styles.imageRowSingle : ''}`}>
                    {urls.slice(0, 2).map((url, i) => (
                      <img key={i} src={url} alt={item.title} className={styles.cardImage} />
                    ))}
                  </div>
                )}
                <p className={styles.cardTitle}>{title}</p>
                {description && <p className={styles.cardDescription}>{description}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
