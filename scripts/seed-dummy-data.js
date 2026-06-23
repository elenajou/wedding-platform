require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function main() {
  const rows = await sql`SELECT id FROM weddings WHERE slug = 'john-sarah' LIMIT 1`
  const wid = rows[0]?.id
  if (!wid) { console.error('No john-sarah wedding found'); process.exit(1) }

  // ── Wedding details ──────────────────────────────────────────────────────
  await sql`
    UPDATE wedding_details SET
      bride_name            = 'Sarah Williams',
      groom_name            = 'John Anderson',
      wedding_date          = '2026-09-12',
      ceremony_time         = '4:00 PM',
      ceremony_location     = 'The Garden Chapel at Rosewood Estate',
      reception_time        = '6:30 PM',
      reception_location    = 'The Grand Ballroom at Rosewood Estate',
      coordinator_name      = 'Claire Beaumont',
      coordinator_email     = 'claire@rosewoodevents.com',
      rsvp_deadline         = '2026-08-01',
      hero_eyebrow          = 'Together at last',
      hero_tagline          = 'Sarah & John',
      hero_greeting         = 'With joy in our hearts',
      hero_body_text        = 'We invite you to celebrate the beginning of our forever. Join us for an evening filled with love, laughter, and dancing under the stars.',
      letter_eyebrow        = 'A note from the couple',
      letter_greeting       = 'Dearest friends and family,',
      letter_body_text      = 'From the moment we met at that tiny coffee shop on Maple Street, we knew something special had begun. Five years, countless adventures, and one very excited golden retriever later — we are finally ready to say "I do." Your presence on our wedding day means the world to us. Come ready to eat, dance, and celebrate love in all its forms.',
      video_source_type     = 'youtube',
      video_source_id       = 'dQw4w9WgXcQ'
    WHERE wedding_id = ${wid}
  `
  console.log('✓ wedding_details updated')

  // ── Tables ───────────────────────────────────────────────────────────────
  const tableNames = [
    ['Magnolia', 8], ['Jasmine', 8], ['Rose', 10], ['Lavender', 6],
    ['Peony', 10], ['Dahlia', 6],
  ]
  for (const [name, capacity] of tableNames) {
    await sql`
      INSERT INTO wedding_tables (wedding_id, name, capacity)
      VALUES (${wid}, ${name}, ${capacity})
      ON CONFLICT DO NOTHING
    `
  }
  console.log('✓ tables seeded')

  // ── Groups ───────────────────────────────────────────────────────────────
  const groupDefs = [
    { name: 'Anderson Family',   seats: 4, passcode: 'ANDERS', lang: 'en' },
    { name: 'Williams Family',   seats: 4, passcode: 'WILLMS', lang: 'en' },
    { name: 'College Friends',   seats: 6, passcode: 'CAMPUS', lang: 'en' },
    { name: 'Work Colleagues',   seats: 4, passcode: 'OFFICE', lang: 'en' },
    { name: 'García Family',     seats: 3, passcode: 'GARCIA', lang: 'es' },
    { name: 'Chen Family',       seats: 2, passcode: 'CHENFM', lang: 'zh' },
  ]
  const groupIds = {}
  for (const g of groupDefs) {
    const r = await sql`
      INSERT INTO invitation_groups (wedding_id, name, allocated_seats, passcode, language)
      VALUES (${wid}, ${g.name}, ${g.seats}, ${g.passcode}, ${g.lang})
      RETURNING id
    `
    groupIds[g.name] = r[0].id
  }
  // keep existing Smith Family group id
  const smithGroup = await sql`SELECT id FROM invitation_groups WHERE wedding_id = ${wid} AND name = 'Smith Family' LIMIT 1`
  groupIds['Smith Family'] = smithGroup[0]?.id
  console.log('✓ groups seeded')

  // ── Guests ───────────────────────────────────────────────────────────────
  // update existing John Smith to sit at Magnolia table
  await sql`UPDATE guests SET table_name = 'Magnolia' WHERE wedding_id = ${wid} AND name = 'John Smith'`

  const guests = [
    // Anderson Family
    { name: 'Robert Anderson',  phone: '+15550101', table: 'Rose',     group: 'Anderson Family', lang: 'en' },
    { name: 'Margaret Anderson',phone: '+15550102', table: 'Rose',     group: 'Anderson Family', lang: 'en' },
    { name: 'Emily Anderson',   phone: '+15550103', table: 'Rose',     group: 'Anderson Family', lang: 'en' },
    { name: 'Tom Anderson',     phone: '+15550104', table: 'Rose',     group: 'Anderson Family', lang: 'en' },
    // Williams Family
    { name: 'David Williams',   phone: '+15550201', table: 'Jasmine',  group: 'Williams Family', lang: 'en' },
    { name: 'Patricia Williams',phone: '+15550202', table: 'Jasmine',  group: 'Williams Family', lang: 'en' },
    { name: 'Laura Williams',   phone: '+15550203', table: 'Jasmine',  group: 'Williams Family', lang: 'en' },
    { name: 'Mark Williams',    phone: '+15550204', table: 'Jasmine',  group: 'Williams Family', lang: 'en' },
    // College Friends
    { name: 'Olivia Bennett',   phone: '+15550301', table: 'Magnolia', group: 'College Friends', lang: 'en' },
    { name: 'Lucas Harper',     phone: '+15550302', table: 'Magnolia', group: 'College Friends', lang: 'en' },
    { name: 'Ava Morrison',     phone: '+15550303', table: 'Magnolia', group: 'College Friends', lang: 'en' },
    { name: 'Noah Clark',       phone: '+15550304', table: 'Magnolia', group: 'College Friends', lang: 'en' },
    { name: 'Sophia Lewis',     phone: '+15550305', table: 'Magnolia', group: 'College Friends', lang: 'en' },
    { name: 'Ethan Walker',     phone: '+15550306', table: 'Lavender', group: 'College Friends', lang: 'en' },
    // Work Colleagues
    { name: 'James Mitchell',   phone: '+15550401', table: 'Lavender', group: 'Work Colleagues', lang: 'en' },
    { name: 'Hannah Reed',      phone: '+15550402', table: 'Lavender', group: 'Work Colleagues', lang: 'en' },
    { name: 'Daniel Price',     phone: '+15550403', table: 'Peony',    group: 'Work Colleagues', lang: 'en' },
    { name: 'Sophie Turner',    phone: '+15550404', table: 'Peony',    group: 'Work Colleagues', lang: 'en' },
    // García Family
    { name: 'Carlos García',    phone: '+15550501', table: 'Peony',    group: 'García Family',   lang: 'es' },
    { name: 'María García',     phone: '+15550502', table: 'Peony',    group: 'García Family',   lang: 'es' },
    { name: 'Lucía García',     phone: '+15550503', table: 'Peony',    group: 'García Family',   lang: 'es' },
    // Chen Family
    { name: 'Wei Chen',         phone: '+15550601', table: 'Dahlia',   group: 'Chen Family',     lang: 'zh' },
    { name: 'Mei Chen',         phone: '+15550602', table: 'Dahlia',   group: 'Chen Family',     lang: 'zh' },
  ]
  for (const g of guests) {
    await sql`
      INSERT INTO guests (wedding_id, group_id, name, phone, table_name, language)
      VALUES (${wid}, ${groupIds[g.group]}, ${g.name}, ${g.phone}, ${g.table}, ${g.lang})
    `
  }
  console.log('✓ guests seeded')

  // ── RSVPs ────────────────────────────────────────────────────────────────
  const rsvps = [
    {
      group: 'Anderson Family', attending: true, count: 4,
      by: 'Robert Anderson',
      message: 'We are so excited for your big day!',
      attendance: [
        { name: 'Robert Anderson',   attending: true },
        { name: 'Margaret Anderson', attending: true },
        { name: 'Emily Anderson',    attending: true },
        { name: 'Tom Anderson',      attending: true },
      ],
    },
    {
      group: 'Williams Family', attending: true, count: 4,
      by: 'David Williams',
      message: 'Cannot wait to celebrate with you both.',
      attendance: [
        { name: 'David Williams',    attending: true },
        { name: 'Patricia Williams', attending: true },
        { name: 'Laura Williams',    attending: true },
        { name: 'Mark Williams',     attending: true },
      ],
    },
    {
      group: 'College Friends', attending: true, count: 5,
      by: 'Olivia Bennett',
      message: 'The whole gang will be there! Cannot wait to hit the dance floor.',
      attendance: [
        { name: 'Olivia Bennett', attending: true },
        { name: 'Lucas Harper',   attending: true },
        { name: 'Ava Morrison',   attending: true },
        { name: 'Noah Clark',     attending: true },
        { name: 'Sophia Lewis',   attending: true },
        { name: 'Ethan Walker',   attending: false },
      ],
    },
    {
      group: 'Work Colleagues', attending: false, count: 0,
      by: 'James Mitchell',
      message: 'So sorry we cannot make it — sending all our love from afar!',
      attendance: [
        { name: 'James Mitchell', attending: false },
        { name: 'Hannah Reed',    attending: false },
        { name: 'Daniel Price',   attending: false },
        { name: 'Sophie Turner',  attending: false },
      ],
    },
    {
      group: 'García Family', attending: true, count: 3,
      by: 'Carlos García',
      message: '¡Estamos muy emocionados de celebrar con ustedes!',
      attendance: [
        { name: 'Carlos García', attending: true },
        { name: 'María García',  attending: true },
        { name: 'Lucía García',  attending: true },
      ],
    },
  ]
  for (const r of rsvps) {
    const gid = groupIds[r.group]
    if (!gid) continue
    await sql`
      INSERT INTO rsvps (wedding_id, group_id, attending, guest_count, rsvped_by, message, guest_attendance)
      VALUES (${wid}, ${gid}, ${r.attending}, ${r.count}, ${r.by}, ${r.message}, ${JSON.stringify(r.attendance)}::jsonb)
    `
  }
  console.log('✓ rsvps seeded')

  // ── Schedule ─────────────────────────────────────────────────────────────
  const schedule = [
    { order: 1, time: '3:30 PM',  iso: '2026-09-12T15:30', name: 'Guest Arrival',      desc: 'Guests are welcomed with a glass of champagne in the garden.' },
    { order: 2, time: '4:00 PM',  iso: '2026-09-12T16:00', name: 'Ceremony',            desc: 'The wedding ceremony takes place in The Garden Chapel.' },
    { order: 3, time: '4:45 PM',  iso: '2026-09-12T16:45', name: 'Cocktail Hour',       desc: 'Enjoy light bites, signature cocktails, and lawn games on the terrace.' },
    { order: 4, time: '6:30 PM',  iso: '2026-09-12T18:30', name: 'Reception Dinner',    desc: 'A sit-down dinner in The Grand Ballroom. Vegetarian options available.' },
    { order: 5, time: '8:00 PM',  iso: '2026-09-12T20:00', name: 'First Dance & Toasts',desc: 'Join us for the first dance, heartfelt toasts, and cutting of the cake.' },
    { order: 6, time: '8:45 PM',  iso: '2026-09-12T20:45', name: 'Dancing',             desc: 'The dance floor opens! Celebrate with us until midnight.' },
  ]
  for (const s of schedule) {
    await sql`
      INSERT INTO wedding_schedule (wedding_id, sort_order, time_label, iso_time, event_name, description)
      VALUES (${wid}, ${s.order}, ${s.time}, ${s.iso}, ${s.name}, ${s.desc})
    `
  }
  console.log('✓ schedule seeded')

  // ── FAQ ──────────────────────────────────────────────────────────────────
  const faq = [
    { order: 1, q: 'What is the dress code?',                  a: 'Garden formal. Think elegant summer dresses, floral prints, and suits in light tones. Leave the stilettos at home — the ceremony is on grass!' },
    { order: 2, q: 'Is the venue wheelchair accessible?',      a: 'Yes. Rosewood Estate has fully accessible paths to both the chapel and the ballroom. Please contact our coordinator Claire if you need any additional assistance.' },
    { order: 3, q: 'Are children welcome?',                    a: 'We love your little ones! Children over the age of 5 are warmly welcome. Due to limited seating, we kindly ask that you list all attending guests in your RSVP.' },
    { order: 4, q: 'Is there parking at the venue?',           a: 'Yes, complimentary parking is available on site. We also recommend the free shuttle from Rosewood Hotel, which runs every 30 minutes from 3:00 PM.' },
    { order: 5, q: 'Can I take photos during the ceremony?',   a: 'We are having an unplugged ceremony — please keep phones and cameras away so everyone can be fully present. Our photographer will capture every moment. Photos are welcome during the reception!' },
    { order: 6, q: 'What if I have dietary restrictions?',     a: 'Please note your dietary needs when you RSVP. We are happy to accommodate vegetarian, vegan, gluten-free, and most common allergies. Contact Claire for anything else.' },
  ]
  for (const f of faq) {
    await sql`
      INSERT INTO wedding_faq (wedding_id, sort_order, question, answer)
      VALUES (${wid}, ${f.order}, ${f.q}, ${f.a})
    `
  }
  console.log('✓ faq seeded')

  // ── Photos ───────────────────────────────────────────────────────────────
  const photos = [
    { order: 1, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', alt: 'Couple at sunset', caption: 'Golden hour at Lake Tahoe' },
    { order: 2, src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', alt: 'Wedding bouquet', caption: 'Garden roses and eucalyptus' },
    { order: 3, src: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800', alt: 'First dance', caption: 'Our rehearsal dinner dance' },
    { order: 4, src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800', alt: 'Engagement photo', caption: 'Central Park, November 2025' },
    { order: 5, src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', alt: 'Venue exterior', caption: 'Rosewood Estate at dusk' },
    { order: 6, src: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800', alt: 'Table setting', caption: 'Magnolia table inspiration' },
  ]
  for (const p of photos) {
    await sql`
      INSERT INTO wedding_photos (wedding_id, sort_order, src, alt, caption)
      VALUES (${wid}, ${p.order}, ${p.src}, ${p.alt}, ${p.caption})
    `
  }
  console.log('✓ photos seeded')

  console.log('\nAll done! Summary:')
  const [t, g, gu, r, s, f, ph] = await Promise.all([
    sql`SELECT COUNT(*) FROM wedding_tables WHERE wedding_id = ${wid}`,
    sql`SELECT COUNT(*) FROM invitation_groups WHERE wedding_id = ${wid}`,
    sql`SELECT COUNT(*) FROM guests WHERE wedding_id = ${wid}`,
    sql`SELECT COUNT(*) FROM rsvps WHERE wedding_id = ${wid}`,
    sql`SELECT COUNT(*) FROM wedding_schedule WHERE wedding_id = ${wid}`,
    sql`SELECT COUNT(*) FROM wedding_faq WHERE wedding_id = ${wid}`,
    sql`SELECT COUNT(*) FROM wedding_photos WHERE wedding_id = ${wid}`,
  ])
  console.log(`  Tables: ${t[0].count}  Groups: ${g[0].count}  Guests: ${gu[0].count}  RSVPs: ${r[0].count}  Schedule: ${s[0].count}  FAQ: ${f[0].count}  Photos: ${ph[0].count}`)
}

main().catch(err => { console.error(err); process.exit(1) })
