-- Migration number: 0005
-- Purpose: Add profile fields to users table for the Profiles API.
-- All new columns are nullable so existing rows are unaffected.

ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN level TEXT;
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN updated_at TEXT;
