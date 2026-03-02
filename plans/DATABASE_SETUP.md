                                                            # Database Setup Guide

## Supabase PostgreSQL Database Schema

This document contains all the SQL queries needed to set up your Football App database in Supabase.

---

## 🗄️ Database Tables

### 1. Users Table
Stores user information with unique Football ID (FB format).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  football_id VARCHAR(12) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(15) NOT NULL,
  aadhaar VARCHAR(12),
  is_verified BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_date TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_football_id ON users(football_id);
CREATE INDEX idx_users_is_paid ON users(is_paid);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comments
COMMENT ON TABLE users IS 'Stores user information with unique Football ID';
COMMENT ON COLUMN users.football_id IS 'Unique ID in format FB20261234 (FB + Year + 4 digits)';
COMMENT ON COLUMN users.is_paid IS 'TRUE if user has completed payment, generates Football ID';
```

---

### 2. OTPs Table
Stores One-Time Passwords for email verification and login.

```sql
CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(4) NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'signup' or 'login'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_email_purpose UNIQUE(email, purpose)
);

-- Indexes
CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_otps_purpose ON otps(purpose);

-- Comments
COMMENT ON TABLE otps IS 'Stores 4-digit OTPs for email verification and login';
COMMENT ON COLUMN otps.otp IS '4-digit numeric OTP';
COMMENT ON COLUMN otps.expires_at IS 'OTP expires after 5 minutes';
COMMENT ON COLUMN otps.attempts IS 'Number of failed verification attempts (max 3)';
```

---

### 3. Payments Table
Stores Razorpay payment information.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255),
  razorpay_signature TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'created', -- 'created', 'success', 'failed'
  receipt VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Comments
COMMENT ON TABLE payments IS 'Stores Razorpay payment transaction details';
COMMENT ON COLUMN payments.status IS 'Payment status: created, success, failed';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Unique Razorpay order ID';
```

---

### 4. Payment History Table
Stores detailed payment activity logs for auditing.

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'order_created', 'payment_success', 'payment_failed', 'refund', etc.
  details JSONB, -- Additional details about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_payment_id ON payment_history(payment_id);
CREATE INDEX idx_payment_history_action ON payment_history(action);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- Comments
COMMENT ON TABLE payment_history IS 'Audit log for all payment-related activities';
COMMENT ON COLUMN payment_history.action IS 'Type of action performed';
COMMENT ON COLUMN payment_history.details IS 'JSON object with additional action details';
```

---

## 🔧 Database Functions

### 1. Update Timestamp Function
Auto-update the `updated_at` column on record modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to payments table
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. Increment OTP Attempts Function
Used by the application to increment failed OTP attempts.

```sql
CREATE OR REPLACE FUNCTION increment_otp_attempts(
  user_email VARCHAR,
  otp_purpose VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
  new_attempts INTEGER;
BEGIN
  UPDATE otps
  SET attempts = attempts + 1
  WHERE email = user_email
    AND purpose = otp_purpose
    AND is_verified = FALSE
  RETURNING attempts INTO new_attempts;
  
  RETURN new_attempts;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Cleanup Expired OTPs Function
Automatically delete expired OTPs (run as scheduled job).

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otps
  WHERE expires_at < NOW()
     OR created_at < NOW() - INTERVAL '1 day';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run every hour using pg_cron or Supabase cron
-- Example: SELECT cron.schedule('cleanup-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');
```

---

## 🔐 Row Level Security (RLS) Policies

Enable RLS on all tables for security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Users: Users can only read/update their own data
CREATE POLICY users_select_own
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY users_update_own
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Payments: Users can only read their own payments
CREATE POLICY payments_select_own
  ON payments FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Payment History: Users can only read their own history
CREATE POLICY payment_history_select_own
  ON payment_history FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Note: OTPs table should only be accessible via service role (backend)
-- No RLS policies for OTPs - access only through API
```

---

## 📊 Initial Data / Seed Data (Optional)

```sql
-- Example: Insert test user (for development only)
INSERT INTO users (
  football_id, name, email, password_hash, phone, is_verified, is_paid
) VALUES (
  'FB20260001',
  'Test User',
  'test@example.com',
  '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', -- bcrypt hash
  '9999999999',
  TRUE,
  FALSE
);
```

---

## 🔍 Useful Queries

### Get user with payment information
```sql
SELECT 
  u.id,
  u.football_id,
  u.name,
  u.email,
  u.is_paid,
  p.amount AS last_payment_amount,
  p.status AS last_payment_status,
  p.paid_at
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
WHERE u.email = 'user@example.com'
ORDER BY p.created_at DESC
LIMIT 1;
```

### Get payment history for a user
```sql
SELECT 
  ph.action,
  ph.details,
  ph.created_at,
  p.amount,
  p.status
FROM payment_history ph
LEFT JOIN payments p ON ph.payment_id = p.id
WHERE ph.user_id = 'user-uuid-here'
ORDER BY ph.created_at DESC;
```

### Count users by payment status
```sql
SELECT 
  is_paid,
  COUNT(*) as total_users
FROM users
GROUP BY is_paid;
```

### Get all successful payments
```sql
SELECT 
  u.name,
  u.email,
  u.football_id,
  p.amount,
  p.paid_at
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'success'
ORDER BY p.paid_at DESC;
```

---

## 📝 Environment Variables Required

Add these to your `.env.local` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (for custom JWT tokens)
JWT_SECRET=your_jwt_secret_key_here

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Service Configuration (Choose one)
EMAIL_PROVIDER=sendgrid # or 'aws-ses', 'nodemailer', 'console'
EMAIL_FROM=noreply@footballapp.com

# SendGrid (if using)
SENDGRID_API_KEY=your_sendgrid_api_key

# AWS SES (if using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Nodemailer (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## 🚀 Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Run SQL Queries
1. Open Supabase SQL Editor
2. Copy and paste the SQL queries above in order:
   - Create tables (users, otps, payments, payment_history)
   - Create indexes
   - Create functions
   - Enable RLS policies

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js razorpay bcryptjs jsonwebtoken
```

### 4. Configure Environment
- Copy `.env.local.example` to `.env.local`
- Add all required environment variables
- Add Supabase credentials
- Add Razorpay credentials

### 5. Test Database Connection
Run the test script to verify database setup:
```bash
node scripts/test-database.js
```

---

## 📋 Table Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User accounts | football_id, email, is_paid |
| **otps** | OTP verification | email, otp, purpose, expires_at |
| **payments** | Razorpay transactions | razorpay_order_id, amount, status |
| **payment_history** | Payment audit log | user_id, action, details |

---

## 🎯 Football ID Format

- **Format**: `FB{YEAR}{4-DIGIT-NUMBER}`
- **Example**: `FB20261234`
- **Description**: 
  - `FB` = Prefix (Football)
  - `2026` = Current year
  - `1234` = Random 4-digit number
- **Generated**: When user signs up
- **Unique**: Yes, database enforces uniqueness

---

## 🔒 Security Notes

1. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` in frontend code
2. **Always use** RLS policies for user data access
3. **Hash passwords** using bcryptjs with minimum 10 salt rounds
4. **Verify JWT tokens** on every protected API route
5. **Validate Razorpay signatures** before marking payment as success
6. **Limit OTP attempts** to prevent brute force attacks
7. **Expire OTPs** after 5 minutes

---

## 📧 Support

For database-related issues:
1. Check Supabase logs in your dashboard
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Check API error logs in browser console

---

**Last Updated**: November 30, 2025
**Version**: 1.0.0
