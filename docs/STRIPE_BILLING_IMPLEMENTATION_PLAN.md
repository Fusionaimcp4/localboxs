# Stripe Billing Integration - Implementation Plan

## Executive Summary

This document outlines the technical plan for integrating Stripe subscription and credit-based billing into LocalBoxs. The integration will enable automated billing for tier subscriptions (Free/Pro/Pro Plus/Enterprise) and one-time credit top-ups for API usage.

---

## 1. Current Architecture Analysis

### 1.1 Database Schema Overview

**Existing Models:**
- `User`: Contains `subscriptionTier`, `subscriptionStatus`, `subscriptionExpiresAt`
- `PricingPlan`: Stores pricing configuration for each tier
- `TierLimit`: Defines usage limits per tier
- `ApiCallLog`: Tracks API usage for billing purposes

**Missing Models:**
- No `Transaction` model for payment history
- No Stripe customer ID mapping on User
- No credit balance tracking
- No Stripe subscription ID storage

### 1.2 Authentication & Authorization

- **Auth System**: NextAuth.js with session-based authentication
- **Session Data**: User ID, role, subscriptionTier, subscriptionStatus stored in JWT
- **Middleware**: `middleware.ts` handles route protection and tier-based access control
- **Lib Locations**: 
  - `lib/auth.ts` - Authentication configuration
  - `lib/tier-access.ts` - Tier-based access control
  - `lib/usage-tracking.ts` - Usage statistics

### 1.3 Current Billing State

- **Pricing API**: `app/api/pricing/route.ts` - Returns pricing plans from DB
- **Pricing Frontend**: `app/pricing/page.tsx` - Public pricing page
- **No Payment Processing**: Currently only displays plans, no actual billing
- **No Credits System**: API usage tracked but not tied to credits

### 1.4 Environment Variables

**Location**: `lib/env.ts`

**Current Variables**:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `OPENAI_API_KEY`
- `CHATWOOT_*`, `N8N_*`, `FUSION_*`
- `SMTP_*`
- `NEXT_PUBLIC_BASE_URL`

**Required New Variables**:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## 2. Database Schema Changes

### 2.1 User Model Extensions

**File**: `prisma/schema.prisma`

**Add to User model**:
```prisma
model User {
  // ... existing fields ...
  
  // Stripe Integration
  stripeCustomerId      String?  @unique // Link to Stripe customer
  stripeSubscriptionId   String?  @unique // Active subscription ID
  creditsBalance         Int      @default(0) // Credit balance for API usage
  creditsLastUpdated     DateTime?
  
  // Relations
  transactions           Transaction[]
}
```

### 2.2 New Transaction Model

**File**: `prisma/schema.prisma`

