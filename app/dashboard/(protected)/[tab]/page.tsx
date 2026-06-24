import { notFound } from 'next/navigation'
import { getDashboardSession } from '@/lib/auth'
import { getWeddingConfigById } from '@/lib/tenant'
import { sql } from '@/lib/db'
import { dt } from '@/lib/dashboard-i18n'
import DashboardNav from '@/app/dashboard/_DashboardNav'
import WeddingTab from '@/app/dashboard/_tabs/WeddingTab'
import TablesTab from '@/app/dashboard/_tabs/TablesTab'
import GroupsTab from '@/app/dashboard/_tabs/GroupsTab'
import GuestsTab from '@/app/dashboard/_tabs/GuestsTab'
import RsvpsTab from '@/app/dashboard/_tabs/RsvpsTab'
import ScheduleTab from '@/app/dashboard/_tabs/ScheduleTab'
import FaqTab from '@/app/dashboard/_tabs/FaqTab'
import PhotosTab from '@/app/dashboard/_tabs/PhotosTab'
import ThemeTab from '@/app/dashboard/_tabs/ThemeTab'
import HelpTab from '@/app/dashboard/_tabs/HelpTab'
import LocationTab from '@/app/dashboard/_tabs/LocationTab'

type Props = { params: Promise<{ tab: string }> }

const BASE_TABS = ['wedding', 'tables', 'groups', 'guests']

export default async function DashboardTabPage({ params }: Props) {
  const { tab } = await params
  const session = await getDashboardSession()
  if (!session) notFound()

  const config = await getWeddingConfigById(session.weddingId)
  if (!config) notFound()

  const wid = session.weddingId
  const locale = config.dashboardLocale ?? 'es'

  const TAB_LABELS: Record<string, string> = {
    wedding:  dt('tabWedding', locale),
    tables:   dt('tabTables', locale),
    groups:   dt('tabGroups', locale),
    guests:   dt('tabGuests', locale),
    theme:    dt('tabTheme', locale),
    rsvps:    dt('tabRsvps', locale),
    schedule: dt('tabSchedule', locale),
    faq:      dt('tabFaq', locale),
    photos:   dt('tabPhotos', locale),
    video:    dt('tabVideo', locale),
    help:     dt('tabHelp', locale),
    location: dt('tabLocation', locale),
  }

  const allowedTabs = [
    ...BASE_TABS,
    ...(config.features.rsvp ? ['rsvps'] : []),
    ...(config.features.schedule ? ['schedule'] : []),
    ...(config.features.faq ? ['faq'] : []),
    ...(config.features.gallery ? ['photos'] : []),
    ...(config.features.videoSection ? ['video'] : []),
    ...(config.features.maps ? ['location'] : []),
    'theme',
    'help',
  ]

  if (!allowedTabs.includes(tab)) notFound()

  let content: React.ReactNode = null

  if (tab === 'wedding') {
    const rows = await sql`SELECT * FROM wedding_details WHERE wedding_id = ${wid} LIMIT 1`
    content = <WeddingTab initialData={rows[0] ?? null} locales={config.locales} defaultLocale={config.defaultLocale} locale={locale} />
  } else if (tab === 'tables') {
    const rows = await sql`SELECT * FROM wedding_tables WHERE wedding_id = ${wid} ORDER BY created_at`
    content = <TablesTab initialItems={rows as any[]} locale={locale} />
  } else if (tab === 'groups') {
    const rows = await sql`SELECT * FROM invitation_groups WHERE wedding_id = ${wid} ORDER BY created_at`
    content = <GroupsTab initialItems={rows as any[]} locale={locale} />
  } else if (tab === 'guests') {
    const [guestRows, groupRows] = await Promise.all([
      sql`SELECT g.*, ig.name AS group_name FROM guests g LEFT JOIN invitation_groups ig ON ig.id = g.group_id WHERE g.wedding_id = ${wid} ORDER BY g.created_at`,
      sql`SELECT id, name FROM invitation_groups WHERE wedding_id = ${wid} ORDER BY name`,
    ])
    content = <GuestsTab initialItems={guestRows as any[]} groups={groupRows as any[]} locale={locale} />
  } else if (tab === 'rsvps') {
    const rows = await sql`SELECT r.*, ig.name AS group_name, ig.allocated_seats FROM rsvps r LEFT JOIN invitation_groups ig ON ig.id = r.group_id WHERE r.wedding_id = ${wid} ORDER BY r.created_at DESC`
    content = <RsvpsTab initialItems={rows as any[]} locale={locale} />
  } else if (tab === 'schedule') {
    const rows = await sql`SELECT * FROM wedding_schedule WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <ScheduleTab initialItems={rows as any[]} locales={config.locales} defaultLocale={config.defaultLocale} locale={locale} />
  } else if (tab === 'faq') {
    const rows = await sql`SELECT * FROM wedding_faq WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <FaqTab initialItems={rows as any[]} locales={config.locales} defaultLocale={config.defaultLocale} locale={locale} />
  } else if (tab === 'photos') {
    const rows = await sql`SELECT * FROM wedding_photos WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <PhotosTab initialItems={rows as any[]} locale={locale} />
  } else if (tab === 'location') {
    const rows = await sql`SELECT * FROM wedding_locations WHERE wedding_id = ${wid} ORDER BY sort_order`
    content = <LocationTab initialItems={rows as any[]} locale={locale} />
  } else if (tab === 'help') {
    content = <HelpTab />
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
      ...(config.features.maps ? ['location'] : []),
    ]
    content = (
      <ThemeTab
        initialSections={sectionRows as any[]}
        enabledDesigns={config.enabledDesigns}
        activeSectionKeys={activeSectionKeys}
        weddingDetails={detailRows[0] as any ?? null}
        locale={locale}
      />
    )
  }

  return (
    <main style={{ minHeight: '100svh', background: '#faf7f2', fontFamily: "'EB Garamond', serif" }}>
      <DashboardNav tabs={allowedTabs} currentTab={tab} labels={TAB_LABELS} />
      <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>
        {content}
      </div>
    </main>
  )
}
