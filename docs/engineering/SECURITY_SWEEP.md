# Security Sweep — CareerForge

**Audit Date:** 2026-08-24
**Standard:** OWASP Top 10 + Engineering Playbook §11

---

## Executive Summary

CareerForge has solid backend security foundations (JWT auth, rate limiting, input validation via Zod) but faces critical gaps on the frontend and in deployment configuration that must be addressed before production.

**Overall Risk Rating:** HIGH — Auth/authorization bypass vectors exist.

---

## 1. Authentication & Authorization

### ✅ Implemented (Backend)

- **JWT with refresh rotation:** Access tokens (15 min) carry `jti` claim; refresh tokens (7 days) are opaque 64-byte hex with family tracking for reuse detection (`backend/src/models/session.model.ts`)
- **Session revocation:** Password reset and admin block invalidate all sessions (`backend/src/modules/auth/`)
- **Account blocking:** `requireAuth` re-checks `is_blocked` on every request (`backend/src/middleware/auth.middleware.ts:42-53`)
- **Role-based access:** `requireRole` middleware enforces role checks on admin/recruiter routes

### ❌ Critical Gaps (Frontend)

- **No client-side route guards on admin panels:** `/admin/*` chrome renders for anonymous visitors. Backend protection depends entirely on API rejection — admin screens currently don't even make API calls, so the "Admin Panel" is fully visible.
  - **Impact:** BFLA (Broken Function Level Authorization) — anonymous users see admin UI
  - **Fix:** Add `<ProtectedRoute allowedRoles={['admin']}>` wrapper in `Frontend/src/routes/AppRoutes.tsx`

- **Token key mismatch:** Frontend stores JWT under `accessToken` (`baseApi.ts:9`) but legacy code may reference `auth_token`. The two parallel HTTP layers (RTK Query vs. old fetch helpers) need consolidation.

### ✅ Implemented (Backend Auth)

- **Password hashing:** bcryptjs with salt rounds (`backend/src/modules/auth/`)
- **Rate limiting:** Auth endpoints limited to 20 requests per 15-minute window
- **Email uniqueness:** Enforced at DB level with compound index

### ⚠️ Risk Accepted

- **Token storage in localStorage:** XSS can steal tokens. Consider httpOnly cookies for production, or document risk acceptance.

---

## 2. Input Validation

### ✅ Implemented

- **Zod v4 validation** on all API requests (`backend/src/modules/*/schemas.ts`)
- **ObjectId format validation** via regex helper in `backend/src/utils/validation.ts`
- **Request body size limit:** 1MB via `express.json({ limit: '1mb' })` (`backend/src/app.ts:25`)
- **Email validation** on registration/login endpoints

### ⚠️ Gaps

- **Frontend:** No schema validation library on forms — relies on HTML5 validation + API errors
- **No file upload validation yet:** Resume is currently a URL string, not an upload

---

## 3. Secrets & Configuration

### ✅ Implemented

- **`.env.example` exists** with all required variables documented (`backend/.env.example`)
- **Startup validation:** Zod schema validates all env vars at boot (`backend/src/config/env.ts`)
- **Fail-fast on placeholder secrets:** Production refuses to start if `JWT_SECRET` contains "change-me" (`env.ts:34-37`)
- **Secrets not logged:** Logger redacts `password`, `token`, `authorization` keys (`backend/src/utils/logger.ts`)

### ⚠️ Gaps

- **No SMTP credentials in .env.example:** Optional for dev but needed for production password resets
- **`CORS_ORIGIN` defaults to `*`:** Fine for development, must be restricted in production

---

## 4. Rate Limiting

### ✅ Implemented

- **Global rate limit:** 300 requests per 15-minute window per IP (`backend/src/app.ts:28-34`)
- **Auth-specific rate limit:** 20 requests per window on login/register endpoints
- **Health endpoints exempt:** Skip logic for `/api/health`

### ⚠️ Gaps

- **No per-user rate limiting:** Authenticated endpoints share global limit
- **No request size validation beyond JSON body limit**

---

## 5. CORS Configuration

### ✅ Implemented

- **Configurable origins:** `CORS_ORIGIN` env var supports comma-separated list or `*`
- **Credentials enabled:** `credentials: true` for cookie/auth header forwarding

### ⚠️ Gaps