**Add new model**:
```prisma
model Transaction {
  id                    String   @id @default(cuid())
  userId                String
  
  // Stripe Fields
  stripePaymentIntentId String?  @unique
  stripeCheckoutSessionId String? @unique
  stripeInvoiceId       String?
  
  // Transaction Details
  type                  TransactionType
  amount                Decimal  @db.Decimal(10, 2)
  currency              String   @default("USD")
  status                TransactionStatus
  
  // Product Info
  productType           String   // "subscription" | "credit_topup"
  subscriptionTier      SubscriptionTier?
  creditsPurchased      Int?
  
  // Metadata
  description           String?
  metadata              Json?    // Additional Stripe metadata
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Relations
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([stripePaymentIntentId])
  @@index([stripeCheckoutSessionId])
  @@index([status])
  @@index([createdAt])
  @@map("transactions")
}

enum TransactionType {
  SUBSCRIPTION_PAYMENT
  SUBSCRIPTION_UPGRADE
  SUBSCRIPTION_DOWNGRADE
  SUBSCRIPTION_CANCEL
  CREDIT_TOPUP
  REFUND
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

### 2.3 Migration Strategy

**Migration File**: `prisma/migrations/{timestamp}_add_stripe_billing/migration.sql`

**Steps**:
1. Add new columns to `users` table (stripeCustomerId, stripeSubscriptionId, creditsBalance, creditsLastUpdated)
2. Create `transactions` table with all fields
3. Create indexes for performance
4. Set default `creditsBalance` to 0 for existing users
5. Create unique constraints on Stripe IDs

**Rollback Strategy**: 
- Store backup before migration
- Revert transaction if migration fails
- Keep data integrity with foreign keys

---

## 3. Backend Integration

### 3.1 Stripe SDK Installation

**File**: `package.json`

**Add dependency**:
```json
{
  "dependencies": {
    "stripe": "^14.21.0"
  }
}
```

### 3.2 Stripe Client Configuration

**New File**: `lib/stripe.ts`

**Purpose**: Initialize and configure Stripe client

**Content**:
```typescript
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
```

### 3.3 API Endpoints Structure

#### 3.3.1 Create Checkout Session

**File**: `app/api/stripe/create-checkout-session/route.ts`

**Purpose**: Create Stripe Checkout session for subscriptions or credit top-ups

**Route**: `POST /api/stripe/create-checkout-session`

**Request Body**:
```typescript
{
  type: 'subscription' | 'topup',
  planId?: string, // For subscriptions (tier)
  amount?: number, // For top-ups
  currency?: string
}
```

**Logic Flow**:
1. Authenticate user via NextAuth session
2. Validate request parameters
3. If subscription mode:
   - Fetch user or create Stripe customer
   - Create Stripe subscription with price_id
   - Set metadata: userId, tier
4. If top-up mode:
   - Create one-time payment intent
   - Set metadata: userId, type: "topup"
5. Create Checkout session
6. Return session URL to frontend

**Security**:
- Verify user authentication
- Validate tier ownership (admin check)
- Rate limit (5 requests per minute per user)
- Input validation

#### 3.3.2 Webhook Handler

**File**: `app/api/stripe/webhook/route.ts`

**Route**: `POST /api/stripe/webhook`

**Purpose**: Handle Stripe webhook events

**Events to Handle**:
- `checkout.session.completed` → Activate subscription or top-up credits
- `invoice.payment_succeeded` → Record payment success
- `invoice.payment_failed` → Handle failed payment
- `customer.subscription.created` → Link subscription to user
- `customer.subscription.updated` → Handle plan changes
- `customer.subscription.deleted` → Downgrade to FREE
- `customer.subscription.trial_will_end` → Send trial ending notification

**Logic Flow**:
1. Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
2. Parse event type and data
3. Route to appropriate handler function
4. Update database (user subscription, credits, transaction)
5. Send confirmation response to Stripe

**Security**:
- Verify webhook signature before processing
- Idempotency key to prevent duplicate processing
- Log all webhook events for debugging
- Error handling with retry logic

#### 3.3.3 Customer Portal

**File**: `app/api/stripe/customer-portal/route.ts`

**Route**: `GET /api/stripe/customer-portal`

**Purpose**: Generate Stripe customer portal URL for self-service billing

**Logic Flow**:
1. Authenticate user
2. Fetch user's Stripe customer ID
3. Create portal session with return URL
4. Return portal URL

**Configuration**:
- Allow subscription cancellation
- Allow payment method updates
- Allow invoice history access
- Redirect to `/dashboard/billing` after session

#### 3.3.4 Get Billing Status

**New File**: `app/api/dashboard/billing/route.ts`

**Route**: `GET /api/dashboard/billing`

**Purpose**: Return current billing info (plan, credits, next invoice, etc.)

**Response**:
```typescript
{
  subscription: {
    tier: "PRO",
    status: "ACTIVE",
    expiresAt: "2025-01-15",
    stripeSubscriptionId: "sub_xxx"
  },
  credits: {
    balance: 500,
    usageThisMonth: 120,
    limit: 10000
  },
  invoices: [ /* recent invoices */ ]
}
```

---

## 4. Database Operations

### 4.1 Helper Functions

**New File**: `lib/stripe-db.ts`

**Purpose**: Database operations for Stripe integration

**Functions**:
```typescript
export async function getOrCreateStripeCustomer(userId: string): Promise<string>
export async function updateUserSubscription(
  userId: string, 
  subscriptionId: string, 
  tier: SubscriptionTier
): Promise<void>
export async function addCreditsToUser(userId: string, credits: number): Promise<void>
export async function deductCreditsFromUser(userId: string, credits: number): Promise<boolean>
export async function getCreditsBalance(userId: string): Promise<number>
export async function createTransaction(data: TransactionData): Promise<Transaction>
export async function getTransactionsByUser(userId: string): Promise<Transaction[]>
```

### 4.2 Integration with Existing Tier System

**Files to Modify**:
- `lib/usage-tracking.ts` - Add credit deduction logic
- `lib/tier-access.ts` - Ensure subscription status affects access
- `lib/features.ts` - Verify features respect subscription status

**Changes Needed**:
1. Before allowing API call, check and deduct credits
2. Show user credit balance in usage dashboard
3. Add tier upgrade prompts when credits low

---

## 5. Frontend Implementation

### 5.1 Billing Dashboard

**New File**: `app/dashboard/billing/page.tsx`

**Purpose**: User-facing billing management page

**Features**:
- Display current subscription tier and status
- Show credit balance and usage
- "Upgrade Plan" button
- "Add Credits" button
- "Manage Subscription" link (to Stripe portal)
- Payment history table
- Usage graphs/charts

**Layout**:
```
┌─────────────────────────────────────┐
│ Current Plan: PRO                   │
│ Status: Active until Jan 15, 2025  │
│ [Manage Subscription] [Upgrade]   │
├─────────────────────────────────────┤
│ Credits                             │
│ Balance: 500 / Limit: 10,000       │
│ [Add Credits]                       │
├─────────────────────────────────────┤
│ Payment History                     │
│ [Transaction table]                 │
└─────────────────────────────────────┘
```

### 5.2 Upgrade Flow

**New File**: `app/dashboard/billing/upgrade/page.tsx`

**Purpose**: Plan upgrade selection and checkout

**Flow**:
1. Display available plans from `/api/pricing`
2. Highlight current plan
3. Show plan comparison
4. "Select Plan" button → calls `/api/stripe/create-checkout-session`
5. Redirect to Stripe Checkout
6. On return, redirect to `/dashboard/billing/success`

### 5.3 Add Credits Flow

**New File**: `app/dashboard/billing/credits/page.tsx`

**Purpose**: One-time credit purchase

**Flow**:
1. Display credit packages (500, 1000, 5000, 10000 credits)
2. Show USD pricing per package
3. "Buy Credits" button → calls `/api/stripe/create-checkout-session` with type: "topup"
4. Redirect to Stripe Checkout
5. On return, redirect to `/dashboard/billing/success?type=credits`

### 5.4 Success/Cancel Pages

**New Files**:
- `app/dashboard/billing/success/page.tsx` - Confirmation after payment
- `app/dashboard/billing/cancel/page.tsx` - User cancelled payment

### 5.5 Usage Dashboard Enhancement

**File**: `app/dashboard/usage/page.tsx` (exists, needs update)

**Add**:
- Credit balance prominently displayed
- Cost per API call calculation
- Estimated credits remaining
- Upgrade prompt if low on credits

### 5.6 UI Components

**New Files**:
- `components/billing/credit-balance.tsx` - Reusable credit display
- `components/billing/payment-method.tsx` - Show payment method
- `components/billing/invoice-list.tsx` - Invoice history table
- `components/billing/usage-chart.tsx` - Usage visualization

---

## 6. Environment Variables

### 6.1 Required Variables

**Add to `.env.local` or environment**:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx # or sk_live_xxx for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Product/Price IDs (create in Stripe Dashboard first)
STRIPE_PRICE_ID_FREE=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_PRO_PLUS=price_xxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxx

# Credit pricing (optional, can be hardcoded)
STRIPE_PRICE_ID_CREDITS_500=price_xxx
STRIPE_PRICE_ID_CREDITS_1000=price_xxx
STRIPE_PRICE_ID_CREDITS_5000=price_xxx
STRIPE_PRICE_ID_CREDITS_10000=price_xxx
```

