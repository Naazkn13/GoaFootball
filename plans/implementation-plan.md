# 🏟️ Football Auth App — Full Implementation Plan

> **Date:** 19 Feb 2026  
> **Project:** `football-auth-app`  
> **Stack:** Next.js 14 (Pages Router) · Express · Supabase (PostgreSQL) · Razorpay · Nodemailer

---

## 📋 Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Session Management Strategy](#2-session-management-strategy)
3. [New User Registration Flow](#3-new-user-registration-flow)
4. [Role-Based Registration Form](#4-role-based-registration-form)
5. [Payment Integration Rework](#5-payment-integration-rework)
6. [UID Approval Workflow](#6-uid-approval-workflow)
7. [Admin Panel](#7-admin-panel)
8. [Chat / Communication Channel](#8-chat--communication-channel)
9. [Homepage Redesign (FITEQ-Inspired)](#9-homepage-redesign-fiteq-inspired)
10. [Responsive Design Strategy](#10-responsive-design-strategy)
11. [Database Schema Changes](#11-database-schema-changes)
12. [File-by-File Change List](#12-file-by-file-change-list)
13. [Implementation Order & Phases](#13-implementation-order--phases)
14. [Verification Plan](#14-verification-plan)

---

## 1. Current State Analysis

### What Exists
| Layer | Current State |
|-------|---------------|
| **Frontend** | Next.js 14 (Pages Router) — `pages/index.js` (landing), `login.js`, `signup.js`, `profile.js`, `about.js`, `contact.js`, `event-info.js`, policies |
| **Backend API** | Next.js API routes at `pages/api/` — `auth/` (login, signup, verify-login-otp, verify-signup-otp, resend-otp), `payment/` (create-order, verify, all, [id]), `user/` (profile, payment-status, payment-history) |
| **Services** | `services/auth.service.js`, `otp.service.js`, `payment.service.js`, `email.service.js`, `database.js`, `uuid.service.js`, Axios wrapper |
| **Auth** | Email+Password → OTP → JWT token stored in **localStorage** via `AuthContext.js` |
| **Database** | Supabase (PostgreSQL): `users`, `otps`, `payments`, `payment_history` tables |
| **Payments** | Razorpay integration with ₹500 hardcoded amount, auto-pay on profile page |
| **Styling** | CSS Modules (`Auth.module.css`, `Profile.module.css`, `Landing.module.css`, etc.) |
| **Components** | `Footer.js`, `OTPModal.jsx` (only 2 components) |

### What's Missing
- ❌ **No email-only OTP login** (currently requires password)
- ❌ **No role selection** (Athlete / Coach / Referee / etc.)
- ❌ **No multi-step registration form** with extended fields
- ❌ **No UID approval workflow** (Approve / Reject / Hold)
- ❌ **No admin panel**
- ❌ **No chat/communication system**
- ❌ **No professional homepage** (current one is basic)
- ❌ **No proper session management** (plain localStorage)
- ❌ **Payment button shows amount** (should be hidden per requirement)

---

## 2. Session Management Strategy

### Recommendation: **HTTP-Only Cookies + Server-Side JWT**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **localStorage** (current) | Easy, works across tabs | XSS vulnerable, no auto-expiry, no server-side invalidation | ❌ Insecure |
| **sessionStorage** | Tab-isolated, cleared on close | Same XSS risk, lost on new tab, poor UX | ❌ Poor UX |
| **HTTP-Only Cookies** | XSS-proof, auto-sent with requests, server-controlled expiry, works with SSR | Needs CSRF protection, slightly more complex setup | ✅ **Recommended** |

### Why HTTP-Only Cookies?

1. **XSS Protection** — JavaScript cannot read `HttpOnly` cookies, eliminating the #1 attack vector on SPAs
2. **Automatic Transmission** — Cookies are sent with every request automatically; no need for manual `Authorization` header management
3. **Server-Side Control** — The server can invalidate sessions by clearing/expiring the cookie
4. **SSR Compatible** — Next.js SSR pages can read cookies on the server for authenticated rendering
5. **Mobile Friendly** — Works seamlessly in mobile browsers without any extra handling

### Implementation Details

```
Cookie Configuration:
  name:     "session_token"
  value:    JWT (contains userId, email, role, approvalStatus)
  httpOnly: true
  secure:   true (in production)
  sameSite: "Lax" (CSRF protection)
  maxAge:   7 days (604800 seconds)
  path:     "/"
```

**Changes Required:**
- `pages/api/auth/login.js` → Set cookie on successful login
- `pages/api/auth/verify-login-otp.js` → Set cookie after OTP verification
- `pages/api/auth/logout.js` → Clear cookie
- NEW: `services/session.service.js` → Cookie helper utilities
- NEW: `middleware.js` → Next.js middleware to protect routes
- `store/AuthContext.js` → Fetch user from `/api/user/profile` instead of localStorage
- `services/axios.js` → Remove manual `Authorization` header (cookies are automatic)

---

## 3. New User Registration Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW USER REGISTRATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PAGE 1: /login (or /register)                               │
│  ┌──────────────────────────────┐                            │
│  │  Enter Email                  │                            │
│  │  [email@example.com]          │                            │
│  │                               │                            │
│  │  [Send OTP] ─────────────────►│── API: POST /api/auth/    │
│  │                               │   send-otp                 │
│  │  ┌─ OTP Modal ──────────┐    │                            │
│  │  │ Enter 4-digit OTP    │    │                            │
│  │  │ [_ _ _ _]            │    │                            │
│  │  │ [Verify] ────────────┼──► │── API: POST /api/auth/     │
│  │  └──────────────────────┘    │   verify-otp                │
│  └──────────────────────────────┘                            │
│           │ (OTP verified → session cookie set)               │
│           ▼                                                   │
│  PAGE 2: /register (Role Selection + Form)                   │
│  ┌──────────────────────────────┐                            │
│  │  Register as:                 │                            │
│  │  [Athlete] [Coach] [Referee]  │                            │
│  │  [Manager] [Other]            │                            │
│  │                               │                            │
│  │  Role-specific form fields    │                            │
│  │  (Name, DOB, Phone, etc.)     │                            │
│  │  + Document uploads           │                            │
│  │                               │                            │
│  │  [Proceed to Pay] ───────────►│── API: POST /api/user/    │
│  └──────────────────────────────┘   register                  │
│           │                                                   │
│           ▼                                                   │
│  PAYMENT: Razorpay Checkout (NO amount shown on button)      │
│           │                                                   │
│           ▼                                                   │
│  PAGE 3: /profile                                            │
│  ┌──────────────────────────────┐                            │
│  │  UID: FB-2026-XXXXX          │                            │
│  │  Status: ⏳ Approval Under    │                            │
│  │          Process              │                            │
│  │                               │                            │
│  │  [Chat with Admin]            │                            │
│  └──────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Changes to Current Login Flow

1. **Remove password requirement** — Login becomes email-only → OTP
2. **Current `login.js`** will be rewritten to show only an email field + "Send OTP" button
3. **Current `signup.js`** will be replaced with the multi-step `/register` page
4. After OTP verification, the server checks if the user has completed registration:
   - **New user** → Redirect to `/register`
   - **Existing user (registered)** → Redirect to `/profile`

---

## 4. Role-Based Registration Form

### Role Options
- **Athlete** (Player)
- **Coach**
- **Referee**
- **Manager**
- **Other** (free-text specification)

### Common Fields (All Roles)
| Field | Type | Validation |
|-------|------|------------|
| Full Name | Text | Required, 2-100 chars |
| Date of Birth | Date | Required, must be 10+ years old |
| Gender | Select | Male / Female / Other |
| Phone Number | Tel | Required, 10 digits |
| Aadhaar Number | Text | Required, 12 digits, formatted XXXX-XXXX-XXXX |
| Address (Line 1) | Text | Required |
| Address (Line 2) | Text | Optional |
| City | Text | Required |
| State | Select | Required (Indian states dropdown) |
| PIN Code | Text | Required, 6 digits |
| Photo (Passport Size) | File Upload | Required, JPEG/PNG, max 2MB |
| ID Proof (Aadhaar/PAN) | File Upload | Required, PDF/JPEG/PNG, max 5MB |

### Role-Specific Fields

**Athlete:**
| Field | Type |
|-------|------|
| Playing Position | Select (GK, DEF, MID, FWD) |
| Preferred Foot | Select (Left, Right, Both) |
| Height (cm) | Number |
| Weight (kg) | Number |
| Previous Club/Team | Text (optional) |
| Years of Experience | Number |

**Coach:**
| Field | Type |
|-------|------|
| Coaching License | Text (license ID) |
| License Document | File Upload |
| Specialization | Select (Youth, Senior, Goalkeeping, Fitness) |
| Years of Experience | Number |
| Previous Club/Academy | Text |

**Referee:**
| Field | Type |
|-------|------|
| Referee License | Text (license ID) |
| License Document | File Upload |
| Grade/Level | Select (District, State, National, FIFA) |
| Years of Experience | Number |

**Manager:**
| Field | Type |
|-------|------|
| Organization Name | Text |
| Designation | Text |
| Years of Experience | Number |

> **Note:** The exact field list should be finalized by you. I've provided a comprehensive starting set. Please send me your final list of fields per role.

### Document Storage
- Files uploaded to **Supabase Storage** (built-in with Supabase)
- Bucket: `user-documents` (private)
- Path pattern: `{userId}/{documentType}_{timestamp}.{ext}`
- Public URLs via Supabase signed URLs (time-limited, admin access only)

---

## 5. Payment Integration Rework

### Current Issues
- Amount (₹500) is visible on the payment button
- Payment happens directly without a proper approval flow

### New Behavior

1. **Payment Button:** Shows "Proceed to Pay" — **NO amount displayed** on the button or page
2. The amount is set server-side only (in the API route `create-order`)
3. Payment flow:
   - User clicks "Proceed to Pay" on `/register` after filling the form
   - Frontend calls `POST /api/payment/create-order` (amount determined server-side)
   - Razorpay checkout opens (amount is visible in Razorpay's own UI, not ours)
   - After payment success, user is redirected to `/profile`

### API Changes
- `pages/api/payment/create-order.js` → Remove amount from request body, hardcode server-side
- `pages/profile.js` → Remove `₹ 500.00` text and payment amount display
- `pages/register.js` (NEW) → Add "Proceed to Pay" button at the bottom of the registration form

---

## 6. UID Approval Workflow

### Status Flow

```
User Registers + Pays
        │
        ▼
  ┌─────────────┐
  │   PENDING    │  ← Default after registration + payment
  └──────┬──────┘
         │ (Admin reviews documents + payment)
         │
    ┌────┼────┐
    ▼    ▼    ▼
┌──────┐┌──────┐┌──────┐
│APPROVE││REJECT││ HOLD │
└──────┘└──────┘└──────┘
    │       │       │
    ▼       ▼       ▼
 Active   Rejected  On Hold
 UID      (with     (with
          reason)   reason)
```

### Profile Page Display

| Status | What User Sees |
|--------|---------------|
| `pending` | ⏳ "UID Approval Under Process" (yellow badge) |
| `approved` | ✅ "UID: FB-2026-XXXXX — Active" (green badge) |
| `rejected` | ❌ "UID Rejected — Reason: [text]" (red badge) + re-apply option |
| `on_hold` | ⏸️ "UID On Hold — Reason: [text]" (orange badge) |

### Database Addition
Add column to `users` table:
```sql
ALTER TABLE users ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN approval_reason TEXT;
ALTER TABLE users ADD COLUMN approved_by UUID;
ALTER TABLE users ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN role VARCHAR(50);
ALTER TABLE users ADD COLUMN role_details JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN documents JSONB DEFAULT '[]';
```

---

## 7. Admin Panel

### Access
- **Route:** `/admin` (protected, admin-only)
- **Admin detection:** `users.role = 'admin'` or separate `admins` table
- **Auth:** Same cookie-based session, with role check in middleware

### Admin Dashboard Features

#### 7.1 Registration Queue
- List of all pending registrations with:
  - User name, email, role, registration date
  - Quick view of uploaded documents
  - Payment verification status
  - **Action buttons:** Approve ✅ | Reject ❌ | Hold ⏸️
  - Reason input (required for Reject/Hold)

#### 7.2 User Management
- Search/filter users by: name, email, role, status
- View full user profile + documents
- Change approval status at any time
- View payment history

#### 7.3 Admin API Routes (NEW)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/registrations` | GET | List all pending registrations |
| `/api/admin/registrations/[id]` | GET | Get registration details + documents |
| `/api/admin/registrations/[id]/approve` | POST | Approve a registration |
| `/api/admin/registrations/[id]/reject` | POST | Reject with reason |
| `/api/admin/registrations/[id]/hold` | POST | Hold with reason |
| `/api/admin/users` | GET | List all users (with filters) |
| `/api/admin/users/[id]` | GET | Get full user details |
| `/api/admin/messages` | GET | Get admin chat threads |
| `/api/admin/messages/[userId]` | GET/POST | Chat with specific user |

---

## 8. Chat / Communication Channel

### Design
A simple **in-app messaging system** between the user and admin.

### How It Works

1. **User side:** On the profile page, a "Chat with Admin" button opens a chat panel/drawer
2. **Admin side:** On the admin dashboard, each user's registration card has a chat icon. The admin can open a conversation thread with any user.
3. Messages are stored in a `messages` table in Supabase
4. **Real-time updates:** Use Supabase Realtime (built-in) for live message updates (no need for Socket.io)
5. Unread badge count on both user and admin side

### Database Table

```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

### UI Components
- `ChatDrawer.jsx` — Slide-in drawer from the right side on mobile and desktop
- `ChatBubble.jsx` — Individual message bubble (sent/received alignment)
- `ChatInput.jsx` — Message input with send button
- `UnreadBadge.jsx` — Notification dot for unread messages

---

## 9. Homepage Redesign (FITEQ-Inspired)

### Design Philosophy — Elements First, Not Categories

> **Client clarification:** Focus on **visual design elements** from FITEQ (layout, animations, hero style, card UI, typography, glassmorphism). We do NOT have enough content for categories like News, Events calendar, Rankings, or Education — so those sections are **excluded** for now.

### What We're Borrowing From FITEQ (Elements Only)

| FITEQ Element | What We Take | What We Skip |
|---------------|-------------|-------------|
| **Full-bleed hero** with video/image + gradient overlay | ✅ Hero section with CTA buttons | — |
| **Sticky transparent→solid navbar** | ✅ Glassmorphic navbar that becomes solid on scroll | — |
| **"Become a Player/Coach/Referee" CTA cards** | ✅ Role registration cards with icons + descriptions | — |
| **Clean section spacing** with bold typography | ✅ Large headers, generous whitespace, Inter/Outfit fonts | — |
| **Partners/Sponsors logo bar** | ✅ Logo placeholder section (ready for when sponsors come) | — |
| **Smooth scroll animations** | ✅ Fade-in-up, counters, hover effects | — |
| News carousel | — | ❌ No news content yet |
| Events calendar / timeline | — | ❌ No events content yet |
| World rankings / Athletes | — | ❌ No ranking data yet |
| Education / Documents | — | ❌ Not applicable |

### What We Replace Skipped Sections With

Since we're dropping News, Events, and Rankings, we need **relevant sections** that the client CAN fill right now:

1. **"How It Works"** — 3-step visual explanation (Register → Pay → Get Approved)
2. **"About the Federation"** — Mission/vision statement with image
3. **"Animated Stats Bar"** — Numbers the client can set (Registered Players, States Covered, etc.)
4. **Contact / CTA Banner** — "Have questions? Get in touch" section

### Section Breakdown (Revised)

```
┌─────────────────────────────────────┐
│  STICKY NAVBAR                       │
│  Logo  |  Home  About  Contact       │
│                    |  Login/Register  │
├─────────────────────────────────────┤
│                                      │
│  1. HERO SECTION (Full Viewport)     │
│  ┌─────────────────────────────┐     │
│  │  BG: Football stadium image │     │
│  │  Dark gradient overlay      │     │
│  │                             │     │
│  │  "Empowering Indian         │     │
│  │   Football — Register,      │     │
│  │   Play, Compete"            │     │
│  │                             │     │
│  │  Subtitle tagline           │     │
│  │  [Register Now] [Login]     │     │
│  └─────────────────────────────┘     │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  2. ANIMATED STATS BAR               │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐    │
│  │500+│  │15+ │  │100+│  │10+ │    │
│  │Reg.│  │Stat│  │Refs│  │Dist│    │
│  │Play│  │es  │  │    │  │rcts│    │
│  └────┘  └────┘  └────┘  └────┘    │
│  (animate counting on scroll-in)     │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  3. BECOME A MEMBER (Role CTAs)      │
│  ┌───────────┐┌───────────┐┌──────┐ │
│  │🏃 Become  ││🏋️ Become  ││🏁 Be-│ │
│  │a Player   ││a Coach    ││come a│ │
│  │           ││           ││Ref.  │ │
│  │ Icon      ││ Icon      ││ Icon │ │
│  │ Short desc││ Short desc││ Desc │ │
│  │[Register] ││[Register] ││[Reg.]│ │
│  └───────────┘└───────────┘└──────┘ │
│  (glassmorphism cards, hover scale)  │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  4. HOW IT WORKS (3-Step Visual)     │
│                                      │
│  ①──────────── ②──────────── ③──── │
│  Register       Make Payment   Get   │
│  & Submit       Securely       UID   │
│  Documents                    Apprvd │
│                                      │
│  (connected by dotted line/arrows)   │
│  (each step: icon + title + desc)    │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  5. ABOUT THE FEDERATION             │
│  ┌──────────┐ ┌──────────────────┐  │
│  │          │ │ Our Mission       │  │
│  │  Image   │ │ We are dedicated  │  │
│  │  (field/ │ │ to growing        │  │
│  │  stadium)│ │ football across   │  │
│  │          │ │ India...          │  │
│  │          │ │                   │  │
│  │          │ │ [Learn More]      │  │
│  └──────────┘ └──────────────────┘  │
│  (image left, text right on desktop) │
│  (stacked on mobile)                 │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  6. PARTNERS / SPONSORS (Placeholder)│
│  "Our Partners"                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │Logo│ │Logo│ │Logo│ │Logo│       │
│  └────┘ └────┘ └────┘ └────┘       │
│  (auto-scrolling logo strip)         │
│  (placeholder logos for now)         │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  7. CTA BANNER                       │
│  ┌─────────────────────────────┐     │
│  │  "Ready to Join?"           │     │
│  │  "Register today and become │     │
│  │   part of Indian football"  │     │
│  │                             │     │
│  │  [Register Now]             │     │
│  └─────────────────────────────┘     │
│  (gradient background, centered)     │
│                                      │
├─────────────────────────────────────┤
│  FOOTER                              │
│  Links | Social | Contact | Legal    │
└─────────────────────────────────────┘
```

### Key Visual Design Elements (Borrowed from FITEQ)

| # | Element | How We'll Implement It |
|---|---------|----------------------|
| 1 | **Full-viewport hero** | Large stadium/field background image, dark gradient overlay (`linear-gradient(135deg, rgba(10,22,40,0.85), rgba(26,86,219,0.6))`), centered text + CTA buttons |
| 2 | **Sticky glassmorphic navbar** | `position: sticky`, transparent on top → solid dark background after 100px scroll (via `IntersectionObserver`), `backdrop-filter: blur(12px)` |
| 3 | **Animated number counters** | IntersectionObserver triggers count-up animation from 0 to target (e.g., 0→500). Each stat has an icon + label below |
| 4 | **Glassmorphism CTA cards** | `background: rgba(255,255,255,0.08)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.15)`, hover: `transform: scale(1.03)` + deeper shadow |
| 5 | **Fade-in-up scroll animations** | Each section has `opacity: 0; transform: translateY(30px)` by default, CSS class `.visible` added via IntersectionObserver to trigger `transition: opacity 0.6s, transform 0.6s` |
| 6 | **Gradient section dividers** | Alternating section backgrounds: dark → slightly lighter → dark. Smooth color transitions between sections |
| 7 | **Button micro-interactions** | Primary button: gradient fill, `transform: scale(0.98)` on active, subtle `box-shadow` on hover. Outline button: border glow on hover |
| 8 | **Premium typography** | `font-family: 'Outfit', sans-serif` for headings (700 weight), `'Inter', sans-serif` for body (400/500). Large hero text: `clamp(2.5rem, 5vw, 4rem)` |
| 9 | **Color palette** | Deep navy `#0a1628` (BG), Royal blue `#1a56db` (primary), Electric blue `#3b82f6` (accent), Gold `#f59e0b` (highlight), White `#f8fafc` (text) |
| 10 | **Mobile-first responsive** | All sections stack vertically on mobile. Cards become full-width. Hero text scales down gracefully. Touch-friendly 48px tap targets |

### Components for Homepage

| Component | Purpose |
|-----------|---------|
| `components/Navbar.jsx` | Sticky responsive nav (glassmorphism → solid on scroll) |
| `components/HeroSection.jsx` | Full-viewport hero with background image, overlay, title, CTAs |
| `components/StatsCounter.jsx` | Animated counting numbers bar (IntersectionObserver-based) |
| `components/RoleCTACards.jsx` | 3 glassmorphism cards: Player / Coach / Referee with [Register] |
| `components/HowItWorks.jsx` | 3-step visual guide (Register → Pay → Approved) |
| `components/AboutSection.jsx` | Image + text split-layout for mission/about |
| `components/PartnersStrip.jsx` | Auto-scrolling partner logos (placeholder-ready) |
| `components/CTABanner.jsx` | Final call-to-action gradient banner |
| `components/HamburgerMenu.jsx` | Mobile nav slide-out menu |

> **Note:** No `NewsCarousel.jsx` or `EventsTimeline.jsx` for now — these can be added later when the client has content for them.

---

## 10. Responsive Design Strategy

### Breakpoints

| Breakpoint | Target |
|------------|--------|
| `≤ 480px` | Mobile (portrait) |
| `481-768px` | Mobile (landscape) / Small tablet |
| `769-1024px` | Tablet |
| `1025-1440px` | Desktop |
| `> 1440px` | Large desktop |

### Key Responsive Behaviors

| Component | Mobile | Desktop |
|-----------|--------|---------|
| **Navbar** | Hamburger menu drawer | Full horizontal links |
| **Hero** | Stacked text, smaller font | Full viewport with overlays |
| **Feature Cards** | Vertical stack (1 column) | 2-3 column grid |
| **Registration Form** | Full width, single column | Two-column layout |
| **Admin Dashboard** | Tab-based navigation | Sidebar + content area |
| **Chat** | Full-screen drawer | Side panel / bottom-right widget |
| **Profile** | Single column card | Side-by-side info + status |

### Implementation
- Use **CSS Grid** and **Flexbox** throughout
- All CSS Modules will include responsive `@media` queries
- Touch-friendly: minimum 44px tap targets on mobile
- Hamburger nav component for mobile

---

## 11. Database Schema Changes

### New/Modified Tables

```sql
-- =============================================
-- MODIFIED: users table (add new columns)
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

-- Remove password requirement (email-only OTP login now)
-- password_hash column can be made nullable or removed later
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- =============================================
-- NEW: messages table
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
-- Supabase Storage Bucket Setup
-- =============================================
-- Create via Supabase Dashboard:
--   Bucket name: user-documents
--   Public: false
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/png, application/pdf
```

---

## 12. File-by-File Change List

### New Files

| File | Purpose |
|------|---------|
| **Pages** | |
| `pages/register.js` | Multi-step registration form (role selection + fields + pay) |
| `pages/admin/index.js` | Admin dashboard (registration queue) |
| `pages/admin/user/[id].js` | Admin: detailed user view + approval actions |
| **API Routes** | |
| `pages/api/auth/send-otp.js` | Send OTP (email-only, replaces login+signup flow) |
| `pages/api/auth/verify-otp.js` | Verify OTP and create session cookie |
| `pages/api/user/register.js` | Complete registration (role, fields, documents) |
| `pages/api/user/upload-document.js` | Handle document file uploads |
| `pages/api/admin/registrations.js` | List pending registrations |
| `pages/api/admin/registrations/[id].js` | Get registration details |
| `pages/api/admin/approve.js` | Approve registration |
| `pages/api/admin/reject.js` | Reject with reason |
| `pages/api/admin/hold.js` | Hold with reason |
| `pages/api/admin/users.js` | List/search all users |
| `pages/api/messages/send.js` | Send message |
| `pages/api/messages/[userId].js` | Get conversation with user |
| `pages/api/messages/unread.js` | Get unread count |
| **Components** | |
| `components/Navbar.jsx` | Sticky responsive navbar (glassmorphism → solid on scroll) |
| `components/HeroSection.jsx` | Full-viewport hero with CTA |
| `components/StatsCounter.jsx` | Animated numbers section |
| `components/RoleCTACards.jsx` | "Become a Player/Coach/Referee" glassmorphism cards |
| `components/HowItWorks.jsx` | 3-step visual guide (Register → Pay → Approved) |
| `components/AboutSection.jsx` | Image + text split-layout for mission/about |
| `components/PartnersStrip.jsx` | Auto-scrolling partner logos (placeholder-ready) |
| `components/CTABanner.jsx` | Final call-to-action gradient banner |
| `components/ChatDrawer.jsx` | Chat slide-in panel |
| `components/ChatBubble.jsx` | Individual message component |
| `components/ChatInput.jsx` | Message input component |
| `components/ApprovalBadge.jsx` | Status badge (pending/approved/rejected/hold) |
| `components/RoleSelectionForm.jsx` | Role picker step component |
| `components/RegistrationForm.jsx` | Dynamic form based on selected role |
| `components/AdminSidebar.jsx` | Admin panel navigation sidebar |
| `components/RegistrationCard.jsx` | Admin: user registration summary card |
| `components/HamburgerMenu.jsx` | Mobile nav hamburger menu |
| **Services** | |
| `services/session.service.js` | Cookie-based session helpers |
| `services/api/admin.api.js` | Admin API frontend service |
| `services/api/messages.api.js` | Messages API frontend service |
| **Styles** | |
| `styles/Navbar.module.css` | Navbar styles |
| `styles/Home.module.css` | New homepage styles |
| `styles/Register.module.css` | Registration form styles |
| `styles/Admin.module.css` | Admin dashboard styles |
| `styles/Chat.module.css` | Chat component styles |
| **Middleware** | |
| `middleware.js` | Next.js route protection middleware |
| **Config** | |
| `plans/SCHEMA_MIGRATION.sql` | SQL migration script |

### Modified Files

| File | Changes |
|------|---------|
| `pages/login.js` | Rewrite: email-only input → Send OTP → verify → redirect |
| `pages/profile.js` | Add approval status badge, chat button, remove amount display |
| `pages/index.js` | Complete rewrite: FITEQ-inspired homepage |
| `pages/_app.js` | Add Navbar, update layout, add admin route detection |
| `pages/_document.js` | Add Google Fonts, meta tags |
| `store/AuthContext.js` | Remove localStorage, fetch from cookie-authenticated API |
| `services/database.js` | Add new DB methods (messages, approval, admin queries) |
| `services/axios.js` | Add `withCredentials: true` for cookie auth |
| `styles/globals.css` | CSS variables, fonts, base responsive styles |
| `styles/Profile.module.css` | Add approval badge styles, chat button styles |
| `styles/Auth.module.css` | Simplify for email-only login |
| `components/Footer.js` | Update with new links, responsive styles |
| `package.json` | Add new dependencies if needed (e.g., `formidable` for file uploads) |
| `.env.local` | Add any new environment variables |

### Files to Remove/Deprecate
| File | Reason |
|------|--------|
| `pages/signup.js` | Replaced by `/register` page |
| `pages/event-info.js` | Can be merged into homepage (optional — discuss) |

---

## 13. Implementation Order & Phases

### Phase 1: Foundation (Session Management + DB Schema)
1. Create SQL migration script for new columns + tables
2. Implement `session.service.js` (cookie helpers)
3. Create `middleware.js` (route protection)
4. Update `AuthContext.js` (cookie-based)
5. Update `services/axios.js` (withCredentials)

### Phase 2: Auth Flow Rework
1. Rewrite `pages/login.js` (email-only + OTP)
2. Create new API routes: `send-otp.js`, `verify-otp.js`
3. Update existing OTP API routes for the new flow
4. Implement redirect logic (new user → register, existing → profile)

### Phase 3: Registration System
1. Create `pages/register.js` (multi-step form)
2. Create role selection + dynamic form components
3. Create file upload API route + Supabase storage integration
4. Create registration API route
5. Add "Proceed to Pay" button (no amount shown)

### Phase 4: Profile + Approval System
1. Update `pages/profile.js` with approval status display
2. Create `ApprovalBadge.jsx` component
3. Implement the approval workflow state machine

### Phase 5: Admin Panel
1. Create admin dashboard page
2. Create admin API routes (registrations, approve/reject/hold)
3. Create admin components (sidebar, cards, detail view)
4. Create user detail page with document viewer

### Phase 6: Chat System
1. Create messages table + API routes
2. Create `ChatDrawer.jsx` and sub-components
3. Integrate Supabase Realtime for live updates
4. Add chat to both user profile and admin panel

### Phase 7: Homepage Redesign
1. Create new component library (Navbar, Hero, Stats, etc.)
2. Rewrite `pages/index.js` with FITEQ-inspired design
3. Create all responsive CSS modules
4. Add animations and micro-interactions

### Phase 8: Responsive Polish
1. Mobile-first responsive pass on all pages
2. Hamburger menu implementation
3. Touch target optimization
4. Cross-browser testing

---

## 14. Verification Plan

### Automated Verification (Developer Testing)

Since this project doesn't have existing unit tests, verification will be done through:

1. **Build Verification:**
   ```bash
   npm run build
   ```
   Ensures no compilation/build errors after changes.

2. **Dev Server Smoke Test:**
   ```bash
   npm run dev
   ```
   Verify the app starts without errors on `http://localhost:3000`.

### Manual Verification (Each Phase)

#### Phase 1 — Session Management
1. Start the dev server (`npm run dev`)
2. Open browser DevTools → Application → Cookies
3. Login via the email+OTP flow
4. Verify a `session_token` cookie is set with `HttpOnly` flag
5. Refresh the page — verify user stays logged in
6. Open a new tab — verify session persists
7. Click Logout — verify cookie is cleared
8. Try accessing `/profile` while logged out — verify redirect to `/login`

#### Phase 2 — Auth Flow
1. Go to `/login`
2. Enter an email and click "Send OTP"
3. Check email/console for OTP
4. Enter OTP → verify it logs in and redirects
5. **New user** → should redirect to `/register`
6. **Existing user** → should redirect to `/profile`

#### Phase 3 — Registration
1. As a new user (after OTP login), arrive at `/register`
2. Select "Athlete" → verify athlete-specific fields appear
3. Switch to "Coach" → verify coach-specific fields appear
4. Fill all required fields, upload documents
5. Click "Proceed to Pay" — verify Razorpay opens, **no amount visible on our page**
6. Complete payment → verify redirect to `/profile`

#### Phase 4 — Profile + Approval
1. After registration, profile should show "UID Approval Under Process" (pending)
2. No approval yet — status should remain pending

#### Phase 5 — Admin Panel
1. Login as admin user
2. Go to `/admin`
3. See the list of pending registrations
4. Click on a registration → view documents and details
5. Click "Approve" → verify user's profile status changes to "Approved"
6. Repeat with "Reject" (with reason) → verify status + reason
7. Repeat with "Hold" (with reason) → verify status + reason

#### Phase 6 — Chat
1. As a user, open chat from profile page
2. Send a message to admin
3. Login as admin → verify message appears in admin dashboard
4. Reply as admin → verify user sees the reply
5. Verify unread badge works

#### Phase 7 — Homepage
1. Open `/` (homepage) in desktop browser
2. Verify hero section, stats counter, news cards, role CTAs, footer
3. Verify animations trigger on scroll
4. Verify all links work

#### Phase 8 — Responsive
1. Open Chrome DevTools → Toggle device toolbar
2. Test at 375px (iPhone SE), 768px (iPad), 1440px (Desktop)
3. Verify navbar becomes hamburger on mobile
4. Verify forms are single-column on mobile
5. Verify chat drawer works on mobile (full-screen)
6. Verify admin panel is usable on mobile

> **Note:** Since there are no existing test files/framework set up, I recommend testing manually as described above. If you'd like, we can also add a test framework (Jest + React Testing Library) in a future phase.

---

## 🔑 Key Decisions Needing Your Input

1. **Registration Fields:** I've proposed a list of fields per role. Please send your exact list of fields you want for each role.
2. **Payment Amount:** The amount is hidden from the user on the button — but what is the actual amount to charge? Still ₹500?
3. **Admin Access:** How do you want admin accounts created? Manually in the DB? Or a super-admin creation flow?
4. **`event-info.js` page:** Keep it as a separate page, merge into the homepage, or remove?
5. **Supabase Storage:** Confirm you want to use Supabase Storage for document uploads (it's the simplest option given your current stack).
6. **Real-time Chat:** Supabase Realtime for live messaging? Or simple polling-based refresh?

---

*This plan covers all requirements. Once you approve (and send the final field list), I'll begin implementation phase by phase.*
