# API Contract

Base URL: `http://<host>:<port>/api` (frontend default: `http://localhost:5000/api` via `VITE_API_URL`).

## Conventions

### Response envelopes

Two envelope shapes exist because the current frontend expects both:

| Shape | Used by |
|---|---|
| `{ "data": <T>, "total": n, "page": n, "limit": n, "pages": n }` | list endpoints (jobs, applications, notifications) |
| `{ "accessToken": "...", "refreshToken": "...", "user": {...} }` (flat) | `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh` — user objects carry both `_id` and `id` |
| `{ "user": {...} }` | `GET /auth/me` |
| `{ "message": "..." }` | mutations with no payload to return |

Errors are always `{ code, message, details?, requestId? }`. The frontend displays `body.message || body.error`.

### Auth

Bearer token in `Authorization: Bearer <jwt>`. JWT payload: `{ sub: userId, role, jti }`.
Roles: `student` | `recruiter` | `admin`. Admin accounts cannot self-register.
Access tokens expire in 15 min. Refresh tokens are opaque 64-byte hex strings with 7 d TTL,
stored server-side with token-family tracking for reuse detection.

### Pagination

Query: `page` (default 1), `limit` (default 20, max 100). Lists return top-level `total/page/limit/pages`.

---

## Endpoints

### Auth — `/auth`

| Method & Path | Auth | Body / Query | Returns | Notes |
|---|---|---|---|---|
| POST `/auth/signup` | — | `{email, password(min 8), name, role}` | 201 `{accessToken, refreshToken, user}` | `role=admin` rejected; rate-limited; duplicate email → 409 CONFLICT |
| POST `/auth/login` | — | `{email, password}` | 200 `{accessToken, refreshToken, user}` | generic INVALID_CREDENTIALS on any failure (no account enumeration); blocked users → 403 ACCOUNT_BLOCKED |
| POST `/auth/refresh` | — | `{refreshToken}` | 200 `{accessToken, refreshToken, user}` | rotates refresh token; reuse detected → 401 TOKEN_REUSE_DETECTED (revokes entire family); expired/revoked → 401 INVALID_REFRESH_TOKEN |
| POST `/auth/logout` | Bearer | — | 200 `{message}` | revokes current session by `jti` claim |
| GET `/auth/me` | Bearer | — | 200 `{user}` | user without `password_hash` |
| POST `/auth/reset-password-request` | — | `{email}` | 200 `{message, devResetToken?}` | always generic response; stores SHA-256 hashed token (1 h TTL). In non-production without SMTP the raw token is returned as `devResetToken`; production omits it |
| POST `/auth/reset-password` | — | `{token, password}` | 200 `{message}` | single-use: marks token `used_at`, rehashes password, invalidates all sessions. 400 `INVALID_RESET_TOKEN` for unknown/expired/reused tokens |
| GET `/auth/verify-token` | Bearer | — | 200 | frontend only checks status code |
| POST `/auth/update-password` | Bearer | `{password}` | 200 `{message}` | authenticated password change; invalidates all sessions |
| GET `/auth/sessions` | Bearer | — | 200 `{data: [{id, user_agent, ip_address, created_at, is_current}]}` | lists active (non-revoked, non-expired) sessions |
| DELETE `/auth/sessions/:jti` | Bearer | — | 200 `{message}` | revokes a specific session by its `jti` |
| POST `/auth/logout-all` | Bearer | — | 200 `{message}` | revokes all sessions for the current user |

Reset link format consumed by the frontend: `/auth/reset-password?token=<raw>`. Email delivery
is handled by `src/services/mail/` (dev console + Nodemailer SMTP).

### Profiles — `/profiles`, `/students`

| Method & Path | Auth | Notes |
|---|---|---|
| GET `/profiles/:id` | Bearer | owner, admin, or recruiter may read |
| PATCH `/profiles/:id` | Bearer | owner or admin only; allow-list of fields (`full_name, avatar, title, bio, phone, location, skills, education, experience, resume_url, position, company_id`; `company_id` only settable by recruiters/admins and must reference an existing company) |
| GET `/students/:studentId` | Bearer | 404 if target is not a student |

### Jobs — `/jobs`

| Method & Path | Auth | Query / Body | Returns |
|---|---|---|---|
| GET `/jobs` | public | `search, location, job_type, experience_level, salary_min, salary_max, status, recruiter_id, company_id, page, limit` | paginated jobs, company populated |
| GET `/jobs/recommended` | Bearer | `studentId` (falls back to own id) | up to 10 jobs scored by skill-overlap with student profile tags/requirements, recency fallback |
| GET `/jobs/mine` | recruiter/admin | `status?, page?, limit?` — ownership forced server-side, query `recruiter_id` ignored | paginated jobs owned by caller (all statuses unless filtered) |
| POST `/jobs` | recruiter/admin | full job body | 201; recruiter must have `company_id` linked (create company → PATCH profile) |
| GET `/jobs/:jobId` | public | — | job with populated company |
| PATCH `/jobs/:jobId` | recruiter(admin)/admin | partial job body incl. `status` | ownership enforced |
| DELETE `/jobs/:jobId` | recruiter(admin)/admin | — | 204 |