**Update**: `lib/env.ts`

**Add validation**:
```typescript
interface EnvConfig {
  // ... existing fields ...
  STRIPE_SECRET_KEY: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET?: string; // Optional in dev, required in prod
  STRIPE_PRICE_ID_FREE?: string;
  STRIPE_PRICE_ID_PRO?: string;
  STRIPE_PRICE_ID_PRO_PLUS?: string;
  STRIPE_PRICE_ID_ENTERPRISE?: string;
}
```

---

## 7. Stripe Dashboard Setup

### 7.1 Create Products and Prices

**Steps**:
1. Go to Stripe Dashboard → Products
2. Create product for each tier:
   - **Free**: $0/month
   - **Pro**: $X/month
   - **Pro Plus**: $Y/month
   - **Enterprise**: Custom pricing
3. Create recurring prices for each tier
4. Create one-time prices for credit packages
5. Copy Price IDs to environment variables

### 7.2 Configure Webhooks

**Steps**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 7.3 Configure Customer Portal

**Steps**:
1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Enable portal for subscriptions
3. Configure allowed actions:
   - Cancel subscriptions
   - Update payment methods
   - Download invoices
4. Set return URL: `https://your-domain.com/dashboard/billing`

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

- ✅ All API routes protected by NextAuth session
- ✅ Verify user owns subscription before modifications
- ✅ Admin routes protected by role check

