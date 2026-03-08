-- Site Content CMS table
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(50) NOT NULL,
  section VARCHAR(100) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_by UUID REFERENCES users(id),
  UNIQUE(page, section)
);
