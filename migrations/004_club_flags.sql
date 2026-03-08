-- Migration: Add club_flag_reason to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS club_flag_reason TEXT;