### 8.2 Webhook Security

- ✅ Verify webhook signatures using `stripe.webhooks.constructEvent`
- ✅ Never trust webhook data without verification
- ✅ Implement idempotency to prevent duplicate processing

### 8.3 Rate Limiting

- ✅ Rate limit checkout session creation (5/min/user)
- ✅ Rate limit webhook endpoint (Stripe handles this)
- ✅ Rate limit customer portal access

### 8.4 Data Privacy

- ✅ Store minimal Stripe data (IDs only)
- ✅ Never store credit card details
- ✅ Encrypt sensitive metadata
- ✅ Logs should not include PII

### 8.5 Payment Security

- ✅ Server-side only: Stripe secret keys never exposed to client
- ✅ Use HTTPS for all transactions
- ✅ Validate webhook signatures
- ✅ Implement proper error handling and logging

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Test Files**:
- `lib/__tests__/stripe-db.test.ts` - Database operations
- `lib/__tests__/stripe-helpers.test.ts` - Stripe SDK wrappers

### 9.2 Integration Tests

**Test Files**:
- `app/api/stripe/__tests__/create-checkout-session.test.ts`
- `app/api/stripe/__tests__/webhook.test.ts`
- `app/api/stripe/__tests__/customer-portal.test.ts`

**Test Scenarios**:
- Create subscription checkout session
- Create credit top-up checkout session
- Handle webhook events (all event types)
- Test failed payment flow
- Test subscription cancellation
- Test tier upgrade/downgrade

### 9.3 End-to-End Tests

**Manual Testing Checklist**:
- [ ] User signs up and subscribes to PRO plan
- [ ] Webhook updates user subscription tier in DB
- [ ] User purchases credits
- [ ] Credits are deducted on API calls
- [ ] User upgrades from PRO to PRO_PLUS
- [ ] User cancels subscription, downgrades to FREE
- [ ] Payment fails, user receives notification
- [ ] Admin views all transactions

### 9.4 Stripe Test Mode

**Setup**:
- Use Stripe test keys (`sk_test_*`, `pk_test_*`)
- Use Stripe test cards:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
- Test webhooks using Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

---

## 10. Deployment Checklist

### 10.1 Pre-Deployment

- [ ] Run database migrations
- [ ] Set production Stripe keys in environment
- [ ] Configure Stripe webhook endpoint
- [ ] Test webhook receiving with Stripe CLI
- [ ] Set up monitoring and alerting
- [ ] Backup database before migration

### 10.2 Deployment Steps

1. **Run Migration**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Update Environment**:
   - Add Stripe keys to production env
   - Update webhook URL in Stripe Dashboard

3. **Deploy Application**:
   ```bash
   npm run build
   npm run start
   # or use PM2/Docker
   ```

4. **Verify Webhooks**:
   - Send test webhook from Stripe Dashboard
   - Check logs for successful processing

### 10.3 Post-Deployment

- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Check database for successful transaction records
- [ ] Test end-to-end payment flow
- [ ] Verify credit deduction works
- [ ] Test subscription upgrade/downgrade
- [ ] Set up alerts for failed payments

---

## 11. Data Flow Diagrams

### 11.1 Subscription Purchase Flow

```
User → Dashboard Billing → "Upgrade Plan"
  ↓
POST /api/stripe/create-checkout-session { type: "subscription", planId }
  ↓
Create/Get Stripe Customer
  ↓
Create Stripe Checkout Session
  ↓
Return { checkoutUrl }
  ↓
Frontend redirects to Stripe Checkout
  ↓
User completes payment
  ↓
Stripe sends webhook → /api/stripe/webhook
  ↓
Event: checkout.session.completed
  ↓
Update User: subscriptionTier, stripeSubscriptionId
  ↓
Create Transaction record
  ↓
Return 200 OK to Stripe
  ↓
User redirected to /dashboard/billing/success
```

