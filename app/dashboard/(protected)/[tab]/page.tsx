import { notFound } from 'next/navigation'
import { getDashboardSession } from '@/lib/auth'
import { getWeddingConfigById } from '@/lib/tenant'
import { sql } from '@/lib/db'
import SignOutButton from '@/app/dashboard/_SignOutButton'
import WeddingTab from '@/app/dashboard/_tabs/WeddingTab'
import TablesTab from '@/app/dashboard/_tabs/TablesTab'
import GroupsTab from '@/app/dashboard/_tabs/GroupsTab'
import GuestsTab from '@/app/dashboard/_tabs/GuestsTab'
import RsvpsTab from '@/app/dashboard/_tabs/RsvpsTab'
import ScheduleTab from '@/app/dashboard/_tabs/ScheduleTab'
import FaqTab from '@/app/dashboard/_tabs/FaqTab'
import PhotosTab from '@/app/dashboard/_tabs/PhotosTab'
import ThemeTab from '@/app/dashboard/_tabs/ThemeTab'

type Props = { params: Promise<{ tab: string }> }

const BASE_TABS = ['wedding', 'tables', 'groups', 'guests', 'theme']

const nav: React.CSSProperties = {
  borderBottom: '0.5px solid #e0d8c8',
  padding: '0.75rem 2rem',
  display: 'flex',
  gap: '1.5rem',
  overflowX: 'auto',
  alignItems: 'center',
  background: '#fff',
}

export default async function DashboardTabPage({ params }: Props) {
  const { tab } = await params
  const session = await getDashboardSession()
  if (!session) notFound()

  const config = await getWeddingConfigById(session.weddingId)
  if (!config) notFound()

  const wid = session.weddingId

  const allowedTabs = [
    ...BASE_TABS,
    ...(config.features.rsvp ? ['rsvps'] : []),
    ...(config.features.schedule ? ['schedule'] : []),
    ...(config.features.faq ? ['faq'] : []),
    ...(config.features.gallery ? ['photos'] : []),
    ...(config.features.videoSection ? ['video'] : []),
  ]

  if (!allowedTabs.includes(tab)) notFound()

  // Fetch initial data server-side so the page arrives pre-populated
  let content: React.ReactNode = null

  if (tab === 'wedding') {
    const rows = await sql`SELECT * FROM wedding_details WHERE wedding_id = ${wid} LIMIT 1`
    content = <WeddingTab initialData={rows[0] ?? null} />
  } else if (tab === 'tables') {
    const rows = await sql`SELECT * FROM wedding_tables WHERE wedding_id = ${wid} ORDER BY created_at`
    content = <TablesTab initialItems={rows as any[]} />
  } else if (tab === 'groups') {
    const rows = await sql`SELECT * FROM invitation_groups WHERE wedding_id = ${wid} ORDER BY created_at`
    content = <GroupsTab initialItems={rows as any[]} />
  } else if (tab === 'guests') {
    const [guestRows, groupRows] = await Promise.all([
      sql`SELECT g.*, ig.name AS group_name FROM guests g LEFT JOIN invitation_groups ig ON ig.id = g.group_id WHERE g.wedding_id = ${wid} ORDER BY g.created_at`,
      sql`SELECT id, name FROM invitation_groups WHERE wedding_id = ${wid} ORDER BY name`,
    ])
    content = <GuestsTab initialItems={guestRows as any[]} groups={groupRows as any[]} />
  } else if (tab === 'rsvps') {
    const rows = await sql`SELECT r.*, ig.name AS group_name, ig.allocated_seats FROM rsvps r LEFT JOIN invitation_groups ig ON ig.id = r.group_id WHERE r.wedding_id = ${wid} ORDER BY r.created_at DESC`
    content = <RsvpsTab initialItems={rows as any[]} />
  } else if (tab === 'schedule') {
    const rows = await sql`SELECT * FROM wedding_schedule WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <ScheduleTab initialItems={rows as any[]} />
  } else if (tab === 'faq') {
    const rows = await sql`SELECT * FROM wedding_faq WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <FaqTab initialItems={rows as any[]} />
  } else if (tab === 'photos') {
    const rows = await sql`SELECT * FROM wedding_photos WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <PhotosTab initialItems={rows as any[]} />
  } else if (tab === 'theme') {
    const [sectionRows, detailRows] = await Promise.all([
      sql`SELECT * FROM section_config WHERE wedding_id = ${wid} ORDER BY sort_order`,
      sql`SELECT * FROM wedding_details WHERE wedding_id = ${wid} LIMIT 1`,
    ])
    const activeSectionKeys = [
      'envelope', 'hero',
      ...(config.features.countdown ? ['countdown'] : []),
      ...(config.features.seatingCard ? ['seating'] : []),
      ...(config.features.rsvp ? ['rsvp'] : []),
      ...(config.features.schedule ? ['schedule'] : []),
      ...(config.features.videoSection ? ['video'] : []),
      ...(config.features.gallery ? ['gallery'] : []),
      ...(config.features.faq ? ['faq'] : []),
    ]
    content = (
      <ThemeTab
        initialSections={sectionRows as any[]}
        enabledDesigns={config.enabledDesigns}
        activeSectionKeys={activeSectionKeys}
        weddingDetails={detailRows[0] as any ?? null}
      />
    )
  }

  return (
    <main style={{ minHeight: '100svh', background: '#faf7f2', fontFamily: "'EB Garamond', serif" }}>
      <nav style={nav}>
        {allowedTabs.map(t => (
          <a key={t} href={`/dashboard/${t}`} style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: t === tab ? '#201d19' : '#7a6e5f', textDecoration: 'none',
            borderBottom: t === tab ? '1px solid #201d19' : 'none',
            paddingBottom: 2, whiteSpace: 'nowrap',
          }}>
            {t}
          </a>
        ))}
        <span style={{ flex: 1 }} />
        <SignOutButton />
      </nav>
      <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>
        {content}
      </div>
    </main>
  )
}
