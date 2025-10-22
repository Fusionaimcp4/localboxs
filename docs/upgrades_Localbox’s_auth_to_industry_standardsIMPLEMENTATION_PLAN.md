
**GOALS (deliver all):**

1. Add **Google OAuth** sign-in alongside Credentials.
2. Implement **Email Verification (double-opt-in)**—block dashboard & demo creation until verified.
3. Implement **Password Reset** (secure tokens + expiry).
4. Add **Bot/Fraud defenses**: Turnstile or hCaptcha on signup (and login after N failures), **rate limiting** on auth routes, basic **disposable email domain** block + **MX DNS check**.
5. Strengthen **session & CSRF hygiene**; enforce **role/tenant** in session; log auth events.
6. Add **2FA (TOTP)** for `ADMIN`/`SUPER_ADMIN`.
7. Keep **extensibility** for adding Microsoft/GitHub later via simple env flags.
8. Provide a **testing checklist** and **env var template**.

---

## IMPLEMENTATION PLAN

### 0) Project assumptions

* Next.js (App Router or Pages—detect and adapt).
* NextAuth already present with Credentials provider.
* Prisma with `User` model and roles: `USER | ADMIN | SUPER_ADMIN`.
* PostgreSQL.
* Redis available (for rate limits & token replay, if configured). If not, use an in-memory fallback with clear TODO.

### 1) Database schema (Prisma)

Update `prisma/schema.prisma` (create migrations):

* Extend `User`:

```prisma
model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String?
  company            String?
  password           String?  // null for pure OAuth accounts
  role               UserRole @default(USER)
  tenantId           String?  // keep if already present

  // Security & UX
  isVerified         Boolean  @default(false)
  emailVerifiedAt    DateTime?
  failedLoginCount   Int      @default(0)
  lastLoginAt        DateTime?
  lastLoginIp        String?
  totpSecret         String?  // base32 TOTP secret for 2FA
  avatarUrl          String?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // NextAuth relations (Accounts/Sessions) if using adapter
  accounts           Account[]
  sessions           Session[]
}
```

* Token table for verification & reset:

```prisma
model VerificationToken {
  id          String   @id @default(cuid())
  userId      String
  tokenHash   String   // store hash, not raw token
  type        String   // 'email_verify' | 'password_reset'
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, type])
  @@index([expiresAt])
}
```

* Optional: disposable domain list:

```prisma
model BlockedEmailDomain {
  domain   String @id
  reason   String?
  createdAt DateTime @default(now())
}
```

Run `prisma migrate dev -n "auth_hardening"`.

### 2) ENV configuration

Add to `.env.example` (and document in README):

```
# NextAuth
NEXTAUTH_URL=https://app.localboxs.com
NEXTAUTH_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH_GOOGLE_ENABLED=true

# (Optional future providers)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
OAUTH_MICROSOFT_ENABLED=false

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH_GITHUB_ENABLED=false

# Email (verification & reset)
EMAIL_FROM="Localbox <no-reply@localboxs.com>"
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false

# Captcha (prefer Cloudflare Turnstile)
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
CAPTCHA_ENABLED=true

# Rate limiting
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_SIGNUP=5
RATE_LIMIT_MAX_LOGIN=10
LOCKOUT_AFTER_FAILED=5
LOCKOUT_TTL_MIN=15

# Password policy
PWNED_PASSWORDS_ENABLED=true

# App
APP_BASE_URL=https://app.localboxs.com
```

### 3) Email service

* Implement a small mailer util (`lib/mailer.ts`) using nodemailer (SMTP) with templates:

  * `emails/verify-email.html.tsx`
  * `emails/reset-password.html.tsx`
* Content: branded, minimal, includes secure link.

### 4) Token utilities

Create `lib/tokens.ts`:

* `createHashedToken()` → returns `{ rawToken, tokenHash, expiresAt }`.
* `hashToken(raw)` using `crypto.createHash('sha256')`.
* `issueVerificationToken(userId, type, ttlMs)`
* `consumeVerificationToken(userId, rawToken, type)` with constant-time compare; delete on success; check expiry.

### 5) Captcha & rate limiting

* `lib/captcha.ts` → `verifyTurnstile(token, ip)`.
* `lib/rateLimit.ts`:

  * Redis fixed-window or sliding-window.
  * Keys: `signup:${ip}`, `login:${ip}`, `login-fail:${email}`, etc.
  * If failures exceed `LOCKOUT_AFTER_FAILED`, set lock key for `LOCKOUT_TTL_MIN`.

Add middleware in API routes to enforce captcha on **signup** (always), and on **login** after `N` failures.

### 6) Password policy & breach check

* Add `lib/passwordPolicy.ts` with:

  * min length (>= 10), complexity hints (but don’t over-constrain).
  * zxcvbn score ≥ 3 (optional).
  * if `PWNED_PASSWORDS_ENABLED=true`, call haveibeenpwned k-Anon API (or TODO w/ stub).

### 7) NextAuth configuration

* In `lib/auth.ts` (or `[...nextauth].ts`):

  * Keep **Credentials** provider.
  * Add **GoogleProvider** behind `OAUTH_GOOGLE_ENABLED`.
  * In `authorize`, check:

    * email exists, password matches (bcrypt).
    * **If not `user.isVerified`**: allow login to show “verify your email” page or block dashboard—choose approach; recommended: allow sign-in but **gate protected routes**; include `isVerified` in session.
    * Increment `failedLoginCount` on failure with rate-limit lockout logic; reset on success.