### 11.2 Credit Top-Up Flow

```
User → Dashboard Billing → "Add Credits"
  ↓
POST /api/stripe/create-checkout-session { type: "topup", amount }
  ↓
Create Stripe Customer (if doesn't exist)
  ↓
Create Checkout Session (one-time payment)
  ↓
Return { checkoutUrl }
  ↓
Frontend redirects to Stripe Checkout
  ↓
User completes payment
  ↓
Stripe sends webhook
  ↓
Event: checkout.session.completed
  ↓
Add credits to User.creditsBalance
  ↓
Create Transaction record
  ↓
Return 200 OK
  ↓
User redirected to success page with new balance
```

### 11.3 API Call with Credit Deduction Flow

```
API Request (e.g., chat endpoint)
  ↓
Middleware checks authentication
  ↓
Check User.creditsBalance
  ↓
If creditsBalance > cost:
  ↓
Execute API call
  ↓
Deduct credits: creditsBalance -= cost
  ↓
Log call in ApiCallLog
  ↓
Return response
  ↓
else:
  ↓
Return 402 Payment Required
  ↓
Prompt user to add credits
```

### 11.4 Webhook Processing Flow

```
Stripe Event → POST /api/stripe/webhook
  ↓
Verify webhook signature
  ↓
Parse event type and data
  ↓
switch(event.type):
  ├─ checkout.session.completed
  │   ├─ If subscription → Update tier
  │   └─ If topup → Add credits
  ├─ invoice.payment_succeeded
  │   └─ Record transaction
  ├─ invoice.payment_failed
  │   └─ Notify user
  ├─ customer.subscription.deleted
  │   └─ Downgrade to FREE
  └─ customer.subscription.updated
      └─ Update tier
  ↓
Update database
  ↓
Return 200 OK to Stripe
```

---

## 12. Integration Points

### 12.1 Files to Create

**Backend**:
- `lib/stripe.ts` - Stripe client initialization
- `lib/stripe-db.ts` - Database operations for Stripe
- `app/api/stripe/create-checkout-session/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/customer-portal/route.ts`
- `app/api/dashboard/billing/route.ts`

**Frontend**:
- `app/dashboard/billing/page.tsx`
- `app/dashboard/billing/upgrade/page.tsx`
- `app/dashboard/billing/credits/page.tsx`
- `app/dashboard/billing/success/page.tsx`
- `app/dashboard/billing/cancel/page.tsx`
- `components/billing/credit-balance.tsx`
- `components/billing/payment-method.tsx`
- `components/billing/invoice-list.tsx`
- `components/billing/usage-chart.tsx`

### 12.2 Files to Modify

**Backend**:
- `prisma/schema.prisma` - Add User fields, create Transaction model
- `lib/env.ts` - Add Stripe environment variables
- `lib/usage-tracking.ts` - Add credit deduction logic
- `lib/tier-access.ts` - Enhance tier checks with subscription status
- `lib/auth.ts` - No changes needed

**Frontend**:
- `app/dashboard/usage/page.tsx` - Add credit balance display
- `components/dashboard-layout.tsx` - Add billing link in sidebar
- `components/sidebar.tsx` - Add Billing menu item

**Configuration**:
- `package.json` - Add Stripe dependency
- `.env.local` - Add Stripe keys
- Update CI/CD environment variables

### 12.3 Dependencies

**Install**:
```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

---

## 13. Migration Steps

### 13.1 Database Migration

**Step 1**: Create migration file
```bash
npx prisma migrate dev --name add_stripe_billing
```

**Step 2**: Review migration SQL
- Check `prisma/migrations/{timestamp}_add_stripe_billing/migration.sql`

**Step 3**: Apply migration
```bash
# Development
npx prisma migrate deploy

# Production (run after backup)
npx prisma migrate deploy --schema prisma/schema.prisma
```

**Step 4**: Generate Prisma Client
```bash
npx prisma generate
```

### 13.2 Data Seeding

**File**: `scripts/seed-billing.ts`

**Purpose**: Initialize Stripe-related data

```typescript
import { prisma } from '@/lib/prisma';

