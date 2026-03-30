# Instamojo Payment Gateway Integration Plan

> **Status**: Planned  
> **Date**: 2026-03-30  
> **Priority**: High — Razorpay live keys unavailable, Instamojo live keys available  
> **Strategy**: Instamojo becomes **primary** gateway; Razorpay code is preserved as **dormant backup**

---

## 1. Background & Decision

| Gateway    | Status                              |
|------------|-------------------------------------|
| Razorpay   | ❌ Test keys only — live keys not yet received |
| Instamojo  | ✅ Live keys available and ready     |

**Decision**: Integrate Instamojo as the primary payment method for production. Keep all existing Razorpay code intact (commented where necessary) so it can be activated later when live keys arrive.

---

## 2. How Instamojo Works (vs Razorpay)

| Step | Razorpay (current)                        | Instamojo (new)                                   |
|------|-------------------------------------------|----------------------------------------------------|
| 1    | Server creates an **Order** via SDK       | Server creates a **Payment Request** via REST API  |
| 2    | Client opens Razorpay **Checkout popup**  | Client is **redirected** to Instamojo payment page |
| 3    | Client receives callback in JS handler    | User is **redirected back** to our `redirect_url`  |
| 4    | Server verifies via **signature (HMAC)**  | Server verifies via **API call** using `payment_id`|

Key difference: Instamojo uses a **redirect-based flow** (user leaves your site, pays on Instamojo, returns), not a popup.

---

## 3. Environment Variables

### New variables to add to `.env.local` and Vercel dashboard:

```dotenv
# Instamojo Configuration (Primary Payment Gateway)
INSTAMOJO_API_KEY=your_live_api_key
INSTAMOJO_AUTH_TOKEN=your_live_auth_token
INSTAMOJO_BASE_URL=https://api.instamojo.com
# For test mode use: https://test.instamojo.com

# Payment Gateway Selection (instamojo | razorpay)
PAYMENT_GATEWAY=instamojo
```

### Existing variables (keep as-is for Razorpay backup):
```dotenv
RAZORPAY_KEY_ID=rzp_test_UwsYxWcj2dM4t9
RAZORPAY_KEY_SECRET=lxfBAmjIHslzybE61eLWN83g
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_UwsYxWcj2dM4t9
```

---

## 4. Files to Create / Modify

### 4.1 New Files

| File | Purpose |
|------|---------|
| `services/instamojo.service.js` | Instamojo backend service (create request, verify payment) |
| `pages/api/payment/instamojo-callback.js` | Redirect handler — user returns here after paying |
| `pages/api/payment/instamojo-webhook.js` | Server-to-server webhook for reliable payment confirmation |
| `pages/payment-success.js` | Success page shown after Instamojo redirect |
| `pages/payment-failed.js` | Failure page shown if payment was cancelled/failed |

### 4.2 Modified Files

| File | Change |
|------|--------|
| `services/payment.service.js` | Add gateway switching logic: if `PAYMENT_GATEWAY=instamojo` → use Instamojo, else → Razorpay |
| `pages/api/payment/create-order.js` | Branch logic: Instamojo creates a Payment Request instead of a Razorpay order |
| `pages/api/payment/verify.js` | Add Instamojo verification path alongside Razorpay |
| `services/api/payment.api.js` | Add `getGatewayType()` and Instamojo redirect support |
| `pages/profile.js` | Modify `handleProceedToPayment()` — redirect to Instamojo URL instead of opening popup |
| `pages/register.js` | Modify payment step — redirect to Instamojo URL instead of opening popup |
| `.env.local` | Add Instamojo keys |
| `.env.vercel` | Add Instamojo keys reference |
| `.env.local.example` | Add Instamojo keys template |

---

## 5. Detailed Implementation

### 5.1 `services/instamojo.service.js` (NEW)

