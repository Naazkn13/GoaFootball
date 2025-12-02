# API Integration Summary

## ✅ Completed Implementation

### 1. **Axios Service Layer** (`/services/axios.js`)
- Configured axios instance with interceptors
- Auto-attaches JWT token to requests
- Handles 401 unauthorized errors
- Global error handling

### 2. **API Service Files Created**
- `/services/api/auth.api.js` - Authentication APIs
- `/services/api/user.api.js` - User profile APIs
- `/services/api/payment.api.js` - Payment APIs

### 3. **Backend API Routes Created**

#### Authentication APIs (`/pages/api/auth/`)
- ✅ `login.js` - Request OTP for login
- ✅ `signup.js` - Create account with OTP
- ✅ `verify-login-otp.js` - Verify OTP and login
- ✅ `verify-signup-otp.js` - Verify email after signup
- ✅ `resend-otp.js` - Resend OTP

#### User APIs (`/pages/api/user/`)
- ✅ `profile.js` - Get/Update user profile
- ✅ `payment-history.js` - Get payment history
- ✅ `payment-status.js` - Check if user paid

#### Payment APIs (`/pages/api/payment/`)
- ✅ `create-order.js` - Create Razorpay order
- ✅ `verify.js` - Verify Razorpay payment
- ✅ `all.js` - Get all payments
- ✅ `[id].js` - Get payment by ID

### 4. **Service Files**
- ✅ `otp.service.js` - Generate & send 4-digit OTP
- ✅ `email.service.js` - Email integration placeholder
- ✅ `uuid.service.js` - Generate Football ID (FB20261234)
- ✅ `payment.service.js` - Razorpay integration
- ✅ `database.js` - Supabase database operations

### 5. **Components**
- ✅ `OTPModal.jsx` - 4-digit OTP popup modal
- ✅ `OTPModal.module.css` - Styled OTP modal

### 6. **Database**
- ✅ Complete SQL schema in `DATABASE_SETUP.md`
- ✅ 4 tables: users, otps, payments, payment_history
- ✅ Football ID format: FB{YEAR}{4DIGITS}
- ✅ RLS policies for security

---

## 📦 Dependencies Added to package.json

```json
"@supabase/supabase-js": "^2.39.0",  // Supabase client
"axios": "^1.6.2",                    // HTTP client
"bcryptjs": "^2.4.3",                 // Password hashing
"jsonwebtoken": "^9.0.2",             // JWT tokens
"razorpay": "^2.9.2"                  // Razorpay integration
```

---

## 🔧 Frontend Integration Guide

