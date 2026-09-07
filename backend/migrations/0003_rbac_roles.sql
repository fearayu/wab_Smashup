-- Migration number: 0003
-- Purpose: Add role-based access control (RBAC)
-- Roles: admin (highest), member (venue owner), user (regular player)
-- Default: member (venue owners), user (customers)

-- Add role column to owners table
ALTER TABLE owners ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
CREATE INDEX IF NOT EXISTS idx_owners_role ON owners (role);

-- Add role column to users table (for players/customers)
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
