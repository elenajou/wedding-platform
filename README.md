# Wedding Platform

Multi-tenant wedding invitation SaaS. One codebase serves many couples — each with their own domain, theme, language, and feature set.

Built with Next.js 16 (App Router), NeonDB, and Firebase App Hosting.

---

## Prerequisites

- Node.js 20+
- A [NeonDB](https://neon.tech) project (free tier works)
- npm

---

## 1. Clone and install

```bash
git clone <your-repo-url>
cd wedding-platform
npm install
```

---

## 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```env
# NeonDB — get this from your Neon project dashboard → Connection string
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Super-admin password (protects /super-admin)
SUPER_ADMIN_PASSWORD=choose-a-strong-password

# JWT secret for couple dashboard sessions (min 32 random characters)
DASHBOARD_JWT_SECRET=generate-with-openssl-rand-base64-32

# Your platform's root domain (used for subdomain routing in production)
PLATFORM_DOMAIN=platform.com
```

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

---

## 3. Run the database schema

This creates all tables in your Neon database. Run it once on a fresh project:

```bash
node -e "
const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)
const fs = require('fs')
const schema = fs.readFileSync('sql/schema.sql', 'utf8')
const stmts = schema.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.replace(/--[^\n]*/g,'').trim().match(/^\s*$/))
;(async () => {
  for (const stmt of stmts) {
    try { await sql.query(stmt) } catch(e) { if (!e.message.includes('already exists')) console.error(e.message) }
  }
  console.log('Schema applied.')
})()
"
```

---

## 4. Seed a local dev wedding

The app resolves tenants by the `Host` header. In local dev, the host is `localhost`, so create a wedding with slug `localhost`:

```bash
node -e "
const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)
;(async () => {
  const rows = await sql\`
    INSERT INTO weddings (slug, domains, default_locale, locales, active,
      feature_rsvp, feature_countdown, feature_gallery, feature_schedule,
      feature_faq, feature_seating_card, feature_video_section,
      dashboard_password_hash)
    VALUES ('localhost', ARRAY[]::text[], 'en', ARRAY['en','es','zh'],
      true, true, true, false, true, true, true, false, '')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id, slug
  \`
  if (!rows[0]) { console.log('Already exists.'); return }
  await sql\`INSERT INTO wedding_details (wedding_id, bride_name, groom_name) VALUES (\${rows[0].id}, 'Bride', 'Groom')\`
  const sections = ['hero','countdown','seating','rsvp','schedule','faq']
  for (const [i, key] of sections.entries()) {
    await sql\`INSERT INTO section_config (wedding_id, section_key, sort_order, design, color_scheme) VALUES (\${rows[0].id}, \${key}, \${i * 10}, 'Classic', 'Gold') ON CONFLICT (wedding_id, section_key) DO NOTHING\`
  }
  console.log('Seeded. Wedding ID:', rows[0].id)
})()
"
```

---

## 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or 3000 if the port is free).

---

## How tenant routing works

| Request host | How it resolves |
|---|---|
| `localhost:3001` | Slug match: `localhost` |
| `john-sarah.platform.com` | Slug match: `john-sarah` |
| `johnandsarah.com` | Exact domain match in `domains[]` |

The proxy (`proxy.ts`) reads the `Host` header on every request, looks up the matching wedding from the in-memory cache (refreshed every 5 minutes from the `weddings` table), and injects `x-wedding-id` into request headers. All server components and API routes read from that header — no prop drilling, no cookies for tenant identity.

---

## Adding a new wedding (production)

Use the super-admin dashboard at `/super-admin`, or call the API directly:

```bash
curl -X POST https://your-domain/api/super-admin/weddings \
  -H "Content-Type: application/json" \
  -H "Cookie: super_admin_session=<your-session-cookie>" \
  -d '{
    "slug": "john-sarah",
    "domains": ["johnandsarah.com"],
    "defaultLocale": "en",
    "locales": ["en", "es"],
    "dashboardPassword": "couple-password",
    "features": {
      "rsvp": true, "countdown": true, "gallery": true,
      "schedule": true, "faq": true, "seatingCard": true,
      "videoSection": false, "guestbook": false, "maps": false, "qrCode": false
    }
  }'
```

This creates the `weddings` row and seeds an empty `wedding_details` row. The couple can then log in at `/dashboard` with their slug and password.

---

## Dashboards

### Super-admin — `/super-admin`

Elena's platform dashboard. Manages all weddings.

| URL | What it does |
|---|---|
| `/super-admin/login` | Sign in with `SUPER_ADMIN_PASSWORD` |
| `/super-admin` | List all weddings |
| `/super-admin/weddings/new` | Create a new wedding |
| `/super-admin/weddings/[id]` | Edit features, domains, locales, password |

Auth: `SUPER_ADMIN_PASSWORD` env var → HTTP-only `super_admin_session` cookie.

---

### Couple dashboard — `/dashboard`

Per-couple admin scoped to their wedding. Tabs shown depend on which features are enabled for that wedding.

| URL | What it does |
|---|---|
| `/dashboard/login` | Sign in with slug + password |
| `/dashboard/wedding` | Edit wedding details (names, date, venue, video, etc.) |
| `/dashboard/tables` | Manage seating tables |
| `/dashboard/groups` | Manage invitation groups + passcodes |
| `/dashboard/guests` | Manage guest list |
| `/dashboard/rsvps` | View RSVP responses *(requires `rsvp: true`)* |
| `/dashboard/schedule` | Edit day-of schedule *(requires `schedule: true`)* |
| `/dashboard/faq` | Edit FAQ items *(requires `faq: true`)* |
| `/dashboard/photos` | Manage gallery photos *(requires `gallery: true`)* |
| `/dashboard/video` | Edit video source *(requires `videoSection: true`)* |

Auth: slug + password → JWT `dashboard_session` cookie (7-day expiry).

---

## API Reference

All API routes are scoped to the current tenant via the `x-wedding-id` request header set by the proxy. You never pass a wedding ID in the request body.

### Public (no auth required)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/lookup` | `{ phone?, passcode?, lang? }` | Look up guest by phone or group passcode |
| `POST` | `/api/rsvp` | `{ groupId, attending, guestCount, guestAttendance?, message?, rsvpedBy? }` | Submit RSVP |

### Auth

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/dashboard` | `{ slug, password }` | Log in to couple dashboard → sets `dashboard_session` cookie |
| `DELETE` | `/api/auth/dashboard` | — | Log out of couple dashboard |
| `POST` | `/api/auth/super-admin` | `{ password }` | Log in to super-admin → sets `super_admin_session` cookie |
| `DELETE` | `/api/auth/super-admin` | — | Log out of super-admin |

### Couple dashboard (requires `dashboard_session` cookie)

**Wedding details**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/wedding-details` | — | Get current wedding details row |
| `PUT` | `/api/dashboard/wedding-details` | any `wedding_details` fields | Update wedding details (partial — unset fields keep existing value) |

**Section config**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/sections` | — | List all section configs ordered by `sort_order` |
| `PUT` | `/api/dashboard/sections` | `[{ id, sort_order, design?, color_scheme?, background_url?, background_color?, font_color?, overlay_opacity? }]` | Bulk update section configs |

**Groups**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/groups` | — | List all invitation groups |
| `POST` | `/api/dashboard/groups` | `{ name, allocated_seats, passcode?, language? }` | Create group |
| `PUT` | `/api/dashboard/groups/[id]` | `{ name, allocated_seats, passcode?, language? }` | Update group |
| `DELETE` | `/api/dashboard/groups/[id]` | — | Delete group |

**Guests**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/guests` | — | List all guests (includes `group_name`) |
| `POST` | `/api/dashboard/guests` | `{ name, phone?, email?, group_id?, table_name?, language? }` | Create guest |
| `PUT` | `/api/dashboard/guests/[id]` | `{ name, phone?, email?, group_id?, table_name?, language? }` | Update guest |
| `DELETE` | `/api/dashboard/guests/[id]` | — | Delete guest |

**Tables**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/tables` | — | List all seating tables |
| `POST` | `/api/dashboard/tables` | `{ name, capacity? }` | Create table (default capacity: 8) |
| `PUT` | `/api/dashboard/tables/[id]` | `{ name, capacity }` | Update table |
| `DELETE` | `/api/dashboard/tables/[id]` | — | Delete table |

**RSVPs**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/rsvps` | — | List all RSVPs (includes `group_name`, `allocated_seats`) |
| `DELETE` | `/api/dashboard/rsvps/[id]` | — | Delete RSVP |

**Schedule**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/schedule` | — | List all schedule events ordered by `sort_order` |
| `POST` | `/api/dashboard/schedule` | `{ time_label, iso_time, event_name, description?, sort_order? }` | Create event |
| `PUT` | `/api/dashboard/schedule/[id]` | `{ time_label, iso_time, event_name, description?, sort_order }` | Update event |
| `DELETE` | `/api/dashboard/schedule/[id]` | — | Delete event |

**FAQ**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/faq` | — | List all FAQ items ordered by `sort_order` |
| `POST` | `/api/dashboard/faq` | `{ question, answer, sort_order? }` | Create FAQ item |
| `PUT` | `/api/dashboard/faq/[id]` | `{ question, answer, sort_order }` | Update FAQ item |
| `DELETE` | `/api/dashboard/faq/[id]` | — | Delete FAQ item |

**Photos**

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/photos` | — | List all photos ordered by `sort_order` |
| `POST` | `/api/dashboard/photos` | `{ src, alt, caption?, sort_order? }` | Add photo |
| `PUT` | `/api/dashboard/photos/[id]` | `{ src, alt, caption?, sort_order }` | Update photo |
| `DELETE` | `/api/dashboard/photos/[id]` | — | Delete photo |

### Super-admin (requires `super_admin_session` cookie)

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/super-admin/weddings` | — | List all weddings |
| `POST` | `/api/super-admin/weddings` | `{ slug, domains, defaultLocale, locales, dashboardPassword, features }` | Create wedding + seed `wedding_details` row |
| `PUT` | `/api/super-admin/weddings/[id]` | `{ domains, defaultLocale, locales, dashboardPassword?, features }` | Update wedding config |
| `DELETE` | `/api/super-admin/weddings/[id]` | — | Delete wedding (cascades all related rows) |

`features` object shape:
```json
{
  "rsvp": true,
  "countdown": true,
  "gallery": false,
  "guestbook": false,
  "maps": false,
  "qrCode": false,
  "videoSection": false,
  "schedule": true,
  "faq": true,
  "seatingCard": true
}
```

---

## Project structure

```
proxy.ts                  — tenant resolution + lang redirect (runs on every request)
lib/
  db.ts                   — NeonDB client (sql tagged template)
  tenant.ts               — WeddingConfig cache, resolveConfigByHost()
  wedding-data.ts         — all DB fetchers (weddingId-scoped)
  auth.ts                 — JWT helpers for dashboard + super-admin sessions
  i18n.ts                 — locale detection, t() interpolation
  revalidate.ts           — revalidateWeddingPages() after content edits
app/
  [lang]/                 — public invitation (tenant-aware, i18n)
  dashboard/              — per-couple admin (auth: slug + password → JWT cookie)
  super-admin/            — platform owner admin (auth: SUPER_ADMIN_PASSWORD)
  api/
    lookup/               — guest lookup by phone or passcode
    rsvp/                 — RSVP submission
    auth/                 — dashboard + super-admin login/logout
    dashboard/            — per-wedding CRUD (guests, groups, tables, schedule, etc.)
    super-admin/          — wedding management (create, update features/domains)
components/               — invitation UI components (EnvelopeGate, Hero, Countdown, etc.)
themes/                   — color schemes + section design registry
sql/
  schema.sql              — full database schema
  rls.sql                 — optional RLS policies
```

---

## Deployment (Firebase App Hosting)

```bash
firebase deploy
```

Set environment variables in the Firebase console under App Hosting → your backend → Environment variables. Add the same keys from `.env.local`.
