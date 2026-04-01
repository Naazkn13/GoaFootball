-- Migration: Add password_hash and must_change_password to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;
