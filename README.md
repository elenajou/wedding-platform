# Wedding Platform

Multi-tenant wedding invitation SaaS. One codebase, one deployment — each couple gets their own domain, language, theme, and feature set.

**Stack:** Next.js 16 App Router · NeonDB · Firebase App Hosting

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd wedding-platform
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | NeonDB connection string (from Neon dashboard → Connection string) |
| `SUPER_ADMIN_PASSWORD` | Password for `/super-admin` |
| `DASHBOARD_JWT_SECRET` | Min 32 chars — `openssl rand -base64 32` |
| `PLATFORM_DOMAIN` | Your root domain (e.g. `platform.com`) for subdomain routing |

### 3. Apply schema

Run once on a fresh database:

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

When columns are added in future updates, re-run this — existing tables are skipped, only new columns/tables are added.

### 4. Seed a local dev wedding

The app resolves tenants by the `Host` header. Use slug `localhost` for local dev:

```bash
node -e "
const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)
;(async () => {
  const rows = await sql\`
    INSERT INTO weddings (slug, domains, default_locale, locales, active,
      feature_rsvp, feature_countdown, feature_gallery, feature_schedule,
      feature_faq, feature_seating_card, feature_video_section, dashboard_password_hash)
    VALUES ('localhost', ARRAY[]::text[], 'en', ARRAY['en'], true,
      true, true, false, true, true, true, false, '')
    ON CONFLICT (slug) DO NOTHING RETURNING id
  \`
  if (!rows[0]) { console.log('Already exists.'); return }
  await sql\`INSERT INTO wedding_details (wedding_id, bride_name, groom_name) VALUES (\${rows[0].id}, 'Bride', 'Groom') ON CONFLICT DO NOTHING\`
  const sections = ['envelope','hero','countdown','seating','rsvp','schedule','faq']
  for (const [i, key] of sections.entries()) {
    await sql\`INSERT INTO section_config (wedding_id, section_key, sort_order, design, color_scheme) VALUES (\${rows[0].id}, \${key}, \${i * 10}, 'Classic', 'Gold') ON CONFLICT (wedding_id, section_key) DO NOTHING\`
  }
  console.log('Done. Wedding ID:', rows[0].id)
})()
"
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Adding a new couple

Use `/super-admin` (recommended) or the API:

```bash
curl -X POST https://your-platform.com/api/super-admin/weddings \
  -H "Content-Type: application/json" \
  -H "Cookie: super_admin_session=<cookie>" \
  -d '{
    "slug": "sofia-carlos",
    "domains": ["sofiaycarloss.com"],
    "defaultLocale": "es",
    "locales": ["es", "en"],
    "dashboardPassword": "their-password",
    "features": {
      "rsvp": true, "countdown": true, "gallery": true, "schedule": true,
      "faq": true, "seatingCard": true, "videoSection": false,
      "guestbook": false, "maps": false, "qrCode": false
    }
  }'
```

This creates the `weddings` row and an empty `wedding_details` row. The couple logs in at `/dashboard` with their slug + password.

### Setting up a custom domain

1. Add the domain in `/super-admin/weddings/[id]` → Domains field
2. Have the couple point DNS to your Firebase hosting URL:
   - Add a `CNAME`: `sofiaycarloss.com → <firebase-hosting-domain>`
   - Or configure a custom domain in Firebase console → App Hosting
3. Routing is automatic — the middleware matches the `Host` header against `domains[]`

Subdomains on your platform domain (`sofia-carlos.platform.com`) work automatically without DNS setup.

### Tenant routing summary

| Request host | How it resolves |
|---|---|
| `localhost:3000` | Slug match: `localhost` |
| `sofia-carlos.platform.com` | Slug extracted from subdomain |
| `sofiaycarloss.com` | Exact match in `domains[]` |

### Enabling features

In `/super-admin/weddings/[id]`, toggle features per couple:

| Feature flag | What it unlocks |
|---|---|
| RSVP | Confirmation form in invitation + Confirmaciones tab |
| Countdown | Countdown timer section |
| Gallery | Photo gallery section + Fotos tab |
| Schedule | Day schedule section + Agenda tab |
| FAQ | FAQ accordion + FAQ tab |
| Seating card | Seating assignment section |
| Video section | Video embed section |

### Multiple languages

1. In `/super-admin/weddings/[id]`, set Locales to e.g. `en,zh` or `es,en`
2. The couple's Boda tab will show extra text fields for each additional locale (hero text, letter text)
3. Guests switch language via the language switcher in the invitation

Supported: `en` (English), `es` (Español), `zh` (中文)

### Template visibility per couple

In `/super-admin/weddings/[id]` → Template Visibility, restrict which design variants are available to a specific couple (e.g. only show "Classic" and "Minimal" templates).

### Separate database per client (optional)

All weddings share one NeonDB by default, isolated by `wedding_id` foreign keys. For strict data-residency requirements:

1. Create a new Neon project for the client
2. Run `sql/schema.sql` against it
3. Add a `DATABASE_URL_<SLUG>` env var and update `lib/db.ts` to select the connection based on wedding ID

---

## Dashboards

### Super-admin — `/super-admin`

Manage all weddings. Auth: `SUPER_ADMIN_PASSWORD` env var → session cookie.

| URL | Purpose |
|---|---|
| `/super-admin/login` | Sign in |
| `/super-admin` | List all weddings |
| `/super-admin/weddings/new` | Create a wedding |
| `/super-admin/weddings/[id]` | Edit features, locales, domains, password, templates |

### Couple dashboard — `/dashboard`

All labels in Spanish. Tabs shown depend on enabled features. Auth: slug + password → JWT cookie.

| Tab | Path | Feature required |
|---|---|---|
| Boda | `/dashboard/wedding` | always |
| Mesas | `/dashboard/tables` | always |
| Grupos | `/dashboard/groups` | always |
| Invitados | `/dashboard/guests` | always |
| Secciones | `/dashboard/sections` | always |
| Tema | `/dashboard/theme` | always |
| Confirmaciones | `/dashboard/rsvps` | rsvp |
| Agenda | `/dashboard/schedule` | schedule |
| FAQ | `/dashboard/faq` | faq |
| Fotos | `/dashboard/photos` | gallery |

---

## Project structure

```
middleware.ts / proxy.ts    — tenant resolution; injects x-wedding-id on every request
lib/
  db.ts                     — NeonDB tagged-template SQL client
  tenant.ts                 — in-memory config cache (5 min TTL), resolveConfigByHost()
  wedding-data.ts           — DB fetchers scoped to weddingId
  auth.ts                   — JWT helpers (dashboard + super-admin sessions)
  i18n.ts                   — locale detection, t() string interpolation
  revalidate.ts             — revalidates public pages after content changes
app/
  [lang]/                   — public invitation (tenant-aware, i18n)
  dashboard/                — couple admin
  super-admin/              — platform owner admin
  api/                      — REST API (lookup, rsvp, auth, dashboard/*, super-admin/*)
components/                 — invitation UI sections (Hero, Countdown, RSVP, etc.)
themes/                     — color schemes + design variant registry
sql/
  schema.sql                — full DB schema (run on setup and after updates)
  rls.sql                   — optional Supabase RLS policies
```

---

## Deploy (Firebase App Hosting)

```bash
firebase deploy
```

Set env vars in Firebase console → App Hosting → your backend → Environment variables. Same keys as `.env.local`.
