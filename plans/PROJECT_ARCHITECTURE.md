# Football Auth App — Complete Project Architecture

> **Last updated:** 2026-02-20
> **Framework:** Next.js 14 (Pages Router) | **Database:** Supabase (PostgreSQL) | **Payment:** Razorpay
> **Auth:** Email OTP + HTTP-Only Cookie JWT | **Storage:** Supabase Storage

---

## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project File Structure](#2-project-file-structure)
3. [Database Schema & Tables](#3-database-schema--tables)
4. [Session Management & Authentication](#4-session-management--authentication)
5. [Application Flows](#5-application-flows)
6. [Frontend Pages](#6-frontend-pages)
7. [API Routes](#7-api-routes)
8. [Backend Services](#8-backend-services)
9. [Frontend Services (Client-Side API Wrappers)](#9-frontend-services-client-side-api-wrappers)
10. [Reusable Components](#10-reusable-components)
11. [Styles](#11-styles)
12. [Middleware & Route Protection](#12-middleware--route-protection)
13. [Environment Variables](#13-environment-variables)
14. [Scripts & Utilities](#14-scripts--utilities)

---

## 1. Tech Stack & Dependencies

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| Next.js | ^14.0.3 | React framework (Pages Router) |
| React | ^18.3.1 | UI library |
| React DOM | ^18.3.1 | DOM rendering |

### Backend & Database
| Technology | Version | Purpose |
|---|---|---|
| @supabase/supabase-js | ^2.39.0 | Supabase client (DB + Storage) |
| jsonwebtoken | ^9.0.2 | JWT token creation & verification |
| bcryptjs | ^2.4.3 | Password hashing (legacy, not actively used) |
| formidable | ^3.5.4 | File upload parsing (multipart/form-data) |
| razorpay | ^2.9.2 | Payment gateway SDK |
| nodemailer | ^7.0.11 | Email delivery |

### HTTP & Networking
| Technology | Version | Purpose |
|---|---|---|
| axios | ^1.13.2 | HTTP client (frontend → API) |
| express | ^4.21.2 | Custom server (production) |
| cors | ^2.8.5 | Cross-origin resource sharing |
| helmet | ^4.6.0 | Security headers |
| cookie | ^0.6.0 | Cookie parsing |
| http-proxy | ^1.18.1 | Proxy middleware |

### Dev & Build
| Technology | Version | Purpose |
|---|---|---|
| dotenv | ^17.2.3 | Environment variable loading |
| copy-webpack-plugin | ^13.0.1 | Webpack asset copying |

### NPM Scripts
```json
{
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "NODE_ENV=production node server-simple.js",
  "prod": "next export",
  "lint": "next lint"
}
```

---

## 2. Project File Structure

```
football-auth-app/
├── components/                    # Reusable React components
│   ├── ApprovalBadge.jsx          # Status badge (pending/approved/rejected)
│   ├── ChatDrawer.jsx             # Slide-out chat panel
│   ├── Footer.js                  # Global footer
│   ├── OTPModal.jsx               # 4-digit OTP input modal
│   ├── RegistrationForm.jsx       # Multi-field registration form
│   └── RoleSelectionForm.jsx      # Role picker (Athlete/Coach/Referee/Manager)
│
├── pages/                         # Next.js pages (routes)
│   ├── _app.js                    # App wrapper (AuthProvider + Footer)
│   ├── _document.js               # Custom HTML document
│   ├── _error.js                  # Error page
│   ├── index.js                   # Homepage (FITEQ design)
│   ├── login.js                   # Email + OTP login
│   ├── signup.js                  # Legacy signup (orphaned)
│   ├── register.js                # Multi-step registration
│   ├── profile.js                 # User profile + payment
│   ├── about.js                   # About page
│   ├── contact.js                 # Contact page
│   ├── event-info.js              # Event information
│   ├── privacy-policy.js          # Privacy policy
│   ├── refund-policy.js           # Refund policy
│   ├── terms-and-conditions.js    # Terms & conditions
│   │
│   ├── admin/                     # Admin dashboard
│   │   └── index.js               # Admin panel (registrations/users/chat/settings)
│   │
│   └── api/                       # API Routes (serverless functions)
│       ├── auth/                  # Authentication endpoints
│       │   ├── send-otp.js        # POST — Send OTP email
│       │   ├── verify-otp.js      # POST — Verify OTP + create session
│       │   ├── logout.js          # POST — Clear session cookie
│       │   ├── resend-otp.js      # POST — Resend OTP
│       │   ├── login.js           # POST — Legacy login (unused)
│       │   ├── signup.js          # POST — Legacy signup (unused)
│       │   ├── verify-login-otp.js  # POST — Legacy OTP verify (unused)
│       │   └── verify-signup-otp.js # POST — Legacy signup OTP (unused)
│       │
│       ├── admin/                 # Admin-only endpoints
│       │   ├── registrations.js   # GET — List registrations by status
│       │   ├── approve.js         # POST — Approve/reject/hold user
│       │   ├── create-admin.js    # POST — Grant admin access (super-admin only)
│       │   └── users.js           # GET — List all users (search)
│       │
│       ├── payment/               # Payment endpoints
│       │   ├── create-order.js    # POST — Create Razorpay order (₹500)
│       │   ├── verify.js          # POST — Verify Razorpay signature
│       │   ├── [id].js            # GET — Get single payment by ID
│       │   └── all.js             # GET — Get all user payments
│       │
│       ├── user/                  # User endpoints
│       │   ├── profile.js         # GET/PUT — User profile CRUD
│       │   ├── register.js        # POST — Submit registration data
│       │   ├── upload-document.js # POST — Upload file to Supabase Storage
│       │   ├── payment-status.js  # GET — Payment status + latest payment
│       │   └── payment-history.js # GET — Payment history list
│       │
│       └── messages/              # Chat/messaging endpoints
│           ├── send.js            # POST — Send message
│           ├── [partnerId].js     # GET — Chat history with partner
│           └── unread.js          # GET — Unread message count
│
├── services/                      # Backend services
│   ├── database.js                # Supabase database operations (CRUD)
│   ├── session.service.js         # JWT session management
│   ├── otp.service.js             # OTP generation + email sending
│   ├── email.service.js           # Email delivery (pluggable providers)
│   ├── payment.service.js         # Razorpay SDK wrapper
│   ├── uuid.service.js            # Football ID generator (FB20261234)
│   ├── auth.service.js            # Legacy auth service (unused)
│   ├── apis.js                    # Legacy fetch-based API client (unused)
│   ├── axios.js                   # Axios instance (cookies, interceptors)
│   └── api/                       # Frontend API wrappers
│       ├── auth.api.js            # Auth endpoints wrapper
│       ├── payment.api.js         # Payment endpoints wrapper
│       └── user.api.js            # User endpoints wrapper
│
├── store/                         # State management
│   └── AuthContext.js             # React Context for auth state
│
├── styles/                        # CSS Modules
│   ├── globals.css                # Global styles
│   ├── Home.module.css            # Homepage styles
│   ├── Auth.module.css            # Login page styles
│   ├── Register.module.css        # Registration styles
│   ├── Profile.module.css         # Profile page styles
│   ├── Admin.module.css           # Admin dashboard styles
│   ├── OTPModal.module.css        # OTP modal styles
│   ├── ChatDrawer.module.css      # Chat panel styles
│   ├── Footer.module.css          # Footer styles
│   ├── EventInfo.module.css       # Event info page styles
│   ├── PolicyPages.module.css     # Policy pages styles
│   └── Landing.module.css         # Legacy landing styles (unused)
│
├── scripts/                       # Utility scripts
│   └── setup-admin.mjs           # One-time admin setup script
│
├── middleware.js                  # Next.js middleware (route protection)
├── next.config.js                 # Next.js configuration
├── jsconfig.json                  # Path aliases (@/)
├── package.json                   # Dependencies & scripts
├── server.js                      # Production Express server
├── server-simple.js               # Simplified production server
├── setup-database.js              # Database setup script
├── CREATE_TABLES.sql              # SQL table creation script
├── .env.local                     # Environment variables (local)
├── .env.vercel                    # Environment variables (Vercel deploy)
└── .env.example                   # Example env template
```

---

## 3. Database Schema & Tables

The database is hosted on **Supabase** (PostgreSQL). All tables use **UUID** primary keys.

### 3.1 `users` Table

The core table storing all user data, registration details, admin flags, and approval status.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PRIMARY KEY | Unique user ID |
| `name` | VARCHAR(255) | — | NOT NULL | Full name |
| `email` | VARCHAR(255) | — | UNIQUE, NOT NULL | Email address |
| `phone` | VARCHAR(15) | — | NOT NULL | Phone number |
| `aadhaar` | VARCHAR(12) | — | NOT NULL | Aadhaar number |
| `password_hash` | TEXT | — | NOT NULL | Legacy password hash (not used in OTP flow) |
| `football_id` | VARCHAR(20) | NULL | UNIQUE | Football UID (e.g., `FB20259173`) — assigned on approval |
| `role` | VARCHAR | NULL | — | `athlete`, `coach`, `referee`, `manager` |
| `role_details` | JSONB | `{}` | — | Role-specific fields (position, experience, etc.) |
| `date_of_birth` | DATE | NULL | — | Date of birth |
| `gender` | VARCHAR | NULL | — | Gender |
| `address` | JSONB | `{}` | — | Address object `{line1, city, state, pincode}` |
| `documents` | JSONB | `[]` | — | Array of `{type, url}` uploaded document links |
| `profile_photo_url` | TEXT | NULL | — | Supabase Storage signed URL for profile photo |
| `is_paid` | BOOLEAN | `false` | — | Whether ₹500 registration fee is paid |
| `payment_date` | TIMESTAMPTZ | NULL | — | When payment was made |
| `email_verified` | BOOLEAN | `false` | — | Whether email OTP was verified |
| `registration_completed` | BOOLEAN | `false` | — | Whether the multi-step registration form is submitted |
| `approval_status` | VARCHAR(50) | `'pending'` | — | `pending`, `approved`, `rejected`, `on_hold` |
| `approval_reason` | TEXT | NULL | — | Admin's reason for rejection/hold |
| `approved_by` | UUID | NULL | — | Admin user ID who approved/rejected |
| `approved_at` | TIMESTAMPTZ | NULL | — | When approval action was taken |
| `is_admin` | BOOLEAN | `false` | — | Has admin access |
| `is_super_admin` | BOOLEAN | `false` | — | Has super admin access (can grant admin) |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Account creation time |
| `updated_at` | TIMESTAMPTZ | `NOW()` | — | Last update time |
| `last_login` | TIMESTAMPTZ | NULL | — | Last login timestamp |

### 3.2 `otps` Table

Stores one-time passwords for email verification.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PRIMARY KEY | OTP record ID |
| `email` | VARCHAR(255) | — | NOT NULL | Target email |
| `otp` | VARCHAR(6) | — | NOT NULL | 4-digit OTP code (stored as string) |
| `purpose` | VARCHAR(50) | — | NOT NULL | `login` or `signup` |
| `attempts` | INTEGER | `0` | — | Failed verification attempts (max 3) |
| `expires_at` | TIMESTAMPTZ | — | NOT NULL | Expiry time (5 minutes from creation) |
| `used` | BOOLEAN | `false` | — | Whether OTP has been consumed |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Creation time |

### 3.3 `payments` Table

Tracks Razorpay payment orders and their status.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PRIMARY KEY | Payment record ID |
| `user_id` | UUID | — | FK → `users.id`, ON DELETE CASCADE | Owner user |
| `razorpay_order_id` | VARCHAR(255) | — | UNIQUE, NOT NULL | Razorpay order ID |
| `razorpay_payment_id` | VARCHAR(255) | NULL | UNIQUE | Razorpay payment ID (set after success) |
| `razorpay_signature` | TEXT | NULL | — | HMAC signature for verification |
| `amount` | INTEGER | — | NOT NULL | Amount in rupees (₹500) |
| `currency` | VARCHAR(10) | `'INR'` | — | Currency code |
| `status` | VARCHAR(50) | `'created'` | — | `created`, `success`, `failed` |
| `paid_at` | TIMESTAMPTZ | NULL | — | When payment was fulfilled |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Order creation time |
| `updated_at` | TIMESTAMPTZ | `NOW()` | — | Last update time |

### 3.4 `payment_history` Table

Audit log of payment state changes.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PRIMARY KEY | History ID |
| `payment_id` | UUID | — | FK → `payments.id`, ON DELETE CASCADE | Parent payment |
| `user_id` | UUID | — | FK → `users.id`, ON DELETE CASCADE | Owner user |
| `amount` | INTEGER | — | NOT NULL | Amount |
| `status` | VARCHAR(50) | — | NOT NULL | Status at this point |
| `razorpay_payment_id` | VARCHAR(255) | NULL | — | Razorpay payment ID |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Log entry time |

### 3.5 `messages` Table

Chat messages between users and admins.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PRIMARY KEY | Message ID |
| `sender_id` | UUID | — | FK → `users.id` | Who sent the message |
| `receiver_id` | UUID | — | FK → `users.id` | Who receives the message |
| `message` | TEXT | — | NOT NULL | Message content |
| `is_read` | BOOLEAN | `false` | — | Read receipt |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Sent time |

### 3.6 Database Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_football_id ON users(football_id);
CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
```

### 3.7 Database Functions & Triggers

| Name | Type | Purpose |
|---|---|---|
| `update_updated_at_column()` | TRIGGER FUNCTION | Auto-updates `updated_at` on row modification |
| `cleanup_expired_otps()` | FUNCTION | Deletes expired OTP records |
| `update_users_updated_at` | TRIGGER on `users` | Calls `update_updated_at_column()` |
| `update_payments_updated_at` | TRIGGER on `payments` | Calls `update_updated_at_column()` |

### 3.8 Supabase Storage

| Bucket | Max Size | Allowed Types | Purpose |
|---|---|---|---|
| `documents` | 20 MB | `image/png`, `image/jpeg`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Profile photos and ID proof uploads |

---

## 4. Session Management & Authentication

### 4.1 How Sessions Work

The app uses **HTTP-Only Cookie JWT** sessions, NOT client-side localStorage tokens.

```
┌─────────────┐   1. POST /api/auth/send-otp   ┌──────────────┐
│   Browser    │ ─────────────────────────────→  │  API Route   │
│  (Frontend)  │                                 │  send-otp.js │
│              │   2. OTP logged to console      │              │
│              │ ←─────────────────────────────   │              │
│              │                                 └──────────────┘
│              │
│              │   3. POST /api/auth/verify-otp   ┌──────────────┐
│              │ ─────────────────────────────→   │  API Route   │
│              │                                  │ verify-otp.js│
│              │   4. Set-Cookie: session_token=   │              │
│              │      (HttpOnly, Lax, 7-day)      │              │
│              │ ←─────────────────────────────   │              │
│              │                                  └──────────────┘
│              │
│              │   5. All future requests include │              │
│              │      Cookie: session_token=JWT   │  Any API     │
│              │ ─────────────────────────────→   │  Route       │
└─────────────┘                                  └──────────────┘
```

### 4.2 Session Service — `services/session.service.js`

| Function | Purpose |
|---|---|
| `createSession(res, user)` | Signs a JWT with user data, sets it as an HttpOnly cookie (7-day expiry) |
| `getSession(req)` | Parses the cookie, verifies the JWT, returns the decoded payload or `null` |
| `requireSession(req, res)` | Calls `getSession()` — returns payload or sends 401 Unauthorized |
| `requireAdmin(req, res)` | Calls `requireSession()` — then checks `is_admin: true` or sends 403 |
| `requireSuperAdmin(req, res)` | Calls `requireSession()` — then checks `is_super_admin: true` or sends 403 |
| `clearSession(res)` | Sets the cookie to empty with `Max-Age=0` (logout) |

### 4.3 JWT Payload Structure

When a session is created, the JWT contains:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "athlete",
  "is_admin": false,
  "is_super_admin": false,
  "approval_status": "pending",
  "registration_completed": false,
  "football_id": null,
  "iat": 1708433600,
  "exp": 1709038400
}
```

### 4.4 Cookie Properties

| Property | Value |
|---|---|
| Name | `session_token` |
| HttpOnly | `true` (not accessible via JavaScript) |
| SameSite | `Lax` |
| Secure | `true` (production only) |
| Max-Age | `604800` (7 days) |
| Path | `/` |

### 4.5 AuthContext — `store/AuthContext.js`

The React context provides auth state to all frontend pages.

| Property/Method | Type | Description |
|---|---|---|
| `user` | Object / null | Current user profile (fetched from `/api/user/profile`) |
| `loading` | Boolean | Whether the initial auth check is in progress |
| `isAuthenticated` | Boolean | `!!user` |
| `isAdmin` | Boolean | `user?.is_admin \|\| false` |
| `isSuperAdmin` | Boolean | `user?.is_super_admin \|\| false` |
| `login(userData)` | Function | Sets user state after OTP verification |
| `logout()` | Function | Calls `/api/auth/logout`, clears user state |
| `refreshUser()` | Function | Re-fetches profile from API, updates state |

On mount, `AuthContext` calls `GET /api/user/profile` — the browser automatically sends the session cookie. If the cookie is valid, the user profile is loaded; otherwise user is `null`.

### 4.6 Axios Interceptor — `services/axios.js`

- `withCredentials: true` — ensures cookies are sent with every request
- 401 responses auto-redirect to `/login` (except if already on login page)
- Timeout: 30 seconds

---

## 5. Application Flows

### 5.1 New User Registration Flow

```
Homepage (/) ──→ Click "Register Now" ──→ /login (if not authenticated)
                                             │
                                             ▼
                                     Enter email
                                             │
                                             ▼
                               POST /api/auth/send-otp
                              (creates user record if new)
                                             │
                                             ▼
                                   OTP Modal (4 digits)
                                             │
                                             ▼
                              POST /api/auth/verify-otp
                             (creates session cookie)
                            (redirectTo: "/register")
                                             │
                                             ▼
                               /register — Step 1: Role Selection
                              (Athlete, Coach, Referee, Manager)
                                             │
                                             ▼
                              /register — Step 2: Details Form
                              (name, DOB, gender, phone, aadhaar,
                               address, documents, photo upload)
                                             │
                                             ▼
                              POST /api/user/upload-document
                              (photo + ID proof → Supabase Storage)
                                             │
                                             ▼
                              POST /api/user/register
                              (saves all details, registration_completed: true)
                                             │
                                             ▼
                              /register — Step 3: Payment
                              POST /api/payment/create-order (₹500)
                                             │
                                             ▼
                              Razorpay Checkout Modal
                                             │
                                             ▼
                              POST /api/payment/verify
                              (verifies signature, is_paid: true)
                                             │
                                             ▼
                              Redirect → /profile
                              (shows "Pending Approval" badge)
```

### 5.2 Returning User Login Flow

```
/login ──→ Enter email ──→ POST /api/auth/send-otp
                               │
                               ▼
                          OTP Modal (4 digits)
                               │
                               ▼
                     POST /api/auth/verify-otp
                               │
                    ┌──────────┴──────────┐
                    │                     │
              is_admin? YES          is_admin? NO
                    │                     │
                    ▼                     ▼
              Redirect: /admin    registration_completed?
                                    │            │
                                   YES           NO
                                    │            │
                                    ▼            ▼
                              Redirect:    Redirect:
                              /profile     /register
```

### 5.3 Admin Approval Flow

```
Admin logs in ──→ /admin (admin dashboard)
                         │
                         ▼
              Registration Queue (filter: pending/approved/rejected/on_hold)
                         │
                         ▼
              View user details (name, email, role, phone, DOB, documents)
                         │
              ┌──────────┼──────────┐
              │          │          │
         ✓ Approve   ✕ Reject   ⏸ Hold
              │          │          │
              │    (reason modal)  (reason modal)
              │          │          │
              ▼          ▼          ▼
        POST /api/admin/approve
        {userId, action, reason}
              │
              ▼
        If approved:
          → Generate Football ID (FTUID-XXXXXX-XXXX)
          → Set approval_status: "approved"
              │
        If rejected:
          → Set approval_status: "rejected"
          → Store approval_reason
              │
        If hold:
          → Set approval_status: "on_hold"
          → Store approval_reason
```

### 5.4 Payment Flow (Razorpay)

```
Profile/Register Page
        │
        ▼
  POST /api/payment/create-order
  (server creates Razorpay order, amount ₹500 hardcoded)
        │
        ▼
  Frontend opens Razorpay Checkout
  (NEXT_PUBLIC_RAZORPAY_KEY_ID)
        │
        ▼
  User completes payment
        │
        ▼
  POST /api/payment/verify
  {razorpay_order_id, razorpay_payment_id, razorpay_signature}
        │
        ▼
  Server verifies HMAC signature:
    HMAC-SHA256(orderId|paymentId, RAZORPAY_KEY_SECRET) === signature
        │
        ├─ Valid: Update payment status to "success",
        │         Set user.is_paid = true
        │
        └─ Invalid: Return error
```

### 5.5 Messaging Flow

```
User Profile Page
        │
        ▼
  Open ChatDrawer component
        │
        ▼
  GET /api/messages/unread (get unread count)
  GET /api/messages/[partnerId] (load chat history)
        │
        ▼
  POST /api/messages/send
  {receiverId, message}
        │
        ▼
  Message stored in `messages` table
  (sender_id, receiver_id, message, is_read: false)
        │
        ▼
  When partner opens chat:
  Messages auto-marked as read (is_read: true)
```

---

## 6. Frontend Pages

### 6.1 `pages/_app.js` — App Wrapper
- Wraps everything in `<AuthProvider>`
- Renders `<Footer>` on all pages except `/login` and `/signup`
- Flex layout: content fills viewport, footer at bottom

### 6.2 `pages/index.js` — Homepage
- **Route:** `/`
- FITEQ-inspired design with animated stats counter
- Sections: Navbar → Hero → Stats → Role CTA Cards → How It Works → About → CTA Banner
- Navbar shows "🛡️ Admin" link for admin users, "My Profile" for authenticated, "Login/Register" for guests
- Role CTA cards link to `/register` (authenticated) or `/login` (guest)

### 6.3 `pages/login.js` — Login Page
- **Route:** `/login`
- Single email input → "Send OTP" button
- OTP Modal opens after OTP is sent
- After verification, redirects to URL from `response.redirectTo`
- Side panel shows role badges and registration info
- "Back to Home" link

### 6.4 `pages/register.js` — Multi-Step Registration
- **Route:** `/register`
- **Step 1 — Role Selection:** Athlete, Coach, Referee, Manager (card-based picker)
- **Step 2 — Details Form:** Personal info, address, photo upload, ID proof upload
  - Uses `RegistrationForm` component
  - Uploads files via `POST /api/user/upload-document`
  - Submits registration via `POST /api/user/register`
- **Step 3 — Payment:** Creates Razorpay order, opens checkout, verifies on success
- On completion: redirects to `/profile`

### 6.5 `pages/profile.js` — User Profile
- **Route:** `/profile`
- Shows: Avatar, name, email, Football ID, approval badge
- Editable fields: Name, Phone, Aadhaar (via PUT `/api/user/profile`)
- **Admin users:** Shows "🛡️ Admin Access" section with link to admin dashboard
- **Non-admin, unregistered:** Shows "⚠️ Registration Incomplete" with link to `/register`
- **Registered, not paid:** Shows "Proceed to Payment" button
- **Paid:** Shows payment status + payment history
- Success modal after payment completion

### 6.6 `pages/admin/index.js` — Admin Dashboard
- **Route:** `/admin`
- Requires `isAdmin: true` from AuthContext
- Non-admin users are redirected to `/` (homepage)
- **Tabs:**
  - **📋 Registrations:** Filter by status (pending/approved/rejected/on_hold), view details, approve/reject/hold
  - **👥 Users:** Search users by name/email/UID, view table
  - **💬 Chat:** Placeholder for messaging
  - **⚙️ Settings (super-admin only):** Grant admin access by email

### 6.7 `pages/signup.js` — Legacy Signup (Orphaned)
- **Route:** `/signup`
- Old email/password signup flow — **no longer used** in the OTP-based system
- Should be deleted

### 6.8 Static Pages
| Page | Route | Content |
|---|---|---|
| `about.js` | `/about` | Organization information |
| `contact.js` | `/contact` | Contact form |
| `event-info.js` | `/event-info` | Event schedule & details |
| `privacy-policy.js` | `/privacy-policy` | Privacy policy |
| `refund-policy.js` | `/refund-policy` | Refund policy |
| `terms-and-conditions.js` | `/terms-and-conditions` | Terms & conditions |

---

## 7. API Routes

### 7.1 Auth APIs (`/api/auth/`)

| Endpoint | Method | Auth | File | Description |
|---|---|---|---|---|
| `/api/auth/send-otp` | POST | None | `send-otp.js` | Accepts `{email}`. Creates user if new. Generates 4-digit OTP. Stores in DB (5-min expiry). Sends via email service. |
| `/api/auth/verify-otp` | POST | None | `verify-otp.js` | Accepts `{email, otp}`. Verifies OTP. Marks email as verified. Creates session cookie. Returns `redirectTo`: admin→`/admin`, registered→`/profile`, new→`/register`. |
| `/api/auth/logout` | POST | Session | `logout.js` | Clears the `session_token` cookie. |
| `/api/auth/resend-otp` | POST | None | `resend-otp.js` | Resends OTP to same email. |

**Legacy (unused):** `login.js`, `signup.js`, `verify-login-otp.js`, `verify-signup-otp.js`

### 7.2 User APIs (`/api/user/`)

| Endpoint | Method | Auth | File | Description |
|---|---|---|---|---|
| `/api/user/profile` | GET | `requireSession` | `profile.js` | Returns full user profile from DB. |
| `/api/user/profile` | PUT | `requireSession` | `profile.js` | Updates name, phone, aadhaar. |
| `/api/user/register` | POST | `requireSession` | `register.js` | Submits registration data (name, DOB, gender, phone, aadhaar, role, role_details, address, documents, profile_photo_url). Sets `registration_completed: true`. Re-creates session cookie with updated data. |
| `/api/user/upload-document` | POST | `requireSession` | `upload-document.js` | Parses multipart file upload with `formidable`. Validates type/size. Uploads to Supabase Storage bucket `documents`. Returns 1-year signed URL. Size limit: 5MB (photos), 10MB (documents). |
| `/api/user/payment-status` | GET | `requireSession` | `payment-status.js` | Returns `isPaid`, `footballId`, and latest payment details. |
| `/api/user/payment-history` | GET | `requireSession` | `payment-history.js` | Returns list of payment history records. |

### 7.3 Payment APIs (`/api/payment/`)

| Endpoint | Method | Auth | File | Description |
|---|---|---|---|---|
| `/api/payment/create-order` | POST | `requireSession` | `create-order.js` | Creates Razorpay order for ₹500 (amount hardcoded server-side). Checks if already paid. Stores payment record in DB. Returns order details + `razorpayKeyId`. |
| `/api/payment/verify` | POST | Bearer JWT | `verify.js` | Verifies Razorpay payment signature (HMAC-SHA256). Updates payment status to `success`. Sets `user.is_paid = true`. Creates payment history entry. **Note: Uses Bearer token auth, not cookie.** |
| `/api/payment/[id]` | GET | Session | `[id].js` | Gets single payment record by ID. |
| `/api/payment/all` | GET | Session | `all.js` | Gets all payments for the current user. |

### 7.4 Admin APIs (`/api/admin/`)

| Endpoint | Method | Auth | File | Description |
|---|---|---|---|---|
| `/api/admin/registrations` | GET | `requireAdmin` | `registrations.js` | Lists users where `registration_completed = true` filtered by `approval_status` (from query param `?status=pending`). Returns registrations + count. |
| `/api/admin/approve` | POST | `requireAdmin` | `approve.js` | Actions: `approve`, `reject`, `hold`. On approve: generates Football ID (`FTUID-XXXX-XXXX`). On reject/hold: requires `reason`. Updates user's approval_status, approval_reason, approved_by, approved_at. |
| `/api/admin/create-admin` | POST | `requireSuperAdmin` | `create-admin.js` | Grants admin access to a user by email. Creates user if not exists. Super-admin only. |
| `/api/admin/users` | GET | `requireAdmin` | `users.js` | Lists all users with optional search query. |

### 7.5 Messages APIs (`/api/messages/`)

| Endpoint | Method | Auth | File | Description |
|---|---|---|---|---|
| `/api/messages/send` | POST | `requireSession` | `send.js` | Sends message: `{receiverId, message}`. Inserts into `messages` table. |
| `/api/messages/[partnerId]` | GET | `requireSession` | `[partnerId].js` | Fetches all messages between current user and partner. Marks partner's messages as read. |
| `/api/messages/unread` | GET | `requireSession` | `unread.js` | Returns count of unread messages for current user. |

---

## 8. Backend Services

### 8.1 `services/database.js` — Database Operations

| Method | Description |
|---|---|
| `createUser(userData)` | Inserts new user into `users` table |
| `getUserByEmail(email)` | Finds user by email (returns null if not found) |
| `getUserByFootballId(footballId)` | Finds user by Football ID |
| `updateUser(id, updates)` | Updates user by ID, returns updated record |
| `storeOTP(otpData)` | Inserts OTP record into `otps` table |
| `verifyOTP(email, otp, purpose)` | Marks OTP as used if valid (not expired, < 3 attempts) |
| `incrementOTPAttempts(email, purpose)` | Increments failed attempt counter (via RPC) |
| `createPayment(paymentData)` | Creates payment record |
| `updatePayment(id, updates)` | Updates payment record |
| `getPaymentsByUserId(userId)` | Lists payments for a user (newest first) |
| `getPaymentByRazorpayOrderId(orderId)` | Finds payment by Razorpay order ID |
| `createPaymentHistory(historyData)` | Creates payment history audit entry |
| `getPaymentHistory(userId)` | Lists payment history for a user (newest first) |

Also exports: `supabase` (anon key client) and `supabaseAdmin` (service role client, bypasses RLS).

### 8.2 `services/session.service.js` — JWT Session Management

Covered in [Section 4.2](#42-session-service--servicessessionservicejs).

### 8.3 `services/otp.service.js` — OTP Service

| Method | Description |
|---|---|
| `generateOTP()` | Generates a random 4-digit number (1000-9999) |
| `sendOTPEmail(email, otp, purpose)` | Builds HTML email template, sends via email service |
| `storeOTP(email, otp, purpose)` | Returns SQL for upsert (legacy, DB class handles this now) |
| `verifyOTP(email, otp, purpose)` | Returns SQL for verification (legacy) |
| `incrementAttempts(email, purpose)` | Returns SQL for incrementing attempts (legacy) |

### 8.4 `services/email.service.js` — Email Delivery

Supports multiple providers via `EMAIL_PROVIDER` env var:

| Provider | Status | How |
|---|---|---|
| `console` (default) | ✅ Working | Logs OTP to server console |
| `nodemailer` | ✅ Ready | Uses SMTP credentials from env vars |
| `sendgrid` | 🔧 Placeholder | Not implemented |
| `aws-ses` | 🔧 Placeholder | Not implemented |

### 8.5 `services/payment.service.js` — Razorpay SDK

| Method | Description |
|---|---|
| `createOrder(amount, currency, receipt)` | Creates Razorpay order (amount in rupees → paise conversion) |
| `verifyPaymentSignature(orderId, paymentId, signature)` | HMAC-SHA256 verification |
| `fetchPaymentDetails(paymentId)` | Fetches payment from Razorpay API |
| `fetchOrderPayments(orderId)` | Fetches all payments for an order |
| `refundPayment(paymentId, amount)` | Initiates refund |
| `capturePayment(paymentId, amount)` | Manual payment capture |

Falls back to **mock mode** when `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` is not set.

### 8.6 `services/uuid.service.js` — Football ID Generator

| Method | Description |
|---|---|
| `generateFootballID()` | Returns `FB` + year + 4 random digits (e.g., `FB20259173`) |
| `parseFootballID(id)` | Parses into `{prefix, year, number}` |
| `validateFootballID(id)` | Validates format against regex `/^FB\d{8}$/` |

**Note:** The admin approval flow uses a different format: `FTUID-TIMESTAMP-RANDOM` (in `approve.js`), not this service.

---

## 9. Frontend Services (Client-Side API Wrappers)

### 9.1 `services/api/auth.api.js`

| Method | Maps To |
|---|---|
| `authAPI.sendOTP(email)` | `POST /api/auth/send-otp` |
| `authAPI.verifyOTP(email, otp)` | `POST /api/auth/verify-otp` |
| `authAPI.logout()` | `POST /api/auth/logout` |
| `authAPI.resendOTP(email)` | `POST /api/auth/send-otp` |

### 9.2 `services/api/payment.api.js`

| Method | Maps To |
|---|---|
| `paymentAPI.createOrder()` | `POST /api/payment/create-order` |
| `paymentAPI.verifyPayment(data)` | `POST /api/payment/verify` |
| `paymentAPI.getAllPayments()` | `GET /api/payment/all` |

### 9.3 `services/api/user.api.js`

| Method | Maps To |
|---|---|
| `userAPI.getProfile()` | `GET /api/user/profile` |
| `userAPI.updateProfile(data)` | `PUT /api/user/profile` |
| `userAPI.getPaymentHistory()` | `GET /api/user/payment-history` |
| `userAPI.getPaymentStatus()` | `GET /api/user/payment-status` |

### 9.4 Legacy Services (Unused)

- `services/apis.js` — Fetch-based API client (replaced by axios)
- `services/auth.service.js` — Old auth service using `apiService` (replaced by `auth.api.js`)

---

## 10. Reusable Components

### 10.1 `components/OTPModal.jsx`
- **4-digit** OTP input with auto-focus and paste support
- Timer display (5-minute expiry)
- "Resend OTP" button
- Loading, error, and success states
- Props: `isOpen`, `email`, `purpose`, `onVerify`, `onResend`, `onClose`

### 10.2 `components/RegistrationForm.jsx`
- Multi-field form for registration Step 2
- Fields: Name, DOB, Gender, Phone, Aadhaar, Address (line1, city, state, pincode)
- Role-specific details based on selected role
- Photo and ID proof file inputs
- Props: `role`, `onSubmit`, `loading`

### 10.3 `components/RoleSelectionForm.jsx`
- Card-based role picker for registration Step 1
- Roles: 🏃 Athlete, 🏋️ Coach, 🏁 Referee, 📋 Manager
- Props: `onSelect`, `selectedRole`

### 10.4 `components/ApprovalBadge.jsx`
- Renders a colored status badge based on `approval_status`
- Colors: pending (amber), approved (green), rejected (red), on_hold (blue)

### 10.5 `components/ChatDrawer.jsx`
- Slide-out chat panel for user↔admin messaging
- Message list with sender/receiver bubbles
- Input field + send button
- Loads chat history from `/api/messages/[partnerId]`
- Sends messages via `/api/messages/send`

### 10.6 `components/Footer.js`
- Global footer with navigation links
- Links to: About, Contact, Event Info, Privacy Policy, Terms, Refund Policy
- Copyright notice

---

## 11. Styles

All styles use **CSS Modules** (`.module.css`) for scoped styling.

| File | Used By | Description |
|---|---|---|
| `globals.css` | `_app.js` | Global resets, body background, font imports |
| `Home.module.css` | `pages/index.js` | Homepage (navbar, hero, stats, roles, sections) |
| `Auth.module.css` | `pages/login.js` | Login page (form, side panel, divider, role badges) |
| `Register.module.css` | `pages/register.js` | Registration stepper, form fields, upload areas |
| `Profile.module.css` | `pages/profile.js` | Profile card, edit mode, payment section |
| `Admin.module.css` | `pages/admin/index.js` | Admin dashboard (sidebar, stats bar, tables, modals) |
| `OTPModal.module.css` | `components/OTPModal.jsx` | OTP modal overlay, digit inputs, timer |
| `ChatDrawer.module.css` | `components/ChatDrawer.jsx` | Chat drawer, message bubbles, input area |
| `Footer.module.css` | `components/Footer.js` | Footer layout, links, copyright |
| `EventInfo.module.css` | `pages/event-info.js` | Event page layout |
| `PolicyPages.module.css` | Policy pages | Privacy, terms, refund page styles |
| `Landing.module.css` | — | Legacy landing page (unused) |

---

## 12. Middleware & Route Protection

### `middleware.js`

Runs on **every request** before the page loads. It protects routes by checking for the `session_token` cookie.

**Public routes (no auth required):**
- `/` (homepage)
- `/login`
- `/signup`
- `/about`
- `/contact`
- `/event-info`
- `/privacy-policy`
- `/refund-policy`
- `/terms-and-conditions`

**Skipped paths:**
- `/api/*` (API routes handle their own auth)
- `/_next/*` (Next.js internals)
- Static files (`/favicon.ico`, etc.)

**Protected routes:**
- If no `session_token` cookie → redirect to `/login`
- `/admin/*` — middleware allows it through (admin check is done client-side in the admin page + server-side in admin API routes)

---

## 13. Environment Variables

### Required Variables (`.env.local`)

| Variable | Example | Used In | Description |
|---|---|---|---|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | `database.js` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | `database.js` | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | `database.js` | Supabase service role key (bypasses RLS) |
| `JWT_SECRET` | `your-secret-key` | `session.service.js` | Secret for signing JWTs |
| `RAZORPAY_KEY_ID` | `rzp_test_xxxx` | `payment.service.js`, `create-order.js` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | `xxxx` | `payment.service.js`, `verify.js` | Razorpay API secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_xxxx` | `register.js`, `profile.js` | Client-side Razorpay key (public) |

### Optional Variables

| Variable | Default | Description |
|---|---|---|
| `EMAIL_PROVIDER` | `console` | Email provider: `console`, `nodemailer`, `sendgrid`, `aws-ses` |
| `EMAIL_FROM` | `noreply@footballapp.com` | Sender email address |
| `SMTP_HOST` | — | SMTP server (for nodemailer) |
| `SMTP_PORT` | `587` | SMTP port (for nodemailer) |
| `SMTP_USER` | — | SMTP username (for nodemailer) |
| `SMTP_PASSWORD` | — | SMTP password (for nodemailer) |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000/api` | API base URL (for legacy `apis.js`) |
| `NODE_ENV` | `development` | Environment flag |

---

## 14. Scripts & Utilities

### 14.1 `scripts/setup-admin.mjs`
One-time script to bootstrap the first admin user.
- Sets `knuzhat137@gmail.com` as `is_admin: true` and `is_super_admin: true`
- To run: `node scripts/setup-admin.mjs`

### 14.2 `setup-database.js`
Database initialization script that creates tables and seed data.

### 14.3 `CREATE_TABLES.sql`
SQL file to create all tables, indexes, functions, and triggers. Run in Supabase SQL Editor.

### 14.4 `server.js` / `server-simple.js`
Custom Express servers for production deployment (used with `npm start`).

### 14.5 `build-sit.sh`
Shell script for SIT (System Integration Testing) deployment build.

---

## Summary Statistics

| Category | Count |
|---|---|
| Frontend Pages | 14 (+ 1 orphaned `signup.js`) |
| API Routes | 24 (auth: 8, user: 5, payment: 4, admin: 4, messages: 3) |
| Backend Services | 6 active + 2 legacy |
| Frontend API Wrappers | 3 (`auth.api.js`, `payment.api.js`, `user.api.js`) |
| Reusable Components | 6 |
| CSS Module Files | 12 |
| Database Tables | 5 (`users`, `otps`, `payments`, `payment_history`, `messages`) |
| Environment Variables | 7 required + 6 optional |
