-- =============================================
-- Football Auth App — Schema Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. MODIFY: users table (add new columns)
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_details JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Make password_hash nullable (email-only OTP login now)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- =============================================
-- 2. NEW: messages table
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- =============================================
-- 3. Enable Supabase Realtime on messages
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =============================================
-- 4. Seed: Create initial super admin
--    (Replace email with your actual admin email)
-- =============================================
-- UPDATE users SET is_admin = TRUE, is_super_admin = TRUE WHERE email = 'admin@footballapp.com';

-- =============================================
-- 5. Supabase Storage Bucket Setup
--    (Run via Supabase Dashboard > Storage > New Bucket)
--    Bucket name: user-documents
--    Public: false
--    File size limit: 5MB
--    Allowed MIME types: image/jpeg, image/png, application/pdf
-- =============================================

-- =============================================
-- 6. RLS Policies for messages table
-- =============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own messages
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text
  );

-- Users can insert messages they send
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id::text
  );
