-- Multi-tenant wedding platform schema
-- Run this against a fresh Supabase project, then run rls.sql

-- ── Master weddings table ──────────────────────────────────────────────────

CREATE TABLE weddings (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                      text UNIQUE NOT NULL,
  domains                   text[] NOT NULL DEFAULT '{}',
  default_locale            text NOT NULL DEFAULT 'en',
  locales                   text[] NOT NULL DEFAULT '{en}',
  -- Feature flags
  feature_rsvp              boolean NOT NULL DEFAULT true,
  feature_countdown         boolean NOT NULL DEFAULT true,
  feature_gallery           boolean NOT NULL DEFAULT false,
  feature_guestbook         boolean NOT NULL DEFAULT false,
  feature_maps              boolean NOT NULL DEFAULT false,
  feature_qr_code           boolean NOT NULL DEFAULT false,
  feature_video_section     boolean NOT NULL DEFAULT true,
  feature_schedule          boolean NOT NULL DEFAULT true,
  feature_faq               boolean NOT NULL DEFAULT true,
  feature_seating_card      boolean NOT NULL DEFAULT true,
  -- Per-section enabled design keys; empty {} means all designs are allowed
  enabled_designs           jsonb NOT NULL DEFAULT '{}',
  -- Dashboard UI language
  dashboard_locale          text NOT NULL DEFAULT 'es',
  -- Auth
  dashboard_password_hash   text NOT NULL DEFAULT '',
  -- Soft delete / suspend
  active                    boolean NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- ── Per-wedding content tables ─────────────────────────────────────────────

CREATE TABLE wedding_details (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id          uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  groom_name          text NOT NULL DEFAULT '',
  bride_name          text NOT NULL DEFAULT '',
  wedding_date        date,
  ceremony_time       text,
  ceremony_location   text,
  reception_time      text,
  reception_location  text,
  coordinator_email   text,
  coordinator_name    text,
  rsvp_deadline       text,
  names_font_url      text,
  hero_eyebrow        text,
  hero_tagline        text,
  hero_greeting       text,
  hero_body_text      text,
  letter_eyebrow      text,
  letter_greeting     text,
  letter_body_text    text,
  video_source_type   text CHECK (video_source_type IN ('youtube','vimeo','self')),
  video_source_id     text,
  video_poster_url    text,
  -- per-locale overrides for hero/letter text: { "zh": { "hero_eyebrow": "..." }, "es": { ... } }
  locale_content      jsonb NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wedding_id)
);

CREATE TABLE section_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  section_key     text NOT NULL,
  design          text NOT NULL DEFAULT 'Classic',
  color_scheme    text NOT NULL DEFAULT 'Gold',
  background_url  text,
  background_color text,
  font_color      text,
  overlay_opacity numeric NOT NULL DEFAULT 0.32,
  sort_order      integer NOT NULL DEFAULT 0,
  visible         boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, section_key)
);

CREATE TABLE wedding_schedule (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  time_label  text NOT NULL DEFAULT '',
  iso_time    text NOT NULL DEFAULT '',
  event_name  text NOT NULL DEFAULT '',
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wedding_faq (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id     uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  sort_order     integer NOT NULL DEFAULT 0,
  question       text NOT NULL DEFAULT '',
  answer         text NOT NULL DEFAULT '',
  locale_content jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wedding_photos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  src         text NOT NULL DEFAULT '',
  alt         text NOT NULL DEFAULT '',
  caption     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Guest management tables ────────────────────────────────────────────────

CREATE TABLE invitation_groups (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id       uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name             text NOT NULL DEFAULT '',
  allocated_seats  integer NOT NULL DEFAULT 1,
  table_name       text,
  passcode         text,
  language         text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wedding_tables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '',
  capacity    integer NOT NULL DEFAULT 8,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  group_id    uuid REFERENCES invitation_groups(id) ON DELETE SET NULL,
  name        text NOT NULL DEFAULT '',
  phone       text,
  email       text,
  table_name  text,
  language    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rsvps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  group_id        uuid REFERENCES invitation_groups(id) ON DELETE SET NULL,
  attending       boolean NOT NULL DEFAULT false,
  guest_count     integer NOT NULL DEFAULT 0,
  message         text,
  rsvped_by       text,
  guest_attendance jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_weddings_active ON weddings (active);
CREATE INDEX idx_guests_phone ON guests (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_guests_wedding_id ON guests (wedding_id);
CREATE INDEX idx_invitation_groups_wedding_id ON invitation_groups (wedding_id);
CREATE INDEX idx_invitation_groups_passcode ON invitation_groups (passcode) WHERE passcode IS NOT NULL;
CREATE INDEX idx_rsvps_wedding_id ON rsvps (wedding_id);
CREATE INDEX idx_rsvps_group_id ON rsvps (group_id);
CREATE INDEX idx_section_config_wedding_id ON section_config (wedding_id);

-- ── Location pins ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wedding_locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  title       text NOT NULL DEFAULT '',
  address     text NOT NULL DEFAULT '',
  maps_link   text NOT NULL DEFAULT '',
  waze_link   text NOT NULL DEFAULT '',
  embed_url   text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wedding_locations_wedding_id ON wedding_locations (wedding_id);

-- ── Hero elements ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_elements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id   uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  element_type text NOT NULL DEFAULT 'text',
  content      text NOT NULL DEFAULT '',
  locale_content jsonb NOT NULL DEFAULT '{}',
  font_family  text NOT NULL DEFAULT '',
  font_style   text NOT NULL DEFAULT 'normal',
  font_weight  text NOT NULL DEFAULT '400',
  font_size      text NOT NULL DEFAULT '',
  letter_spacing text NOT NULL DEFAULT '',
  font_color     text NOT NULL DEFAULT '',
  visible        boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_hero_elements_wedding_id ON hero_elements (wedding_id);

-- ── Seed: example wedding (replace values before running) ─────────────────

-- INSERT INTO weddings (slug, domains, default_locale, locales,
--   feature_rsvp, feature_countdown, feature_gallery, feature_schedule,
--   feature_faq, feature_seating_card, feature_video_section,
--   dashboard_password_hash, active)
-- VALUES (
--   'john-sarah',
--   ARRAY['johnandsarah.com'],
--   'en', ARRAY['en','es'],
--   true, true, true, true, true, true, false,
--   '', -- set via bcrypt in dashboard auth route
--   true
-- );