```javascript
// Instamojo Payment Service
import axios from 'axios';

class InstamojoService {
  constructor() {
    this.apiKey = process.env.INSTAMOJO_API_KEY;
    this.authToken = process.env.INSTAMOJO_AUTH_TOKEN;
    this.baseUrl = process.env.INSTAMOJO_BASE_URL || 'https://api.instamojo.com';
  }

  getHeaders() {
    return {
      'X-Api-Key': this.apiKey,
      'X-Auth-Token': this.authToken,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  // Create a payment request
  async createPaymentRequest({ amount, purpose, buyerName, email, phone, redirectUrl, webhookUrl }) {
    const data = new URLSearchParams({
      amount: amount.toString(),
      purpose,
      buyer_name: buyerName || '',
      email: email || '',
      phone: phone || '',
      redirect_url: redirectUrl,
      webhook: webhookUrl || '',
      allow_repeated_payments: 'false',
    });

    const response = await axios.post(
      `${this.baseUrl}/v2/payment_requests/`,
      data.toString(),
      { headers: this.getHeaders() }
    );

    return {
      success: true,
      paymentRequestId: response.data.id,
      longUrl: response.data.longurl,  // User is redirected here
    };
  }

  // Verify payment status by payment_request_id and payment_id
  async verifyPayment(paymentRequestId, paymentId) {
    const response = await axios.get(
      `${this.baseUrl}/v2/payment_requests/${paymentRequestId}/${paymentId}/`,
      { headers: this.getHeaders() }
    );

    return {
      success: response.data.payment?.status === 'Credit',
      status: response.data.payment?.status,
      amount: response.data.payment?.amount,
      paymentId: response.data.payment?.payment_id,
    };
  }
}

export default new InstamojoService();
```

### 5.2 Gateway Switcher in `services/payment.service.js`

Add a method or export that routes to the correct gateway:

```javascript
// At top of payment.service.js
import instamojoService from './instamojo.service';

// New export
export function getActiveGateway() {
  return process.env.PAYMENT_GATEWAY || 'instamojo';
}
```

### 5.3 `pages/api/payment/create-order.js` (MODIFIED)

The existing Razorpay flow stays but is wrapped in a gateway check:

```javascript
const gateway = process.env.PAYMENT_GATEWAY || 'instamojo';

if (gateway === 'instamojo') {
  // Create Instamojo payment request
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const result = await instamojoService.createPaymentRequest({
    amount,
    purpose: 'Football Registration Fee',
    buyerName: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    redirectUrl: `${baseUrl}/api/payment/instamojo-callback`,
    webhookUrl: `${baseUrl}/api/payment/instamojo-webhook`,
  });

  // Store payment record (same DB table, gateway field added)
  await database.createPayment({
    user_id: targetUserId,
    razorpay_order_id: result.paymentRequestId, // reuse column for instamojo request ID
    amount,
    currency: 'INR',
    status: 'created',
    gateway: 'instamojo',
  });

  return res.status(200).json({
    success: true,
    gateway: 'instamojo',
    redirectUrl: result.longUrl,  // Frontend will window.location to this
  });
}

// ... existing Razorpay code stays here (else branch)
```

### 5.4 `pages/api/payment/instamojo-callback.js` (NEW)

Handles the redirect when user returns from Instamojo:

```javascript
export default async function handler(req, res) {
  const { payment_id, payment_request_id, payment_status } = req.query;

  if (!payment_id || !payment_request_id) {
    return res.redirect('/payment-failed?reason=missing_params');
  }

  try {
    // Verify with Instamojo API
    const result = await instamojoService.verifyPayment(payment_request_id, payment_id);

    if (result.success) {
      // Update payment record
      const payment = await database.getPaymentByRazorpayOrderId(payment_request_id);
      await database.updatePayment(payment.id, {
        razorpay_payment_id: payment_id,
        status: 'success',
        paid_at: new Date().toISOString(),
      });
      await database.updateUser(payment.user_id, { is_paid: true, payment_date: new Date().toISOString() });

      return res.redirect('/payment-success');
    } else {
      return res.redirect('/payment-failed?reason=verification_failed');
    }
  } catch (error) {
    console.error('Instamojo callback error:', error);
    return res.redirect('/payment-failed?reason=server_error');
  }
}
```

### 5.5 Frontend Changes (`profile.js` and `register.js`)

