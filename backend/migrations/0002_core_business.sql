-- Migration number: 0002
-- Purpose: Core business tables for wab_Smashup MVP

CREATE TABLE IF NOT EXISTS owners (
    id              TEXT PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    name            TEXT NOT NULL,
    phone           TEXT,
    plan            TEXT NOT NULL DEFAULT 'free',
    plan_expires_at TEXT,
    onboarding_completed INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_owners_email ON owners (email);
CREATE INDEX IF NOT EXISTS idx_owners_plan ON owners (plan);

CREATE TABLE IF NOT EXISTS venues (
    id              TEXT PRIMARY KEY,
    owner_id        TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    address         TEXT,
    phone           TEXT,
    email           TEXT,
    logo_url        TEXT,
    primary_color   TEXT DEFAULT '#1976D2',
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues (owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues (slug);

CREATE TABLE IF NOT EXISTS courts (
    id              TEXT PRIMARY KEY,
    venue_id        TEXT NOT NULL,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'standard',
    hourly_rate     INTEGER NOT NULL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_courts_venue_id ON courts (venue_id);
CREATE INDEX IF NOT EXISTS idx_courts_active ON courts (venue_id, is_active);

CREATE TABLE IF NOT EXISTS time_slots (
    id              TEXT PRIMARY KEY,
    court_id        TEXT NOT NULL,
    slot_date       TEXT NOT NULL,
    slot_time       TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price           INTEGER NOT NULL,
    is_available    INTEGER NOT NULL DEFAULT 1,
    is_peak         INTEGER NOT NULL DEFAULT 0,
    booking_id      TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_time_slots_court_date ON time_slots (court_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots (court_id, slot_date, is_available);
CREATE INDEX IF NOT EXISTS idx_time_slots_booking ON time_slots (booking_id);

CREATE TABLE IF NOT EXISTS bookings (
    id              TEXT PRIMARY KEY,
    venue_id        TEXT NOT NULL,
    court_id        TEXT NOT NULL,
    time_slot_ids   TEXT NOT NULL,
    player_name     TEXT NOT NULL,
    player_phone    TEXT NOT NULL,
    player_email    TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    total_amount    INTEGER NOT NULL,
    notes           TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings (venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (venue_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (player_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
    id              TEXT PRIMARY KEY,
    booking_id      TEXT NOT NULL UNIQUE,
    amount          INTEGER NOT NULL,
    slip_image_url  TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    verified_by     TEXT,
    verified_at     TEXT,
    bank_hint       TEXT,
    reference_hint  TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

CREATE TABLE IF NOT EXISTS site_configs (
    id              TEXT PRIMARY KEY,
    venue_id        TEXT NOT NULL UNIQUE,
    theme           TEXT NOT NULL DEFAULT 'default',
    hero_image_url  TEXT,
    welcome_message TEXT,
    show_pricing    INTEGER NOT NULL DEFAULT 1,
    show_map        INTEGER NOT NULL DEFAULT 1,
    custom_css      TEXT,
    social_links    TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_site_configs_venue ON site_configs (venue_id);
