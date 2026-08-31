# Security Sweep — CareerForge

**Audit Date:** 2026-08-24
**Last Review:** 2026-08-31
**Standard:** OWASP Top 10 + Engineering Playbook §11

---

## Executive Summary

CareerForge has solid backend security foundations (JWT auth, rate limiting, input validation via Zod). **All P0 security items from the original sweep have been resolved** (route guards, token consolidation, Tailwind). Remaining work is configuration (CORS) and lower-priority hardening.

**Overall Risk Rating:** MEDIUM — P0 frontend auth/authorization gaps resolved; production config still required.

---

## 1. Authentication & Authorization

### ✅ Implemented (Backend)

- **JWT with refresh rotation:** Access tokens (15 min) carry `jti` claim; refresh tokens (7 days) are opaque 64-byte hex with family tracking for reuse detection (`backend/src/models/session.model.ts`)
- **Session revocation:** Password reset and admin block invalidate all sessions (`backend/src/modules/auth/`)
- **Account blocking:** `requireAuth` re-checks `is_blocked` on every request (`backend/src/middleware/auth.middleware.ts:42-53`)
- **Role-based access:** `requireRole` middleware enforces role checks on admin/recruiter routes

### ❌ Critical Gaps (Frontend)

- **None remaining.** Original P0 items resolved:
  - **Route guards now implemented:** `<ProtectedRoute allowedRoles={['admin']}>` wraps admin routes, `PublicOnlyRoute` wraps auth routes in `AppRoutes.tsx`.
  - **Token key mismatch resolved:** Single HTTP client in `baseApi.ts` with consistent `accessToken`/`refreshToken` keys; legacy `src/services/` deleted.

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

- **No file upload AV scanning yet:** Uploads use `scanned` field but no AV scanner is wired. Plug one in before exposing files in production.
- **Frontend:** No schema validation library on forms — relies on HTML5 validation + API errors (Zod validation is used on key forms like CreateJob/CompanyProfile).

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

- **Implemented:** Resume upload via `POST /api/files/resume` (PDF/DOC/DOCX/txt, 5 MB max, MIME allowlist), stored in `UPLOAD_DIR` outside the app source, with immutable FileRecord metadata (sha256, mimetype, size, owner) and HMAC-signed time-limited download URLs.

### Remaining

- **AV scanning:** `scanned` field is set but no AV scanner is wired. Plug one in before exposing files in production.

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

### ✅ Implemented

- **Tailwind via Vite plugin:** `@tailwindcss/vite` v4.3, no CDN script tag. Satisfies CSP compliance.

### ⚠️ Gaps

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

| Priority | Issue | OWASP | Status |
|----------|-------|-------|--------|
| **P0** | Add frontend route guards for admin/recruiter | A01:2021 | ✅ Resolved (2026-08-28) |
| **P0** | Fix token key mismatch (consolidate HTTP layers) | A07:2021 | ✅ Resolved (2026-08-28) |
| **P1** | Replace Tailwind CDN with Vite plugin | A05:2021 | ✅ Resolved (2026-08-28) |
| **P1** | Restrict CORS_ORIGIN in production | A05:2021 | ⚠️ Config needed — set `CORS_ORIGIN` before deploy |
| **P2** | Add npm audit to CI | A06:2021 | ❌ Open |
| **P2** | Document localStorage XSS risk acceptance | A04:2021 | ❌ Open |
| **P3** | Add per-user rate limiting | A04:2021 | ❌ Open |
| **P3** | Wire AV scanning for file uploads | A04:2021 | ❌ Open |

---

## Appendix: Security Controls Matrix

| Control | Backend | Frontend | Status |
|---------|----------|---------|--------|
| Authentication | JWT + refresh tokens | RTK Query auto-refresh | ✅ Working |
| Authorization | Role guards + ownership checks | Route guards + role checks | ✅ Working |
| Input Validation | Zod schemas | Zod on key forms + HTML5 | ⚠️ Partial coverage |
| Rate Limiting | Global + auth-specific | N/A | ✅ Working |
| Security Headers | Helmet | CSP via Vite pipeline | ✅ Working |
| Error Handling | Central handler, no stack traces | ErrorBoundary (root-level) | ⚠️ Add per-route boundaries |
| Secrets | Zod validation, fail-fast | N/A | ✅ Working |
| CORS | Configurable whitelist | N/A | ⚠️ Restrict in prod |
