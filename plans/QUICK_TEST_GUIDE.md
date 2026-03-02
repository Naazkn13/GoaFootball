# Quick Test Guide

## Prerequisites
1. Fill credentials in `.env.local`
2. Run Supabase SQL setup from `DATABASE_SETUP.md`
3. Install dependencies: `npm install`

## Test Flow (5 minutes)

### Step 1: Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

### Step 2: Test Signup
1. Go to http://localhost:3000/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Aadhaar: 123456789012
   - Password: Test@123
3. Click "Sign Up"
4. **OTP Modal appears**
5. Check console for OTP (if EMAIL_PROVIDER=console)
6. Enter 4-digit OTP
7. Success message shows with Football ID (e.g., FB20261234)

### Step 3: Test Login
1. Redirected to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: Test@123
3. Click "Login"
4. **OTP Modal appears again**
5. Check console for new OTP
6. Enter 4-digit OTP
7. Redirected to profile

### Step 4: Test Profile
1. Profile page loads with your data
2. See your Football ID displayed
3. Click "Edit Profile"
4. Change name → Click "Save Changes"
5. Profile updates successfully

### Step 5: Test Payment (Test Mode)
1. Scroll to payment section
2. Click "Proceed to Payment"
3. **Razorpay modal opens**
4. Use Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name
5. Complete payment
6. Payment verified → Status updates to "✓ Payment Completed"
7. Payment history appears

## Common Test Scenarios

### OTP Expiry Test
1. Request OTP
2. Wait 5+ minutes
3. Try entering OTP → "OTP expired" error
4. Click "Resend OTP"
5. Enter new OTP → Success

### OTP Attempts Test
1. Request OTP
2. Enter wrong OTP 3 times
3. "Maximum attempts exceeded" error
4. Need to request new OTP

### Edit Profile Test
1. Click "Edit Profile"
2. Change name, phone, aadhaar
3. Click "Save Changes" → API call succeeds
4. Data updates in UI
5. Click "Cancel" to revert unsaved changes

### Logout Test
1. Click "Logout" button
2. Redirected to login page
3. localStorage cleared (check DevTools)
4. Cannot access profile without logging in again

## Debugging Tips

### Check OTP in Console
If `EMAIL_PROVIDER=console`, OTP appears in terminal:
```
=== EMAIL SENT ===
To: test@example.com
Subject: Your OTP Code
OTP: 1234
==================
```

### Check Database Records
**Supabase Dashboard → Table Editor:**

- **users** table: See registered users with Football IDs
- **otps** table: See generated OTPs with expiry times
- **payments** table: See Razorpay payment records
- **payment_history** table: See payment audit trail

### Check API Responses
**Browser DevTools → Network Tab:**
- `/api/auth/login` → Should return `{ requiresOTP: true, message: ... }`
- `/api/auth/verify-login-otp` → Should return `{ token: "...", user: {...} }`
- `/api/user/profile` → Should return user data
- `/api/payment/create-order` → Should return Razorpay order

### Check JWT Token
**Browser DevTools → Console:**
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

## Expected Results

### After Signup
- ✅ User created in database
- ✅ Football ID generated (FB20261234 format)
- ✅ OTP sent and stored
- ✅ Email verification required

### After Login
- ✅ Credentials verified
- ✅ OTP sent
- ✅ JWT token issued
- ✅ User redirected to profile

### After Payment
- ✅ Razorpay order created
- ✅ Payment captured
- ✅ Signature verified
- ✅ Database updated (is_paid = true)
- ✅ Payment history recorded

## Test Data Cleanup

### Reset Test User
**Supabase SQL Editor:**
```sql
-- Delete test user and related data
DELETE FROM payment_history WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
DELETE FROM payments WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
DELETE FROM otps WHERE email = 'test@example.com';
DELETE FROM users WHERE email = 'test@example.com';
```

## Production Checklist

Before deploying to production:

- [ ] Set up real email provider (SendGrid/AWS SES)
- [ ] Update `EMAIL_PROVIDER` in `.env`
- [ ] Switch Razorpay to live mode keys
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Change JWT_SECRET to a strong random key
- [ ] Enable Row Level Security in Supabase
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Test on staging environment
- [ ] Run security audit

---

**Estimated Test Time:** 5-10 minutes
**Status:** All features integrated and ready to test
