# 🎯 Football App - Complete Setup Guide

## 📋 Overview

Complete Next.js application with:
- ✅ Email/Password authentication with OTP verification
- ✅ Razorpay payment integration
- ✅ Supabase PostgreSQL database
- ✅ User management with unique Football IDs (FB20261234 format)
- ✅ Payment history tracking
- ✅ Email service integration (placeholder for SendGrid/AWS SES/SMTP)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /home/omkar-kachre/Documents/football/football-auth-app
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.local.example .env.local
# Edit .env.local and add your credentials
```

### 3. Setup Database
- Open `DATABASE_SETUP.md`
- Follow instructions to create Supabase project
- Run all SQL queries in Supabase SQL Editor

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## 📚 Documentation Files

### 1. **DATABASE_SETUP.md**
Complete database schema with SQL queries for:
- 📊 Users table (with Football ID)
- 🔐 OTPs table (4-digit verification)
- 💳 Payments table (Razorpay integration)
- 📜 Payment history table (audit log)
- 🔧 PostgreSQL functions
- 🔒 Row Level Security policies

### 2. **API_INTEGRATION_SUMMARY.md**
Complete guide for integrating APIs:
- Axios setup
- Authentication flow
- Payment flow
- Frontend code examples
- All API endpoints documentation

### 3. **.env.local.example**
Template for environment variables:
- Supabase credentials
- Razorpay keys
- JWT secret
- Email service configuration

---

## 🗂️ Project Structure

```
football-auth-app/
├── components/
│   └── OTPModal.jsx              # 4-digit OTP popup modal
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.js          # Request OTP for login
│   │   │   ├── signup.js         # Create account with OTP
│   │   │   ├── verify-login-otp.js
│   │   │   ├── verify-signup-otp.js
│   │   │   └── resend-otp.js
│   │   ├── user/
│   │   │   ├── profile.js        # Get/Update profile
│   │   │   ├── payment-history.js
│   │   │   └── payment-status.js
│   │   └── payment/
│   │       ├── create-order.js   # Create Razorpay order
│   │       ├── verify.js         # Verify payment
│   │       ├── all.js            # Get all payments
│   │       └── [id].js           # Get payment by ID
│   ├── login.js                  # Login page
│   ├── signup.js                 # Signup page
│   └── profile.js                # User profile & payments
├── services/
│   ├── axios.js                  # Axios instance with interceptors
│   ├── database.js               # Supabase operations
│   ├── otp.service.js            # OTP generation & verification
│   ├── email.service.js          # Email sending service
│   ├── uuid.service.js           # Football ID generator
│   ├── payment.service.js        # Razorpay integration
│   └── api/
│       ├── auth.api.js           # Auth API calls
│       ├── user.api.js           # User API calls
│       └── payment.api.js        # Payment API calls
├── styles/
│   └── OTPModal.module.css       # OTP modal styling
├── DATABASE_SETUP.md             # Complete DB schema
├── API_INTEGRATION_SUMMARY.md    # Integration guide
└── .env.local.example            # Environment template
```

---

## 🔑 Required Credentials

### You Need to Provide:

#### 1. Supabase (PostgreSQL Database)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

**How to get:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Settings → API → Copy URL and keys

#### 2. Razorpay (Payment Gateway)
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**How to get:**
1. Go to [razorpay.com](https://razorpay.com)
2. Create account
3. Settings → API Keys → Generate Test/Live Keys

#### 3. JWT Secret (Custom)
```env
JWT_SECRET=your_32_character_secret_key_here
```

**Generate using:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Email Service (One of these)

**Option A: SendGrid**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
```

**Option B: AWS SES**
```env
EMAIL_PROVIDER=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

**Option C: SMTP (Gmail, etc.)**
```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

**For now (Development):**
```env
EMAIL_PROVIDER=console
```
This logs OTPs to console instead of sending emails.

---

## 🔄 Authentication Flow

### Signup Process
1. User fills signup form → API creates user
2. Generates unique Football ID (FB20261234)
3. Sends 4-digit OTP to email
4. User enters OTP in popup modal
5. Verifies OTP → Account activated
6. Redirect to login

### Login Process
1. User enters email & password
2. Validates credentials
3. Sends 4-digit OTP to email
4. User enters OTP in popup modal
5. Verifies OTP → Generates JWT token
6. Stores token in localStorage
7. Redirect to profile

### OTP Features
- ✅ 4-digit numeric code
- ✅ 5-minute expiry
- ✅ Max 3 attempts
- ✅ Resend option after expiry
- ✅ Beautiful popup modal

---

## 💳 Payment Flow

### Payment Process
1. User clicks "Pay ₹1,999" on profile
2. Backend creates Razorpay order
3. Opens Razorpay checkout modal
4. User completes payment
5. Backend verifies payment signature
6. Updates user.is_paid = true
7. Generates Football ID if not exists
8. Records in payment_history

### Payment Features
- ✅ Razorpay integration
- ✅ Signature verification
- ✅ Payment history tracking
- ✅ Audit logging
- ✅ Refund support (API ready)

---

