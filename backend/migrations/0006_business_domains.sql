-- Migration number: 0006
-- Purpose: Business-domain tables for the Smashup MVP that the frontend
-- demo modules (shared/*.js) store in localStorage. Kept aligned with the
-- frontend shapes so the API-mode bridge can map 1:1.
--   * appointments   — player-to-player invites (นัดหมาย/คำเชิญ)
--   * buffet_bookings + buffet_queue — buffet reservations + live queue
--   * tournaments + tournament_registrations + tournament_brackets
--   * matchmaking_searches — saved matchmaking queries
-- Status values are English codes (matching the existing booking resource);
-- the API-mode bridge maps them to display strings on the frontend.

CREATE TABLE IF NOT EXISTS appointments (
    id            TEXT PRIMARY KEY,
    sender_id     TEXT NOT NULL,
    sender_name   TEXT NOT NULL,
    receiver_id   TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    date          TEXT NOT NULL,
    time          TEXT NOT NULL,
    court         TEXT NOT NULL DEFAULT '',
    note          TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'pending',
    created_at    TEXT NOT NULL,
    expires_at    TEXT NOT NULL,
    accepted_at   TEXT,
    declined_at   TEXT,
    cancelled_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_appointments_receiver ON appointments (receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_sender ON appointments (sender_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_status_expiry ON appointments (status, expires_at);

CREATE TABLE IF NOT EXISTS buffet_bookings (
    id             TEXT PRIMARY KEY,
    user_id        TEXT NOT NULL,
    name           TEXT NOT NULL,
    phone          TEXT NOT NULL,
    date           TEXT NOT NULL,
    session        TEXT NOT NULL,
    level          TEXT NOT NULL DEFAULT '',
    level_source   TEXT NOT NULL DEFAULT 'self-assessed',
    note           TEXT NOT NULL DEFAULT '',
    shuttle        INTEGER NOT NULL DEFAULT 0,
    amount         INTEGER NOT NULL DEFAULT 60,
    "group"        TEXT NOT NULL DEFAULT 'regular',
    status         TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'ไม่ชำระ',
    queue_number   INTEGER,
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_buffet_bookings_user ON buffet_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_buffet_bookings_date_session ON buffet_bookings (date, session);
CREATE INDEX IF NOT EXISTS idx_buffet_bookings_status ON buffet_bookings (status);

CREATE TABLE IF NOT EXISTS buffet_queue (
    id        TEXT PRIMARY KEY,
    scope_key TEXT NOT NULL UNIQUE,
    slots     TEXT NOT NULL DEFAULT '[]',
    waiting   TEXT NOT NULL DEFAULT '[]',
    history   TEXT NOT NULL DEFAULT '[]',
    completed TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_buffet_queue_scope ON buffet_queue (scope_key);

CREATE TABLE IF NOT EXISTS tournaments (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    event       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'registration',
    categories  TEXT NOT NULL DEFAULT '["ชายเดี่ยว","หญิงเดี่ยว","คู่ผสม"]',
    started_at  TEXT,
    created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments (status);

CREATE TABLE IF NOT EXISTS tournament_registrations (
    id            TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    user_id       TEXT NOT NULL,
    name          TEXT NOT NULL,
    category      TEXT NOT NULL,
    event         TEXT NOT NULL,
    level         TEXT NOT NULL DEFAULT '',
    partner       TEXT,
    status        TEXT NOT NULL DEFAULT 'registered',
    created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tournament_regs_tournament ON tournament_registrations (tournament_id, category);
CREATE INDEX IF NOT EXISTS idx_tournament_regs_user ON tournament_registrations (user_id);

CREATE TABLE IF NOT EXISTS tournament_brackets (
    tournament_id TEXT NOT NULL,
    category      TEXT NOT NULL,
    rounds        TEXT NOT NULL DEFAULT '[]',
    updated_at    TEXT NOT NULL,
    PRIMARY KEY (tournament_id, category)
);

CREATE TABLE IF NOT EXISTS matchmaking_searches (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    my_level   TEXT NOT NULL DEFAULT '',
    play_date  TEXT,
    play_time  TEXT NOT NULL DEFAULT '',
    max_distance TEXT NOT NULL DEFAULT '20',
    results    TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matchmaking_searches_user ON matchmaking_searches (user_id);