* `callbacks.jwt` and `callbacks.session` must include:

  * `id`, `email`, `role`, `tenantId`, `isVerified`, `avatarUrl`, `name`.

* `events.signIn` → update `lastLoginAt`, `lastLoginIp`.

### 8) Email verification flow

* On signup (Credentials or first OAuth login with new email):

  * If the email domain is in `BlockedEmailDomain`, reject.
  * Optionally perform MX DNS check; if fails, warn/deny based on config.
  * Create user with `isVerified=false` (OAuth: set `isVerified=true` only after email is confirmed; or, if provider returns verified email, you may auto-verify but still send a welcome).
  * Issue token `type='email_verify'` (TTL 24h).
  * Send email with link:

    * `GET /auth/verify?token=<raw>&uid=<id>`

* Route: `pages/api/auth/verify-email.ts` or `app/api/auth/verify-email/route.ts`:

  * Validate token, set `isVerified=true`, `emailVerifiedAt=now`, delete token.
  * Redirect to `/auth/verified` with success message.

* Add **Resend** endpoint: `POST /api/auth/resend-verification`.

* **Gate**: middleware or server checks disallow `/dashboard` and demo creation if `!isVerified`, showing a banner with resend button.

### 9) Password reset flow

* `POST /api/auth/forgot-password` → issue `type='password_reset'` token (TTL 1h), email link `/auth/reset?token=...&uid=...`.
* Reset page validates token, applies password policy, updates `password` with bcrypt, invalidates token(s), and forces session re-login.

### 10) 2FA (TOTP) for admins

* Only for `ADMIN`/`SUPER_ADMIN` (configurable). Libraries: `otplib` or `speakeasy`.
* Endpoints:

  * `POST /api/auth/2fa/setup` → generate secret + otpauth URL; return QR data (don’t persist until verified).
  * `POST /api/auth/2fa/enable` → verify code → persist `totpSecret`.
  * `POST /api/auth/2fa/disable` (require current code).
* On sign-in:

  * If user has `totpSecret`, require TOTP step before completing session (store pre-auth state in temp cookie or server memory keyed by `jti`).

### 11) Session & CSRF hygiene

* Ensure NextAuth cookies are **httpOnly**, **Secure**, **SameSite=Lax**.
* Add **CSRF** protection to custom POST routes (anti-CSRF token via cookie/header double submit).
* Consider **short JWT lifetime with rotation** or switch to DB sessions for easier server-side invalidation.
* Never store tokens in `localStorage`.

### 12) UI/UX updates

* **Sign in** page: buttons for “Continue with Google” + form for email/password + captcha widget (conditionally).
* **Sign up** page: inputs (name, email, company, password, confirm), captcha widget.
* **Verify banner** on dashboard if `!isVerified` with “Resend email” action.
* **Forgot/Reset** pages polished, with success/error states.
* **2FA** settings card under `/settings/security` for admins.

### 13) Logging & auditing

* Log auth events (signup, login success/failure, verify, reset, 2FA enable/disable) to server console in dev; to structured logs in prod.
* Avoid logging secrets, raw tokens, or passwords.

---

## ACCEPTANCE CRITERIA (must pass)

1. **Google OAuth works** when `OAUTH_GOOGLE_ENABLED=true`; hidden when false.
2. **Email verification**:

   * Unverified users cannot access `/dashboard` or create demos.
   * Verification email sent with 24h token; link verifies successfully.
   * Resend works; old tokens invalidated on new issue.
3. **Password reset** end-to-end: request → receive email → reset with policy checks → old tokens invalidated.
4. **Captcha** enforced on signup; enforced on login after `LOCKOUT_AFTER_FAILED` attempts.
5. **Rate-limits**:

   * Signup: max `RATE_LIMIT_MAX_SIGNUP` per window per IP.
   * Login: max `RATE_LIMIT_MAX_LOGIN` per window per IP; lockout for `LOCKOUT_TTL_MIN` after repeated failures.
6. **Disposable/MX checks** reject obvious throwaways (configurable).
7. **2FA**:

   * Admin can set up TOTP, must enter code on sign-in.
   * Disable path requires current TOTP.
8. **Security**:

   * Cookies are httpOnly+Secure+SameSite=Lax.
   * CSRF protection present on custom POST routes.
   * No secrets or raw tokens logged; verification/reset tokens stored hashed.
9. **Session claims** include `id, email, role, tenantId, isVerified` and are accessible server-side.
10. **Docs** updated: env vars, migration steps, how to enable/disable providers, and how to configure SMTP & captcha.

---

## TESTING CHECKLIST

* Unit tests for token issue/consume utilities.
* E2E (or manual) flows:

  * Signup (captcha) → verification gate → verified access.
  * Login lockout after N failures; unlock after TTL.
  * Password reset works; token expiration enforced.
  * Google OAuth sign-in; JIT user provisioning; email verification policy respected.
  * Admin 2FA setup/verify/disable and enforced on next sign-in.
* Security sanity:

  * Inspect cookies.
  * CSRF token exists and is required on POST routes.
  * Rate limits throttle as configured.
  * No secret/token appears in logs or client.

---

## CODING STYLE & DELIVERABLES

* Small, focused PRs by feature (verification, reset, captcha/rate-limit, Google OAuth, 2FA).
* Clear README section: **“Auth & Security Setup”** with env, provider toggles, SMTP, captcha.
* Keep everything feature-flagged via env so we can roll out safely.

---

**Now implement the above step-by-step. Start with the Prisma migration and env scaffolding, then wire Email Verification, then Password Reset, then Google OAuth, then captcha+rate limiting, then 2FA, and finally hardening & docs.**