Enums: `job_type`: full-time/part-time/contract/internship/remote · `experience_level`: entry/mid/senior/lead · `status`: active/closed/draft.

### Saved jobs — `/saved-jobs`

| Method & Path | Auth | Body / Query | Returns |
|---|---|---|---|
| POST `/saved-jobs` | student (self) | `{studentId, jobId}` | 201; idempotent via upsert |
| DELETE `/saved-jobs` | student (self) | `{studentId, jobId}` | 200 |
| GET `/saved-jobs/check` | Bearer | `studentId, jobId` | `{data:{saved:boolean}}` |
| GET `/saved-jobs` | Bearer | `studentId` | saved jobs with populated job+company |

### Applications — `/applications`

Status machine (enforced server-side, 422 INVALID_STATE_TRANSITION otherwise):

```
pending ──▶ reviewing ──▶ accepted
   │  \──────────▶ rejected      │
   └──▶ withdrawn                │
        withdrawn ──▶ pending (re-apply reuses the record)
accepted/rejected are terminal
```

| Method & Path | Auth | Body / Query | Returns |
|---|---|---|---|
| POST `/applications` | student (self) | `{studentId, jobId, coverLetter?, resumeUrl?}` | 201 application; increments `applicants_count`; notifies recruiter; duplicate active application → 409 |
| GET `/applications/student` | Bearer | `status?, date_from?, date_to?, page, limit` - ownership forced from token; admins may pass `?studentId=` to inspect anyone | paginated, job+student populated |
| GET `/applications/recruiter` | Bearer | `recruiterId` (must be self or admin) | all applications across recruiter's jobs |
| GET `/applications/check` | Bearer | `studentId, jobId` | `{data:{exists}}` — excludes withdrawn |
| GET `/jobs/:jobId/applications` | owning recruiter/admin | — | all applications for the job, job+student populated; 403 for any other user (was: any authenticated user — fixed) |
| GET `/applications/:id` | Bearer | — | student owner, owning recruiter, or admin |
| PATCH `/applications/:id/status` | recruiter/admin | `{status}` | validates transition + ownership; notifies student |
| PATCH `/applications/:id/withdraw` | student (self)/admin | — | decrements `applicants_count` |

### Companies — `/companies`

Full CRUD. Read is public. Write requires recruiter/admin; delete requires admin.

### Notifications — `/notifications`

| Method & Path | Auth | Notes |
|---|---|---|
| GET `/notifications?userId=&page=&limit=` | Bearer | paginated |
| POST `/notifications` | Bearer | `{userId, type, title, message, relatedId?}` |
| PATCH `/notifications/read-all` | Bearer | body `{userId}` optional |
| PATCH `/notifications/:id/read` | Bearer | |
| GET `/notifications/unread-count?userId=` | Bearer | `{data:{count}}` |
| DELETE `/notifications/:id` | Bearer | |

### Admin — `/admin` (role: admin required)

| Method & Path | Notes |
|---|---|
| GET `/admin/users?role=` | list users without hashes |
| PATCH `/admin/users/:userId/block` / `/unblock` | writes an audit record automatically |
| POST `/admin/audit-logs` | `{action, targetType, targetId, changes}` |
| GET `/admin/audit-logs?limit=` | newest first, admin name populated |
| GET `/admin/reports/users` | counts by role |
| GET `/admin/reports/applications` | counts by status |
| GET `/admin/stats` | platform totals: `{users:{total,byRole}, jobs:{total,active}, applications:{total,byStatus}, companies:{total}}` |
| GET `/admin/jobs` | `status?, search?, page?, limit?` — every job regardless of status/owner, company populated |

### Health

- `GET /api/health/live` — always 200 if process is up.
- `GET /api/health/ready` — 503 until MongoDB is reachable.

### Files (resume uploads) — `/files`

| Method & Path | Auth | Notes |
|---|---|---|
| POST `/files/resume` | Bearer | multipart field `file`; MIME allowlist (PDF / DOC / DOCX / plain text), max 5 MB. Returns `{data:{file_id, url, expires_at, duplicate}}` |
| GET `/files/:storageKey?exp=&sig=` | none | serves the stored file if the HMAC signature is valid and unexpired; 403 on tamper/expiry, 404 if unknown |

- Storage: disk under `UPLOAD_DIR` (default `uploads/`, gitignored — outside the app source).
- URLs are signed with `FILE_URL_SIGNING_SECRET` and expire after `FILE_URL_TTL_MS` (default 15 min).
- Immutable metadata is persisted in the `file_records` collection (owner, original name, mimetype, size, sha256, scanned flag).
