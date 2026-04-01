-- Migration: Add is_active flag to users table (default true for all existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