### Step 1: Install Dependencies
```bash
cd /home/omkar-kachre/Documents/football/football-auth-app
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
- Supabase credentials
- Razorpay keys
- JWT secret
- Email service credentials (later)

### Step 3: Setup Database
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Run all SQL queries from `DATABASE_SETUP.md`

### Step 4: Update Frontend Pages

#### **Login Page Integration** (pages/login.js)
```javascript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../services/api/auth.api';
import OTPModal from '../components/OTPModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      if (response.requiresOTP) {
        setShowOTP(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    const response = await authAPI.verifyLoginOTP({ email, otp });
    
    // Store token and user
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Redirect to profile
    router.push('/profile');
  };

  const handleResendOTP = async () => {
    await authAPI.resendOTP({ email, purpose: 'login' });
  };

  return (
    <div>
      {/* Your existing login form */}
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={email}
        purpose="login"
      />
    </div>
  );
}
```

#### **Signup Page Integration** (pages/signup.js)
```javascript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../services/api/auth.api';
import OTPModal from '../components/OTPModal';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    aadhaar: '',
  });
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [footballId, setFootballId] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.signup(formData);
      if (response.requiresOTP) {
        setFootballId(response.footballId);
        setShowOTP(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    await authAPI.verifySignupOTP({ email: formData.email, otp });
    
    // Show success message with Football ID
    alert(`Account created! Your Football ID: ${footballId}`);
    
    // Redirect to login
    router.push('/login');
  };

  const handleResendOTP = async () => {
    await authAPI.resendOTP({ email: formData.email, purpose: 'signup' });
  };

  return (
    <div>
      {/* Your existing signup form */}
      <form onSubmit={handleSignup}>
        {/* All form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={formData.email}
        purpose="signup"
      />
    </div>
  );
}
```

#### **Profile Page - Payment Integration**
```javascript
import { useState, useEffect } from 'react';
import { userAPI, paymentAPI } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadPaymentHistory();
  }, []);

  const loadProfile = async () => {
    const response = await userAPI.getProfile();
    setUser(response.user);
  };

  const loadPaymentHistory = async () => {
    const response = await userAPI.getPaymentHistory();
    setPaymentHistory(response.payments);
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await paymentAPI.createOrder(1999); // ₹1999

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderResponse.razorpayKeyId,
          amount: orderResponse.order.amount * 100,
          currency: orderResponse.order.currency,
          name: 'Football App',
          description: 'Registration Payment',
          order_id: orderResponse.order.id,
          handler: async (response) => {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert('Payment successful!');
            loadProfile(); // Refresh profile
          },
          prefill: {
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: '#4CAF50',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {user && (
        <>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Football ID: {user.football_id}</p>
          <p>Payment Status: {user.is_paid ? 'Paid' : 'Pending'}</p>

          {!user.is_paid && (
            <button onClick={handlePayment} disabled={loading}>
              {loading ? 'Processing...' : 'Pay ₹1,999'}
            </button>
          )}
        </>
      )}

      <h2>Payment History</h2>
      {paymentHistory.map((payment) => (
        <div key={payment.id}>
          <p>Amount: ₹{payment.amount}</p>
          <p>Status: {payment.status}</p>
          <p>Date: {new Date(payment.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   - Create `.env.local` from `.env.local.example`
   - Add Supabase URL and keys
   - Add Razorpay keys (you'll provide later)

3. **Setup Database**
   - Run SQL from `DATABASE_SETUP.md` in Supabase

4. **Test the App**
   ```bash
   npm run dev
   ```

5. **Provide Credentials Later**
   - Razorpay API keys
   - Email service credentials
   - Update `.env.local`

---

## 📋 What You Need to Provide

### Razorpay Credentials
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### Supabase Credentials
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### Email Service (Choose One)
- SendGrid API key
- AWS SES credentials
- SMTP credentials

---

## 📂 Files Created/Modified

### New Service Files
- `/services/axios.js`
- `/services/api/auth.api.js`
- `/services/api/user.api.js`
- `/services/api/payment.api.js`
- `/services/otp.service.js`
- `/services/email.service.js`
- `/services/uuid.service.js`
- `/services/payment.service.js`
- `/services/database.js`

### New API Routes
- `/pages/api/auth/login.js`
- `/pages/api/auth/signup.js`
- `/pages/api/auth/verify-login-otp.js`
- `/pages/api/auth/verify-signup-otp.js`
- `/pages/api/auth/resend-otp.js`
- `/pages/api/user/profile.js`
- `/pages/api/user/payment-history.js`
- `/pages/api/user/payment-status.js`
- `/pages/api/payment/create-order.js`
- `/pages/api/payment/verify.js`
- `/pages/api/payment/all.js`
- `/pages/api/payment/[id].js`

### New Components
- `/components/OTPModal.jsx`
- `/styles/OTPModal.module.css`

### Documentation
- `/DATABASE_SETUP.md` - Complete database schema
- `/API_INTEGRATION_SUMMARY.md` - This file
- `/.env.local.example` - Environment variables template

### Updated Files
- `/package.json` - Added dependencies

---

## 🔒 Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT token authentication
✅ OTP expiry (5 minutes)
✅ OTP attempt limiting (max 3)
✅ Razorpay signature verification
✅ Row Level Security (RLS) on Supabase
✅ Authorization headers on protected routes

---

## 📊 Database Tables Summary

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | User accounts | Football ID (FB20261234), payment status |
| **otps** | OTP verification | 4-digit, 5-min expiry, attempt limiting |
| **payments** | Razorpay transactions | Order tracking, signature verification |
| **payment_history** | Audit log | All payment actions tracked |

---

**Status**: ✅ All APIs created and ready for integration  
**Next**: Install dependencies and provide credentials