## 🗄️ Database Tables

### 1. Users Table
```sql
- id (UUID)
- football_id (VARCHAR) - Unique ID: FB20261234
- name, email, password_hash
- phone, aadhaar
- is_verified, is_paid
- payment_date, verified_at, last_login
- created_at, updated_at
```

### 2. OTPs Table
```sql
- id (UUID)
- email, otp (4 digits)
- purpose ('signup' or 'login')
- expires_at (NOW + 5 minutes)
- is_verified, attempts
- created_at
```

### 3. Payments Table
```sql
- id (UUID)
- user_id (FK → users)
- razorpay_order_id, razorpay_payment_id
- amount, currency, status
- paid_at, created_at
```

### 4. Payment History Table
```sql
- id (UUID)
- user_id (FK → users)
- payment_id (FK → payments)
- action, details (JSONB)
- created_at
```

---

## 🧪 Testing

### Test Signup Flow
```bash
# 1. Run dev server
npm run dev

# 2. Go to http://localhost:3000/signup
# 3. Fill form and submit
# 4. Check console for OTP (since EMAIL_PROVIDER=console)
# 5. Enter OTP in modal
# 6. Verify account created in Supabase
```

### Test Login Flow
```bash
# 1. Go to http://localhost:3000/login
# 2. Enter credentials
# 3. Check console for OTP
# 4. Enter OTP
# 5. Should redirect to /profile
```

### Test Payment (Mock Mode)
```bash
# Without Razorpay keys, it runs in mock mode
# 1. Go to /profile
# 2. Click "Pay ₹1,999"
# 3. Mock payment will be created
# 4. Check console logs
```

---

## 🎨 Frontend Components

### OTPModal Component
Beautiful, user-friendly OTP modal with:
- ✨ 4 separate input boxes
- ⌨️ Auto-focus on next field
- 📋 Paste support (copies all 4 digits)
- ⏱️ 5-minute countdown timer
- 🔄 Resend OTP button
- 🎯 Auto-submit when complete
- 💅 Smooth animations

### Usage:
```jsx
<OTPModal
  isOpen={showOTP}
  onClose={() => setShowOTP(false)}
  onVerify={handleVerifyOTP}
  onResend={handleResendOTP}
  email="user@example.com"
  purpose="login"
/>
```

---

## 📦 NPM Scripts

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm start        # Production server (port 8080)
npm run lint     # ESLint
```

---

## 🔧 Build Scripts

### Development
```bash
npm run dev
```

### Production Builds
```bash
./build-sit.sh    # SIT environment
./build-uat.sh    # UAT environment
./build-prod.sh   # Production environment
```

Each creates a zip file with complete deployment package.

---

## 🚨 Common Issues & Solutions

### Issue: "Module not found: @supabase/supabase-js"
**Solution:**
```bash
npm install @supabase/supabase-js
```

### Issue: OTPs not sending
**Solution:**
Check `EMAIL_PROVIDER` in `.env.local`. For testing, use:
```env
EMAIL_PROVIDER=console
```
OTPs will be logged to console.

### Issue: Payment fails
**Solution:**
Without Razorpay keys, app runs in mock mode. Check console for mock payment logs. Add real keys to `.env.local` for production.

### Issue: Database errors
**Solution:**
1. Verify Supabase credentials in `.env.local`
2. Run all SQL from `DATABASE_SETUP.md`
3. Check Supabase dashboard for errors

### Issue: JWT token errors
**Solution:**
Generate strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add to `.env.local` as `JWT_SECRET`

---

## 📈 Next Steps

1. **Provide Credentials**
   - [ ] Supabase project URL & keys
   - [ ] Razorpay API keys
   - [ ] Email service credentials

2. **Setup Database**
   - [ ] Run SQL queries from `DATABASE_SETUP.md`
   - [ ] Verify tables created
   - [ ] Test database connection

3. **Test Application**
   - [ ] Signup flow with OTP
   - [ ] Login flow with OTP
   - [ ] Profile page
   - [ ] Payment integration

4. **Deploy**
   - [ ] Build production package
   - [ ] Deploy to server
   - [ ] Configure domain
   - [ ] Enable HTTPS

---

## 📞 Support

For issues:
1. Check `DATABASE_SETUP.md` for database queries
2. Check `API_INTEGRATION_SUMMARY.md` for API integration
3. Review console logs for errors
4. Verify environment variables
5. Check Supabase dashboard logs

---

## ✅ Checklist Before Going Live

- [ ] All dependencies installed (`npm install`)
- [ ] `.env.local` configured with real credentials
- [ ] Database tables created in Supabase
- [ ] JWT_SECRET generated and added
- [ ] Razorpay keys added (test/live)
- [ ] Email service configured
- [ ] Signup flow tested
- [ ] Login flow tested
- [ ] Payment flow tested
- [ ] OTP emails working
- [ ] Football ID generation working
- [ ] Payment history tracking working

---

**Project Status**: ✅ **Ready for Credentials**

**Last Updated**: November 30, 2025  
**Version**: 1.0.0

---

## 📄 License

ISC
