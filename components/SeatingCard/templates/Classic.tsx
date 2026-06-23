import { t } from '@/lib/i18n'
import styles from '../SeatingCard.module.css'
import type { SeatingTemplateProps } from './types'

export default function Classic({ guestName, groupName, tableName, allocatedSeats = 1, groupMembers = [], dict }: SeatingTemplateProps) {
  if (!tableName && !groupName) return null

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{dict.sectionLabel}</p>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.tableLabel}>{dict.tableLabel}</p>
          <p className={styles.tableName}>{tableName ?? dict.tableTBC}</p>
          <div className={styles.rule}>
            <div className={styles.ruleLine} /><div className={styles.ruleDot} /><div className={styles.ruleLine} />
          </div>
        </div>
        <div className={styles.cardBody}>
          {groupName && <p className={styles.groupName}>{groupName}</p>}
          {groupMembers.length > 0 && (
            <>
              <p className={styles.membersLabel}>{dict.membersLabel}</p>
              <ul className={styles.memberList}>
                {groupMembers.map((member, i) => {
                  const memberName = typeof member === 'string' ? member : member.name
                  const memberTableName = typeof member === 'string' ? null : member.tableName
                  const isYou = guestName && memberName.toLowerCase() === guestName.toLowerCase()
                  return (
                    <li key={i} className={styles.memberItem}>
                      <span className={styles.memberDot} />
                      {memberName}
                      {isYou && <span className={styles.youBadge}>{dict.youBadge}</span>}
                      {!isYou && memberTableName && <span className={styles.memberTable}>{memberTableName}</span>}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          <div className={styles.seatsFooter}>
            <p className={styles.seatsText} dangerouslySetInnerHTML={{ __html: t(allocatedSeats === 1 ? dict.seatsTextSingular : dict.seatsTextPlural, { count: allocatedSeats }) }} />
            <div>
              <span className={styles.seatsCount}>{allocatedSeats}</span>
              <span className={styles.seatsUnit}>{allocatedSeats === 1 ? dict.seatSingular : dict.seatPlural}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