async function seedBilling() {
  // Set default credits for existing users
  await prisma.user.updateMany({
    where: { creditsBalance: null },
    data: { creditsBalance: 0 }
  });

  // Initialize PricingPlan records if not exists
  // ... (already handled in seed-pricing-plans.ts)
}

seedBilling();
```

---

## 14. Error Handling & Edge Cases

### 14.1 Checkout Failures

**Scenario**: User closes checkout page
- **Handle**: Show cancel page with message
- **Recovery**: Allow user to retry

### 14.2 Webhook Failures

**Scenario**: Webhook delivery fails
- **Handle**: Stripe retries automatically
- **Monitoring**: Check Stripe Dashboard for failed webhooks
- **Manual**: Reproduce event using Stripe CLI

### 14.3 Subscription Lapses

**Scenario**: Payment fails repeatedly, subscription cancels
- **Handle**: Downgrade user to FREE tier
- **Notification**: Email user about cancellation
- **Recovery**: Allow user to resubscribe

### 14.4 Credit Expiration

**Scenario**: Credits unused for X months (if implemented)
- **Decision**: Decide on expiration policy
- **Handle**: Deduct expired credits on webhook or scheduled job

### 14.5 Database Conflicts

**Scenario**: Multiple webhook events for same transaction
- **Handle**: Use idempotency key (Stripe provides)
- **Check**: Database unique constraints on Stripe IDs

---

## 15. Monitoring & Alerts

### 15.1 Key Metrics to Track

- Payment success rate
- Webhook delivery success rate
- Average credit balance per user
- Subscription churn rate
- Revenue per user (ARPU)

### 15.2 Logging

**Add to Stripe routes**:
```typescript
console.log('[Stripe Webhook]', {
  eventId: event.id,
  type: event.type,
  customer: event.data.object.customer,
  timestamp: new Date()
});
```

### 15.3 Alerts to Set Up

- Failed payment webhooks for >5 consecutive failures
- Low credit balance notifications (email to user)
- Subscription cancellation notifications
- Revenue drops >10% day-over-day

---

## 16. Rollout Strategy

### 16.1 Phased Approach

**Phase 1: Foundation (Week 1)**
- Create Transaction model
- Add Stripe fields to User model
- Set up Stripe client and configuration
- Implement basic checkout session creation
- Deploy to staging

**Phase 2: Subscriptions (Week 2)**
- Implement subscription checkout flow
- Build webhook handler for subscription events
- Add customer portal integration
- Test subscription upgrade/downgrade
- Deploy to staging

**Phase 3: Credits (Week 3)**
- Implement credit top-up flow
- Add credit balance tracking
- Integrate credit deduction with API calls
- Build billing dashboard
- Deploy to staging

**Phase 4: Polish & Production (Week 4)**
- Add billing UI components
- Test end-to-end flows
- Fix bugs and edge cases
- Load testing with Stripe test mode
- Deploy to production with feature flag

### 16.2 Feature Flag

**Control**: Enable Stripe billing behind a feature flag

```typescript
// lib/features.ts
export const STRIPE_BILLING_ENABLED = process.env.STRIPE_BILLING_ENABLED === 'true';
```

**Usage**: 
- Only show billing UI if flag enabled
- Only process webhooks if flag enabled
- Gradually roll out to user cohorts

---

## 17. Support Documentation

### 17.1 User Documentation

**Create**: `docs/USER_BILLING_GUIDE.md`

**Content**:
- How to upgrade subscription
- How to purchase credits
- How to cancel subscription
- Payment methods accepted
- Invoice history
- Credit usage tracking

### 17.2 Admin Documentation

**Create**: `docs/ADMIN_BILLING_GUIDE.md`

**Content**:
- Viewing user subscriptions
- Manual credit adjustments
- Troubleshooting failed payments
- Refund procedures
- Stripe Dashboard access

### 17.3 Developer Documentation

**Update**: `README.md`

**Content**:
- Stripe environment setup
- Webhook testing with Stripe CLI
- Database migration steps
- API endpoint documentation

---

## 18. Estimated Implementation Timeline

### 18.1 Development Timeline

- **Week 1**: Database schema, Stripe client setup, basic checkout
- **Week 2**: Webhook handling, subscription management
- **Week 3**: Credits system, billing dashboard
- **Week 4**: Testing, bug fixes, deployment

**Total**: 4 weeks for full implementation

### 18.2 Resource Allocation

- **Backend Engineer**: 80 hours
- **Frontend Engineer**: 60 hours
- **QA/Testing**: 30 hours
- **DevOps**: 10 hours

**Total**: ~180 hours

---

## 19. Success Criteria

### 19.1 Functional Requirements

- [ ] Users can upgrade to PRO/PRO_PLUS/ENTERPRISE via Stripe
- [ ] Users can purchase credits via Stripe
- [ ] Webhooks correctly update database
- [ ] Credit deduction works for API calls
- [ ] Subscription cancellation downgrades user correctly
- [ ] Billing dashboard displays accurate information
- [ ] Admin can view all transactions
- [ ] Failed payments trigger user notifications

### 19.2 Non-Functional Requirements

- [ ] Payment success rate > 95%
- [ ] Webhook processing latency < 500ms
- [ ] Checkout page load time < 2 seconds
- [ ] Zero payment data leakage
- [ ] 99.9% uptime for webhook endpoint
- [ ] Support response time for billing issues < 4 hours

---

## 20. Risk Mitigation

### 20.1 Financial Risks

**Risk**: Incorrect charges to users
**Mitigation**: 
- Comprehensive testing in Stripe test mode
- Manual review before production
- Implement refund procedures

### 20.2 Technical Risks

**Risk**: Webhook failures cause data inconsistency
**Mitigation**:
- Use idempotency keys
- Log all webhook events
- Implement manual sync tool
- Monitor webhook delivery dashboard

### 20.3 Security Risks

**Risk**: Webhook endpoint exposed without verification
**Mitigation**:
- Always verify webhook signatures
- Use HTTPS for all communication
- Never expose Stripe secret keys
- Implement rate limiting

---

## 21. Next Steps

### 21.1 Immediate Actions

1. **Review this plan** with team
2. **Approve timeline** and resource allocation
3. **Set up Stripe account** (if not exists)
4. **Create test environment** with Stripe test keys
5. **Begin Phase 1** implementation

### 21.2 Dependencies

- Stripe account with API keys
- Database access for migrations
- Environment variable management system
- Deployment pipeline access

### 21.3 Open Questions

- [ ] Should credits expire? (Recommendation: No, keep indefinitely)
- [ ] What is cost per credit? (Recommendation: $0.001 per API call)
- [ ] Should FREE tier get credits? (Recommendation: 100 credits/month)
- [ ] What is refund policy? (Recommendation: No refunds for credits, prorated for subscriptions)

---

## Appendix A: Stripe API Reference

### Products & Prices Setup

```bash
# Create products
stripe products create --name="LocalBoxs Free" --description="Free tier"
stripe products create --name="LocalBoxs Pro" --description="Pro tier"
stripe products create --name="LocalBoxs Pro Plus" --description="Pro Plus tier"