The `handleProceedToPayment()` flow changes from popup to redirect:

```javascript
const orderResponse = await paymentAPI.createOrder(userId);

if (orderResponse.gateway === 'instamojo') {
  // Redirect user to Instamojo payment page
  window.location.href = orderResponse.redirectUrl;
  return;
}

// ... existing Razorpay popup code stays for fallback
```

### 5.6 Success / Failure Pages (NEW)

Simple pages:
- `/pages/payment-success.js` — "Payment successful ✓" message + redirect to profile
- `/pages/payment-failed.js` — "Payment failed" message + retry button

---

## 6. Database Changes

### Option A: Add a `gateway` column (Recommended)

```sql
ALTER TABLE payments ADD COLUMN gateway VARCHAR(20) DEFAULT 'razorpay';
```

This allows payment records to indicate which gateway processed them. The existing `razorpay_order_id` column can be reused for Instamojo's `payment_request_id`, and `razorpay_payment_id` for Instamojo's `payment_id`.

### Option B: No schema change

Reuse columns as-is:
- `razorpay_order_id` → stores Instamojo `payment_request_id`
- `razorpay_payment_id` → stores Instamojo `payment_id`
- `razorpay_signature` → not used for Instamojo (leave null)

This avoids a migration but is less clean.

**Recommendation**: Option A — one small `ALTER TABLE` keeps things clean.

---

## 7. Switching Between Gateways

### Toggle via environment variable:

| `PAYMENT_GATEWAY` value | Behavior |
|--------------------------|----------|
| `instamojo`              | Uses Instamojo (primary, production) |
| `razorpay`               | Uses Razorpay (backup, when live keys arrive) |
| Not set / empty          | Defaults to `instamojo` |

This means:
- **No code changes needed** to switch gateways in the future
- Just update the env var on Vercel and redeploy

---

## 8. Implementation Order

| Step | Task | Effort |
|------|------|--------|
| 1 | Add Instamojo env vars to `.env.local` and Vercel | 5 min |
| 2 | Create `services/instamojo.service.js` | 30 min |
| 3 | Add `gateway` column to `payments` table in Supabase | 5 min |
| 4 | Modify `pages/api/payment/create-order.js` with gateway branching | 20 min |
| 5 | Create `pages/api/payment/instamojo-callback.js` | 20 min |
| 6 | Create `pages/api/payment/instamojo-webhook.js` | 15 min |
| 7 | Create `pages/payment-success.js` and `pages/payment-failed.js` | 20 min |
| 8 | Modify `pages/profile.js` — redirect instead of popup | 15 min |
| 9 | Modify `pages/register.js` — redirect instead of popup | 15 min |
| 10 | Update `services/api/payment.api.js` client-side API | 10 min |
| 11 | Test full flow locally | 30 min |
| 12 | Deploy to Vercel and test live | 15 min |

**Total estimated effort: ~3 hours**

---

## 9. Testing Checklist

- [ ] Instamojo payment request creates successfully (API returns `longUrl`)
- [ ] User is redirected to Instamojo checkout page
- [ ] After payment, user is redirected back to `/api/payment/instamojo-callback`
- [ ] Callback verifies payment via Instamojo API
- [ ] Payment record is updated in Supabase (`status: success`)
- [ ] User `is_paid` flag is set to `true`
- [ ] Payment history shows the Instamojo transaction
- [ ] Payment success page renders correctly
- [ ] Payment failure page renders with retry option
- [ ] Webhook endpoint receives and processes server-to-server notifications
- [ ] Switching `PAYMENT_GATEWAY=razorpay` falls back to existing Razorpay flow
- [ ] Policy pages (privacy, T&C) updated to mention Instamojo alongside Razorpay

---

## 10. Pre-requisites Before Starting

1. **Instamojo Live API Key** — Confirm you have this
2. **Instamojo Live Auth Token** — Confirm you have this
3. **Instamojo Test credentials** (optional) — for local testing before going live
4. **Webhook URL accessible** — Vercel functions are publicly accessible, so this works out of the box