- **Wildcard default:** Must restrict to specific origins in production
- **No `Vary: Origin` header management:** May cause caching issues with CDNs

---

## 6. Security Headers

### ✅ Implemented

- **Helmet.js:** Applied globally (`backend/src/app.ts:18`)
- **`x-powered-by` disabled:** `app.disable('x-powered-by')` (`app.ts:14`)
- **Trust proxy:** Configured for production (`app.ts:15`)

### Default Helmet Headers Set

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security` (production only)
- `Content-Security-Policy` (default policy)

---

## 7. File Uploads

### Current State

- **Not implemented:** Resume is a URL string field (`resume_url` in user profile)
- **No file upload endpoints exist**

### Recommendations (When Implemented)

- Allowlist MIME types (PDF, DOCX, TXT only)
- Limit file size (5MB recommended)
- Use signed URLs or move to cloud storage (S3, GCS)
- Scan uploads for malware before serving
- Store outside webroot with randomized filenames

---

## 8. Database Security

### ✅ Implemented

- **Mongoose schemas** with strict typing and required fields
- **Compound unique index** on `{student_id, job_id}` prevents duplicate applications
- **TTL index** on sessions auto-purges expired tokens
- **Sensitive fields excluded** from public queries (`toPublicUser` utility)

### ⚠️ Gaps

- **No field-level encryption** for PII (email, name, resume)
- **No database audit logging** for sensitive operations

---

## 9. Error Handling

### ✅ Implemented

- **Central error handler** (`backend/src/middleware/error.middleware.ts`)
- **Stable error codes** via `AppError` class (`backend/src/utils/errors.ts`)
- **No stack traces in production:** Unhandled errors return generic 500
- **Request ID tracking** via middleware (`backend/src/middleware/request-context.middleware.ts`)

### Error Response Shape

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Email is required",
  "details": [...],
  "requestId": "req_abc123"
}
```

---

## 10. CORS & API Security

### ✅ Implemented

- **Origin validation** via configurable whitelist
- **Credentials support** for auth headers
- **JSON body parser** with size limit

### ⚠️ Gaps

- **No API versioning** (no `/api/v1/` prefix)
- **No request signing** for webhook endpoints (not yet implemented)

---

## 11. Content Security (Frontend)

### ⚠️ Gaps

- **Tailwind loaded via CDN script tag** (`index.html`) — should use Vite plugin pipeline for production (FOUC risk, no CSP nonce)
- **No CSP nonce** for inline scripts
- **No subresource integrity** on external resources

---

## 12. Dependency Vulnerabilities

### Status

- **Not audited:** No `npm audit` in CI pipeline
- **No Dependabot/Renovate** configured

### Recommendation

Add `npm audit --audit-level=high` to CI pipeline (see `.github/workflows/ci.yml`)

---

## Priority Remediation List

| Priority | Issue | OWASP | Effort |
|----------|-------|-------|--------|
| **P0** | Add frontend route guards for admin/recruiter | A01:2021 | 2h |
| **P0** | Fix token key mismatch (consolidate HTTP layers) | A07:2021 | 4h |
| **P1** | Replace Tailwind CDN with Vite plugin | A05:2021 | 1h |
| **P1** | Restrict CORS_ORIGIN in production | A05:2021 | 0.5h |
| **P2** | Add npm audit to CI | A06:2021 | 1h |
| **P2** | Document localStorage XSS risk acceptance | A04:2021 | 0.5h |
| **P3** | Add per-user rate limiting | A04:2021 | 4h |
| **P3** | Implement file upload security (when needed) | A04:2021 | 8h |

---

## Appendix: Security Controls Matrix

| Control | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Authentication | JWT + refresh tokens | RTK Query auto-refresh | ✅ Working |
| Authorization | Role guards + ownership checks | Route guards (partial) | ⚠️ Frontend gaps |
| Input Validation | Zod schemas | HTML5 only | ⚠️ Frontend gaps |
| Rate Limiting | Global + auth-specific | N/A | ✅ Working |
| Security Headers | Helmet | CSP (partial) | ⚠️ CDN dependency |
| Error Handling | Central handler, no stack traces | ErrorBoundary component | ✅ Working |
| Secrets | Zod validation, fail-fast | N/A | ✅ Working |
| CORS | Configurable whitelist | N/A | ✅ Working |