# Create recurring prices
stripe prices create \
  --product="prod_xxx" \
  --unit-amount=0 \
  --currency=usd \
  --recurring[interval]=month

# Create one-time prices for credits
stripe prices create \
  --product="prod_xxx" \
  --unit-amount=1000 \
  --currency=usd
```

### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

## Appendix B: Code Snippets

### Stripe Checkout Session Creation

```typescript
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, planId, amount } = await request.json();
  
  const customer = await getOrCreateStripeCustomer(session.user.id);
  
  const checkoutSession = await stripe.checkout.sessions.create({
    customer,
    payment_method_types: ['card'],
    line_items: type === 'subscription' 
      ? [{ price: planId, quantity: 1 }]
      : [{ price_data: {
          currency: 'usd',
          product_data: { name: 'LocalBoxs Credits' },
          unit_amount: amount,
        }, quantity: 1 }],
    mode: type === 'subscription' ? 'subscription' : 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing/success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing/cancel`,
    metadata: { userId: session.user.id, type },
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
```

### Webhook Verification

```typescript
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      // ... other events
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

---

## Document Information

- **Author**: Implementation Engineer
- **Date**: 2024
- **Version**: 1.0
- **Status**: Draft - Ready for Review
- **Last Updated**: 2024

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-12-XX | Initial draft | AI Assistant |

